# backend-core

Núcleo de backend en Node.js pensado para reutilizarse como punto de partida de
una API en producción. No es un CRUD de demostración: trae resueltas las piezas
que normalmente se dejan para después — autenticación con tokens de refresco,
trazabilidad distribuida, balanceo de carga, tests de integración contra una
base de datos real y pruebas de carga automatizadas.

El frontend que consumía esta API vive en un repositorio aparte.

## Stack

| Pieza | Tecnología |
|---|---|
| Runtime | Node.js 24, TypeScript 5.9 ejecutado con `tsx` |
| HTTP | Express 5 |
| Base de datos | PostgreSQL 16 vía Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| Autenticación | JWT de acceso + refresco persistido, hashing con bcrypt |
| Balanceo | Nginx como reverse proxy sobre tres réplicas |
| Trazas | OpenTelemetry con autoinstrumentación, exportadas a Jaeger por OTLP/HTTP |
| Logs | Pino en JSON, correlacionados con la traza activa |
| Correo | Nodemailer, para recuperación de contraseña |
| Tests | Jest + Supertest (integración), Artillery (carga) |

## Arquitectura

Nginx reparte round-robin entre tres contenedores idénticos del backend. Cada
uno emite sus trazas a Jaeger, y todos comparten la misma base de datos.

```
                    ┌─────────┐
    cliente ───────▶│  nginx  │  :80
                    └────┬────┘
                         │  round-robin
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐      ┌─────────┐      ┌─────────┐
   │backend1 │      │backend2 │      │backend3 │   :3000
   └────┬────┘      └────┬────┘      └────┬────┘
        │                │                │
        ├────────────────┼────────────────┤ OTLP :4318
        │                ▼                │
        │           ┌─────────┐           │
        │           │ jaeger  │  UI :16686
        │           └─────────┘           │
        ▼                ▼                ▼
                 ┌──────────────┐
                 │  PostgreSQL  │
                 └──────────────┘
```

Correr tres réplicas no es decorativo: obliga a que el código sea *stateless*.
Cualquier sesión guardada en memoria se rompería en cuanto Nginx mandara la
siguiente petición a otra réplica, así que el estado vive en Postgres y el
`trust proxy` de Express está activado para que el rate limiting cuente la IP
real del cliente y no la del proxy.

### Organización del código

`src/` separa lo que cambia por motivos de negocio de lo que cambia por motivos
técnicos:

```
src/
├── modules/          un directorio por dominio: routes → controller → service → repository
│   ├── auth/         login, logout, refresco de tokens
│   ├── users/        registro y consulta
│   ├── password/     recuperación por correo
│   └── mail/         transporte de correo
├── infrastructure/   detalles reemplazables (cliente de Prisma)
├── middlewares/      autenticación y rate limiting
├── common/           logger, errores tipados, manejador de errores
├── utils/            helpers sin dependencias del dominio
└── test/             tests de integración y sus helpers
```

Cada módulo expone su router y esconde el resto. Un servicio no sabe de
`req`/`res`, y un repositorio es lo único que habla con Prisma, de modo que
cambiar de ORM toca una capa y no todo el módulo.

Los errores se lanzan como clases tipadas (`NotFoundError`, `ConflictError`,
`UnauthorizedError`…) y un único `errorHandler` al final de la cadena los
traduce a códigos HTTP. Los controladores no arman respuestas de error.

## Puesta en marcha

Hace falta Docker y una instancia de PostgreSQL accesible.

```bash
cp .env.example .env      # y rellenar los valores
docker compose up --build
```

Eso levanta Nginx en `http://localhost:80`, las tres réplicas y Jaeger en
`http://localhost:16686`.

Cada réplica expone `/health`, y Docker no da el servicio por levantado hasta que
las tres responden, de modo que Nginx nunca reparte hacia un contenedor que aún
no acepta peticiones.

Para desarrollo, con recarga en caliente y logs legibles:

```bash
npm install
npx prisma generate
npm run dev
```

### Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `PORT` | Puerto del proceso Node (por defecto `3000`) |
| `JWT_ACCESS` | Secreto para firmar tokens de acceso |
| `JWT_REFRESH` | Secreto para firmar tokens de refresco |
| `ACCESS_TOKEN_EXPIRATION` | Vigencia del token de acceso, p. ej. `15m` |
| `REFRESH_TOKEN_EXPIRATION` | Vigencia del token de refresco, p. ej. `7d` |
| `FRONT_URL` | Base para los enlaces de recuperación de contraseña |
| `EMAIL_USER` | Cuenta de Gmail que envía los correos |
| `EMAIL_PASSWORD` | Contraseña de aplicación de esa cuenta |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Colector OTLP (por defecto `http://localhost:4318`) |
| `OTEL_SERVICE_NAME` | Nombre del servicio en Jaeger (por defecto `txs-api`) |
| `LOG_LEVEL` | Nivel de Pino (por defecto `info`) |

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/users/register` | Registro. Con rate limit |
| `POST` | `/auth/login` | Devuelve token de acceso y de refresco. Con rate limit |
| `POST` | `/auth/refresh` | Renueva el token de acceso |
| `POST` | `/auth/logout` | Invalida el token de refresco |
| `GET` | `/users` | Lista de usuarios |
| `GET` | `/users/me` | Perfil del usuario autenticado |
| `GET` | `/users/:id` | Usuario por id |
| `POST` | `/password/forgot-password` | Envía el correo de recuperación. Con rate limit |
| `POST` | `/password/reset-password` | Fija la contraseña nueva con el token del correo |
| `GET` | `/dashboard` | Ruta de ejemplo protegida |
| `GET` | `/health` | Estado del proceso. Lo consulta el healthcheck de Docker |

Ninguna respuesta expone el hash de la contraseña.

## Observabilidad

La autoinstrumentación de OpenTelemetry se carga antes que la aplicación
(`node --import ./src/instrumentation.ts`), así que las peticiones HTTP y las
consultas a Postgres quedan trazadas sin instrumentar nada a mano.

Lo que hace útiles esas trazas es que los logs las referencian. El logger de
Pino inyecta en cada línea el `trace_id` y el `span_id` del span activo, y cada
petición arrastra su `request.id` mediante `AsyncLocalStorage`. Con eso se pasa
de un log a la traza completa de esa misma petición en Jaeger, y al revés.

El apagado del SDK está enganchado a `SIGTERM` y `SIGINT`, porque el
`BatchSpanProcessor` acumula spans y los descarga cada cinco segundos: sin ese
cierre ordenado se perdería lo pendiente al parar el contenedor.

## Tests

```bash
npm test          # unitarios y de integración
npm run test:load # prueba de carga con Artillery
```

Los tests de integración corren contra una base de datos real, no contra mocks.
Cada uno se ejecuta dentro de una transacción que se revierte al terminar
(`src/test/helpers/withTestTransaction.ts`), de modo que comparten instancia sin
contaminarse y no hace falta limpiar tablas entre tests.

La prueba de carga recorre el flujo completo — registro, login y consulta del
perfil con el token obtenido — contra Nginx, así que ejercita el balanceo de
verdad. `tests/api-load.yml` define umbrales que hacen fallar el comando si la
p99 se pasa de 300 ms o si falla más del 1 % de los usuarios virtuales. Al
terminar, `tests/delete-test-users.ts` borra los usuarios que la prueba creó.

## Integración continua

`.github/workflows/tests.yml` levanta un PostgreSQL de servicio y corre la
suite en cada push y cada pull request contra `main`.

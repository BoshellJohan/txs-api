import request from 'supertest';
import { getDb } from '../../../common/database.js';
import { hashString } from '../../../utils/bcrypt.js';
import app from '../../../app.js';
import { withTestTransaction } from '../../helpers/withTestTransaction.js';
import { createTestUser } from '../../helpers/factories/user.factory.js';

describe('POST /auth/login', () => {
    it('devuelve accessToken y refreshToken con credenciales válidas', async () => {
        await withTestTransaction(async () => {
            const email = 'prueba@gmail.com';
            const password = '123456789A*';
            const hashPassword = await hashString(password);
            await getDb().users.create({
                data: {
                    email,
                    password: hashPassword
                }
            })

            const res = await request(app).post('/auth/login').send({email, password})
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.body.data.refreshToken).toBeDefined();
        });
    });

    it('devuelve un error 401 debido al email no registrado', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const password = '123456789A*';
            const response = await request(app).post('/auth/login').send({email, password});

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        })
    });

    it('devuelve un error 401 debido a contraseña incorrecta', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com'
            await createTestUser({email, password: '123456789A*'});
            const response = await request(app).post('/auth/login').send({email, password: '123456789B*'});

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        })
    });

    it('el refresh token devuelto se guardó correctamente en la base de datos', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { user, password } = await createTestUser({email});
            
            const response = await request(app).post('/auth/login').send({email, password});
            const exist = await getDb().refreshtokens.findFirst({
                where: {
                    userid: user.userid,
                    token: response.body.data.refreshToken
                }
            });

            expect(response.statusCode).toBe(200);
            expect(exist).not.toBeNull();
        });
    });
});
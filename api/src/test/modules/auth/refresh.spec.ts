import app from "../../../app.js";
import { getDb } from "../../../common/database.js";
import { createTestUser } from "../../helpers/factories/user.factory.js";
import { generateRefreshToken } from "../../helpers/jwt.js";
import { withTestTransaction } from "../../helpers/withTestTransaction.js";
import request from 'supertest';

describe('POST /auth/refresh', () => {
    it('devuelve un access token válido', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { password } = await createTestUser({email});
            
            const responseLogin = await request(app).post('/auth/login').send({email, password});
            const refreshToken = responseLogin.body.data.refreshToken;

            const response = await request(app).post('/auth/refresh').send({refreshToken});

            expect(response.body.data).toBeDefined();
            expect(response.body.success).toBe(true);
        })
    });

    it('refresh token inexistente o inválido, retorna error 401', async () => {
        await withTestTransaction(async () => {
            const response = await request(app).post('/auth/refresh').send({refreshToken: 'token-invalido'});
            
            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    it('refresh token expirado', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { user } = await createTestUser({email});
            const token = generateRefreshToken(user, '-10s');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() - 1);
            
            await getDb().refreshtokens.create({
                data: {
                    token: token,
                    expiresat: expiresAt,
                    users: {
                        connect: {userid: user.userid}
                    },
                }
            })

            const response = await request(app).post('/auth/refresh').send({refreshToken: token});

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
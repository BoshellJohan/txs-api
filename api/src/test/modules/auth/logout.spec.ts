import app from "../../../app.js";
import { createTestUser } from "../../helpers/factories/user.factory.js";
import { withTestTransaction } from "../../helpers/withTestTransaction.js";
import request from 'supertest';


describe('POST /auth/logout', () => {
    it('sesión cerrada con token válido', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { password } = await createTestUser();
            const responseLogin = await request(app).post('/auth/login').send({email, password});
  
            const responseLogout = await request(app).post('/auth/logout').send({refreshToken: responseLogin.body.data.refreshToken});

            const responseRefresh = await request(app).post('/auth/refresh').send({refreshToken: responseLogin.body.data.refreshToken});

            expect(responseLogout.statusCode).toBe(204);
            expect(responseRefresh.statusCode).toBe(401);
        });
    });

    it('refresh token inexistente o no válido', async () => {
        await withTestTransaction(async () => {
            const responseRefresh = await request(app).post('/auth/logout').send({refreshToken: 'invalid-token'});
            expect(responseRefresh.statusCode).toBe(204);
        });
    });
})
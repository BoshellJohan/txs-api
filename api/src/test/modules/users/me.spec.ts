import app from "../../../app.js";
import { createTestUser } from "../../helpers/factories/user.factory.js";
import request from 'supertest';
import { withTestTransaction } from "../../helpers/withTestTransaction.js";

describe('GET /users/me', () => {
    it('retorna la información del usuario', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { user, password } = await createTestUser({email});
            const responseLogin = await request(app).post('/auth/login').send({email, password});
            const accessToken = responseLogin.body.data.accessToken;

            const responseUsers = await request(app).get('/users/me').set('Authorization', `Bearer ${accessToken}`);

            expect(responseUsers.body.data.email).toBe(user.email);
            expect(responseUsers.body.data.userid).toBe(user.userid);
            expect(responseUsers.body.data.role).toBe(user.role);
            expect(responseLogin.statusCode).toBe(200);
            expect(responseUsers.statusCode).toBe(200);
        });
    });

    it('token inválido', async () => {
        await withTestTransaction(async () => {
            const accessToken = 'token-invalido';
            const response = await request(app).get('/users/me').set('Authorization', `Bearer ${accessToken}`);

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    it('sin token', async () => {
        await withTestTransaction(async () => {
            const response = await request(app).get('/users/me');
            
            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
})
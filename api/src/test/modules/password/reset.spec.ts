jest.mock('../../../modules/mail/mail.service.js');

import app from "../../../app.js";
import { sendPasswordResetEmail } from "../../../modules/mail/mail.service.js";
import { createTestUser } from "../../helpers/factories/user.factory.js";
import { withTestTransaction } from "../../helpers/withTestTransaction.js";
import request from 'supertest';

describe('POST /password/reset', () => {
    it('token válido', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            await createTestUser({email});
            await request(app).post('/password/forgot-password').send({email});
            
            const sendPasswordResetEmailFn = jest.mocked(sendPasswordResetEmail)
            const token = sendPasswordResetEmailFn.mock.calls[0][1]; //Segundo argumento de sendPasswordResetEmail

            const newPassword = '123456789A*';
            const responseReset = await request(app).post('/password/reset-password').send({passwordToken: token, newPassword});

            const responseLogin = await request(app).post('/auth/login').send({email, password: newPassword});

            expect(responseReset.statusCode).toBe(204);
            expect(responseLogin.statusCode).toBe(200);
        });
    });

    it('token inválido o expirado', async () => {
        await withTestTransaction(async () => {
            const token = 'token-invalido';
            const response = await request(app).post('/password/reset-password').send({passwordToken: token});

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});
jest.mock('../../../modules/mail/mail.service.js');

import { sendPasswordResetEmail } from '../../../modules/mail/mail.service.js';

import request from 'supertest';
import { withTestTransaction } from "../../helpers/withTestTransaction.js";
import { createTestUser } from "../../helpers/factories/user.factory.js";
import app from '../../../app.js';
import { getDb } from '../../../common/database.js';

describe('POST /password/forgot-password', () => {
    it('email inexistente', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';

            const response = await request(app).post('/password/forgot-password').send({email});

            expect(response.statusCode).toBe(204);
            expect(sendPasswordResetEmail).toHaveBeenCalledTimes(0);
        });
    });

    it('email existente', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            await createTestUser({email});

            const response = await request(app).post('/password/forgot-password').send({email});
            const user = await getDb().users.findUnique({where: {email}});

            expect(response.statusCode).toBe(204);
            expect(sendPasswordResetEmail).toHaveBeenCalledWith(email, expect.any(String));
            expect(user?.passwordrecoveryexpires).toBeDefined();
            expect(user?.passwordrecoverytoken).toBeDefined();
        });
    });
});
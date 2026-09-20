import app from "../../../app.js";
import { createTestUser } from "../../helpers/factories/user.factory.js";
import { withTestTransaction } from "../../helpers/withTestTransaction.js";
import request from 'supertest';

describe('GET /users/:id', () => {
    it('es administrador y el id existe', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { password, user } = await createTestUser({email, role: 'admin'});
            const responseLogin = await request(app).post('/auth/login').send({email, password});

            const responseUsers = await request(app).get(`/users/${user.userid}`).set('Authorization', `Bearer ${responseLogin.body.data.accessToken}`);

            expect(responseUsers.body.data.userid).toBeDefined();
            expect(responseUsers.body.data.email).toBeDefined();
            expect(responseUsers.body.data.role).toBeDefined();
            expect(user.role).toBe('admin');
        });
    });

    it('es administrador y el id no existe', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { password, user } = await createTestUser({email, role: 'admin'});
            const responseLogin = await request(app).post('/auth/login').send({email, password});
            const responseUsers = await request(app).get(`/users/990000`).set('Authorization', `Bearer ${responseLogin.body.data.accessToken}`);

            expect(user.role).toBe('admin');
            expect(responseUsers.statusCode).toBe(404);
            expect(responseUsers.body.success).toBe(false);
        });
    });

    it('no es administrador', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { password } = await createTestUser({email, role: 'applicant'});
            const responseLogin = await request(app).post('/auth/login').send({email, password});
            const responseUsers = await request(app).get(`/users/1`).set('Authorization', `Bearer ${responseLogin.body.data.accessToken}`);

            expect(responseUsers.statusCode).toBe(403);
            expect(responseUsers.body.success).toBe(false);
        })
    });

    it('id no numérico', async () => {
        await withTestTransaction(async () => {
            const email = 'test@gmail.com';
            const { password } = await createTestUser({email, role: 'admin'});
            const responseLogin = await request(app).post('/auth/login').send({email, password});
            const responseUsers = await request(app).get(`/users/abc`).set('Authorization', `Bearer ${responseLogin.body.data.accessToken}`);

            expect(responseUsers.statusCode).toBe(400);
            expect(responseUsers.body.success).toBe(false);
        })
    });
});
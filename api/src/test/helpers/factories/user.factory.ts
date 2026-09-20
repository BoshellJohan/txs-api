import { getDb } from "../../../common/database.js";
import { hashString } from "../../../utils/bcrypt.js";

export async function createTestUser( overrides: {
    email?: string,
    password?: string,
    role?: 'applicant' | 'investor' | 'admin' 
} = {}) {
    const email = overrides.email ?? 'test@gmail.com';
    const password = overrides.password ?? '123456789A*';
    const hashPassword = await hashString(password);

    const user = await getDb().users.create({
        data: {email, password: hashPassword, role: overrides.role}
    });

    return { user, password };
}
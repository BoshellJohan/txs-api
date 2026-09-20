import 'dotenv/config';
import { prisma } from "../src/infrastructure/database/prisma/prisma.client.js";

async function deleteTestUsers() {
    try {
        const deletedRefreshTokensCount = await prisma.$executeRaw`DELETE from refreshtokens
        WHERE userid IN (SELECT userid from users where email LIKE '%@test.com')`;
    
        const deletedUsersCount = await prisma.$executeRaw`DELETE from users
        WHERE email LIKE '%@test.com'`;
    
        console.log(`Borradas ${deletedRefreshTokensCount} filas de la tabla refresh tokens`);
    
        console.log(`Borradas ${deletedUsersCount} filas de la tabla users`);
    } finally {
        await prisma.$disconnect();
    }
}

await deleteTestUsers();
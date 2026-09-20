import { runDb } from "../../common/database.js";
import { prisma } from "../../infrastructure/database/prisma/prisma.client.js";

class RollbackError extends Error {
    constructor(message: string = 'Rollback DB'){
        super(message);
        this.name = 'RollbackError'
    }
}

export async function withTestTransaction(test: () => Promise<void>){
    try {
        await prisma.$transaction(async (tx) => {
            await runDb(tx, () => test());
            throw new RollbackError();
        });
        return;
    } catch (error) {
        if(error instanceof RollbackError){
            return;
        }
        throw error;
    }
}
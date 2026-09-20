import { AsyncLocalStorage } from "node:async_hooks";
import { prisma } from "../infrastructure/database/prisma/prisma.client.js";
import { Prisma, PrismaClient } from "../generated/prisma/client.js";

const asyncLocalStorage = new AsyncLocalStorage<PrismaClient | Prisma.TransactionClient>();

export function getDb() {
    return asyncLocalStorage.getStore() ?? prisma;
}

export function runDb<T>(db: PrismaClient | Prisma.TransactionClient, callback: () => T): T {
    return asyncLocalStorage.run(db, callback)
}
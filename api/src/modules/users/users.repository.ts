import { getDb } from "../../common/database.js";
import { ConflictError } from "../../common/errors/ConflictError.js";
import { isUniqueConstraintError } from "../../infrastructure/database/prisma/prisma.errors.js";
import { RegisterType } from "./types/users.type.js";

class UsersRepository {
    async findAll(){
        return await getDb().users.findMany({
            select: {
                userid: true,
                email: true,
                role: true
            }
        });
    }

    async findByEmail(email: string){
        return await getDb().users.findUnique(
            {
                where: {email: email},
                select: {
                    userid: true,
                    email: true,
                    role: true,
                    password: true
                }
            }
        );
    }

    async findById(id: number){
        return await getDb().users.findUnique(
            {
                where: {userid: id},
                select: {
                    userid: true,
                    email: true,
                    role: true
                }
            }
        );
    }

    async createUser(body: RegisterType, hashPassword: string){
        try {
            return await getDb().users.create({
                data: {
                    email: body.email,
                    password: hashPassword
                }
            });
        } catch (error) {
            if(isUniqueConstraintError(error)){
                throw new ConflictError('Email already registered');
            }

            throw error;
        }
    }
}

export default new UsersRepository();


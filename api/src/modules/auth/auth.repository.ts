import { getDb } from "../../common/database.js";
import { AddTokenType } from "./types/auth.types.js";

class AuthRepository {
    async addRefreshToken(body: AddTokenType){
        return await getDb().refreshtokens.create({
            data: {
                token: body.token,
                createdat: new Date(),
                expiresat: body.expiresAt,
                users: {
                    connect: {userid: body.id}
                }
            }
        });
    }

    async clearRefreshToken(token: string){
        await getDb().refreshtokens.updateMany({
            where: {
                token: token
            },
            data: {
                active: 0
            }
        })
        return;
    }

    async getUserByRefreshToken(token: string){
        const record = await getDb().refreshtokens.findFirst({
            where: {
                token,
                active: 1,
            },
            include: {
                users: true
            }
        });

        return record?.users ? record : null;
    }
}

export default new AuthRepository();
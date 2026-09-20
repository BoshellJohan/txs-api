import { createHash, generateToken } from "../../utils/crypto.js";
import { sendPasswordResetEmail } from "../mail/mail.service.js";
import usersService from "../users/users.service.js";
import passwordRepository from "./password.repository.js";
import { ResetPasswordType } from "./types/password.type.js";
import { NotFoundError } from "../../common/errors/NotFoundError.js";
import { hashString } from "../../utils/bcrypt.js";
import { BadRequestError } from "../../common/errors/BadRequestError.js";
import { getLogger } from "../../common/logger.js";

class PasswordService {
    async forgotPassword(email: string){
        try {
            await usersService.getUserByEmail(email);
            const { token, hash } = generateToken();
            
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 20);

            await passwordRepository.updatePasswordRecovery(email, hash, expiresAt);
            await sendPasswordResetEmail(email, token);
            return;
        } catch (error){
            if(error instanceof NotFoundError){
                return;
            }

            getLogger().error({ err: error }, 'failed to process forgot password request');
            return;
        }
    }

    async resetPassword(body: ResetPasswordType){
        const hashed = createHash(body.passwordToken);
        const email = await passwordRepository.checkPasswordRecovery(hashed)
        if(!email) throw new BadRequestError('Invalid request');
        
        const passwordHashed = await hashString(body.newPassword);
        await passwordRepository.updatePassword(email, passwordHashed);
        return;
    }
}

export default new PasswordService();
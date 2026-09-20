import { ResetPasswordDto } from './dtos/password.dto.js';
import passwordService from './password.service.js'
import {Request, Response} from 'express';

class PasswordController {
    async forgotPassword(req: Request, res: Response){
        const { email } = req.body;
        await passwordService.forgotPassword(email);
        return res.sendStatus(204);
    }

    async resetPassword(req: Request, res: Response){
        const body: ResetPasswordDto = req.body;
        await passwordService.resetPassword(body);
        return res.sendStatus(204);
    }
}

export default new PasswordController();
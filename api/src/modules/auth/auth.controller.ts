import { Request, Response } from 'express';
import authService from './auth.service.js';
import { LoginDto } from './types/auth.types.js';


class AuthController {
    async login(req: Request, res: Response){
        const credentials: LoginDto = req.body;
        return res.status(200).json({
            success: true,
            data: await authService.login(credentials)
        }); 
    }

    async logout(req: Request, res: Response){
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        return res.sendStatus(204);
    }

    async refresh(req: Request, res: Response){
        const { refreshToken } = req.body;
        const accessToken = await authService.refresh(refreshToken);    
        return res.status(200).json({
            success: true,
            data: accessToken
        })
    }
}

export default new AuthController();
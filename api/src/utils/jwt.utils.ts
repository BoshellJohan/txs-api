import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { UserType } from '../modules/users/types/users.type.js';
import { IJwtPayload, IJwtRefreshPayload } from '../types/jwt.type.js';
import { env } from '../config/env.js';

class JwtUtils {
    generateAccessToken(user: UserType){
        const payload: IJwtPayload = {
            _id: user.userid.toString(),
            email: user.email,
            role: user.role
        }

        const secret = env.JWT_ACCESS!;

        const options: SignOptions = {
            expiresIn: env.ACCESS_TOKEN_EXPIRATION as SignOptions['expiresIn']
        }
        return jwt.sign(payload, secret, options);
    }

    generateRefreshToken(user: UserType){
        const payload: IJwtRefreshPayload = {
            _id: user.userid.toString(),
            email: user.email
        }

        const secret = env.JWT_REFRESH!;

        const options: SignOptions = {
            expiresIn: env.REFRESH_TOKEN_EXPIRATION as SignOptions['expiresIn']
        }
        
        return jwt.sign(payload, secret, options);
    }

    verifyJwtToken(token: string){
        const secret = env.JWT_REFRESH!;
        return jwt.verify(token, secret);
    }
}

export default new JwtUtils();
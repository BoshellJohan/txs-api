import jwt, { SignOptions } from "jsonwebtoken";

export type UserType = {
    userid: number;
    email: string;
    role: string;
}

interface IJwtPayload {
    _id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export function generateRefreshToken(user: UserType, expiresIn: string = '15m'){
    const payload: IJwtPayload = {
        _id: user.userid.toString(),
        email: user.email,
        role: user.role
    }

    const secret = process.env.JWT_REFRESH!;

    const options: SignOptions = {
        expiresIn: expiresIn as SignOptions['expiresIn']
    }
    return jwt.sign(payload, secret, options);
}
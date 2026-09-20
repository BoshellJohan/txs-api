export interface IJwtPayload {
    _id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface IJwtRefreshPayload {
    _id: string;
    email: string;
    iat?: number;
    exp?: number;
}
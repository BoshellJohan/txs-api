export type LoginDto = {
    email: string;
    password: string;
}

export type AddTokenType = {
    token: string;
    id: number;
    expiresAt: Date;
}
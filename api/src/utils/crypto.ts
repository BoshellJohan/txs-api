import crypto from 'crypto';

export function generateToken(){
    const token = crypto.randomBytes(32).toString('hex');
    const hash = createHash(token);

    return {
        token,
        hash
    }
};

export function createHash(token: string){
    return crypto.createHash('sha256').update(token).digest('hex');
}
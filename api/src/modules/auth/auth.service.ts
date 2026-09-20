import { AddTokenType, LoginDto } from './types/auth.types.js';
import usersService from '../users/users.service.js';
import { compareHashes } from '../../utils/bcrypt.js';
import jwtUtils from '../../utils/jwt.utils.js';
import authRepository from './auth.repository.js';
import { UnauthorizedError } from '../../common/errors/UnauthorizedError.js';
import { NotFoundError } from '../../common/errors/NotFoundError.js';
import { getLogger } from '../../common/logger.js';
import { tracer } from '../../common/tracer.js';
import { SpanStatusCode } from '@opentelemetry/api';
import jsonwebtoken from 'jsonwebtoken';

class AuthService {
    async login(credentials: LoginDto) {
        return tracer.startActiveSpan('auth.login', async (span) => {
            try {
                const user = await usersService.getUserByEmail(credentials.email);
    
                const isValidPassword = await compareHashes(credentials.password, user.password);
                if(!isValidPassword){
                    getLogger().warn({ 'user.id': user.userid }, 'failed login attempt');
                    throw new UnauthorizedError('Invalid credentials or user does not exist');
                }
                
                span.setAttribute('userid', user.userid);
                const accessToken = jwtUtils.generateAccessToken(user);
                const refreshToken = jwtUtils.generateRefreshToken(user);
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 8);
                
                const refreshData: AddTokenType = {id: user.userid, token: refreshToken, expiresAt};
                await authRepository.addRefreshToken(refreshData);
    
                return {
                    accessToken,
                    refreshToken
                };
    
            } catch (error){
                if(error instanceof NotFoundError){
                    throw new UnauthorizedError('Invalid credentials or user does not exist');
                }

                if(error instanceof Error){
                    span.recordException(error);
                    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
                } else {
                    span.setStatus({ code: SpanStatusCode.ERROR, message: 'Error while logging in'});
                }
    
                throw error;
            } finally {
                span.end();
            }
        });
    }

    async logout(token: string): Promise<void> {
        return await authRepository.clearRefreshToken(token);
    }

    async refresh(token: string): Promise<string> {
        try {
            const response = await authRepository.getUserByRefreshToken(token);
        
            if(!response?.users) throw new UnauthorizedError('Invalid credentials');

            jwtUtils.verifyJwtToken(response.token);
            return jwtUtils.generateAccessToken(response.users);
        } catch (error) {
            if(error instanceof jsonwebtoken.JsonWebTokenError){
                throw new UnauthorizedError('Invalid token');
            }
            
            throw error;
        }
    }
}

export default new AuthService();
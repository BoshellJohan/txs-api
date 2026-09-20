import express from 'express';
const router = express.Router();

import authController from './auth.controller.js';
import { loginLimiter } from '../../middlewares/rate-limiters.middleware.js';
import { validateMiddleware } from '../../middlewares/validate.middleware.js';
import { loginSchema } from './schemas/auth.schemas.js';

router.post('/login', [loginLimiter, validateMiddleware(loginSchema)], authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

export default router;
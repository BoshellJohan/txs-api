import express from 'express';
import passwordController from './password.controller.js';
import { forgotPasswordLimiter } from '../../middlewares/rate-limiters.middleware.js';
const router = express.Router();

router.post('/forgot-password', forgotPasswordLimiter, passwordController.forgotPassword);
router.post('/reset-password', passwordController.resetPassword);
export default router;
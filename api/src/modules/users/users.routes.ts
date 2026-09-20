import express from 'express';
import usersController from './users.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { registerLimiter } from '../../middlewares/rate-limiters.middleware.js';
import { registerSchema } from './schemas/users.schemas.js';
import { validateMiddleware } from '../../middlewares/validate.middleware.js';
const router = express.Router();

router.get('', [authMiddleware, roleMiddleware('admin')], usersController.users);
router.get('/me', [authMiddleware], usersController.user);
router.get('/:id', [authMiddleware, roleMiddleware('admin')], usersController.userById);
router.post('/register', [registerLimiter, validateMiddleware(registerSchema)], usersController.signup)

export default router;
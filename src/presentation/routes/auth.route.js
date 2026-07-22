import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);

export default router;
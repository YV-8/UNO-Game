import { Router } from 'express';
import * as gamePlayerController from '../controllers/gamePlayer.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/:id/join', protect, gamePlayerController.join);
router.post('/:id/leave', protect, gamePlayerController.leave);

export default router;
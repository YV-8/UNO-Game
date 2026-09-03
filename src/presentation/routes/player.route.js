import { Router } from 'express';
import * as playerController from '../controllers/player.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', playerController.getAllPlayer);
router.delete('/:id', playerController.deletePlayer);
router.get('/:id', playerController.getPlayerById);
router.put('/:id', authenticate, playerController.updatePlayer);

export default router;
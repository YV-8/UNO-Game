import { Router } from 'express';
import * as playerController from '../controllers/player.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', playerController.getAllPlayer);
router.delete('/:id', playerController.deletePlayer);
router.get('/:id', playerController.getPlayerById);
router.put('/:id', playerController.updatePlayer);

export default router;
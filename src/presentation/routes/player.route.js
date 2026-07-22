import { Router } from 'express';
import * as playerController from '../controllers/player.controller.js';

const router = Router();

router.get('/', playerController.getAllPlayer);
router.get('/:id', playerController.getPlayerById);
router.put('/:id', playerController.updatePlayer);
router.delete('/:id', playerController.deletePlayer);

export default router;
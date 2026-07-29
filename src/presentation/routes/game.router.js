import { Router } from 'express';
import * as getController from '../controllers/game.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getController.getAllGame);
router.get('/:id', getController.getGameById);
router.post('/', getController.createGame);
router.put('/:id', getController.updateGame);
router.delete('/:id', getController.deleteGame);
router.get('/:id/state', getController.getGameState);
router.get('/:id/players', getController.getGamePlayers);
router.get('/:id/current-player', getController.getCurrentPlayer);
router.post('/:id/start', protect, getController.startGame);
router.post('/:id/end', protect, getController.endGame);

export default router;
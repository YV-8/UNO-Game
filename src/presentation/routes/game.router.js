import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', gameController.getAllGame);
router.get('/:id', gameController.getGameById);
router.delete('/:id',gameController.deleteGame);

router.post('/', gameController.createGame);
router.put('/:id', gameController.updateGame);

router.post('/state',gameController.getGameState);
router.post('/players',gameController.getGamePlayers);
router.post('/current-player', gameController.getCurrentPlayer);
router.post('/scores', gameController.getGameScores);
router.post('/top-card', gameController.getTopCard);

router.post('/join', gameController.join);
router.post('/leave', gameController.leave);
router.post('/start', gameController.startGame);
router.post('/end', gameController.endGame);
router.put('/:id/play', gameController.playCard);
router.get('/:id/hand', gameController.getMyHand);
router.put('/:id/draw', gameController.drawCard);
router.get('/:id/state', gameController.getGameOverview);

export default router;
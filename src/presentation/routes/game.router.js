import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';

const router = Router();

router.get('/', gameController.getAllGame);
router.get('/id', gameController.getGameById);
router.post('/', gameController.createGame);
router.put('/', gameController.updateGame);
router.delete('/', gameController.deleteGame);

router.post('/state', gameController.getGameState);
router.post('/players', gameController.getGamePlayers);
router.post('/current-player', gameController.getCurrentPlayer);
router.post('/scores', gameController.getGameScores);

router.post('/join', gameController.join);
router.post('/leave', gameController.leave);
router.post('/start', gameController.startGame);
router.post('/end', gameController.endGame);

export default router;
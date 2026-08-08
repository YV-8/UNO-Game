import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', gameController.getAllGame);
router.get('/id', gameController.getGameById);
router.delete('/:id', gameController.deleteGame);

router.post('/',authenticate, gameController.createGame);
router.put('/:id',authenticate, gameController.updateGame);

router.post('/state',authenticate, gameController.getGameState);
router.post('/players',authenticate, gameController.getGamePlayers);
router.post('/current-player',authenticate, gameController.getCurrentPlayer);
router.post('/scores',authenticate, gameController.getGameScores);

router.post('/join',authenticate, gameController.join);
router.post('/leave',authenticate, gameController.leave);
router.post('/start',authenticate, gameController.startGame);
router.post('/end',authenticate, gameController.endGame);

export default router;
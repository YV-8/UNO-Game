import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { memoizationMiddleware } from '../../middlewares/memoizationMiddleware.js';

const gameListCache = memoizationMiddleware({ max: 30, maxAge: 30000 });


const router = Router();
router.use(authenticate);

router.get('/', gameListCache, gameController.getAllGame);
router.get('/:id', gameListCache, gameController.getGameById);
router.delete('/:id', gameController.deleteGame);

router.post('/', gameController.createGame);
router.put('/:id', gameController.updateGame);

router.post('/state', gameController.getGameState);
router.post('/players', gameController.getGamePlayers);
router.post('/current-player', gameController.getCurrentPlayer);
router.post('/:id/scores', gameController.getGameScore);
router.post('/top-card', gameController.getTopCard);

router.post('/join', gameController.join);
router.post('/leave', gameController.leave);
router.post('/start', gameController.startGame);
router.post('/end', gameController.endGame);
router.put('/:id/play', gameController.playCard);
router.get('/:id/hand', gameController.getMyHand);
router.get('/:id/suggest', gameController.getSuggestedCard);
router.put('/:id/draw', gameController.drawCard);
router.get('/:id/state', gameController.getGameOverview);
router.get('/:id/history', gameController.getGameRegistry);
router.put('/:id/say-uno', gameController.sayUno);
router.put('/:id/challenge-uno', gameController.challengeUno);

export default router;
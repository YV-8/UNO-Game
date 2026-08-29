import { Router } from 'express';
import * as gameController from '../controllers/game.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { memoizationMiddleware } from '../../middlewares/memoizationMiddleware.js';

const liveGameCache = memoizationMiddleware({ max: 100, maxAge: 5000 });
const gameListCache = memoizationMiddleware({ max: 30, maxAge: 30000 });


const router = Router();
router.use(authenticate);

router.get('/',gameListCache, gameController.getAllGame);
router.get('/:id',gameListCache, gameController.getGameById);
router.delete('/:id',gameController.deleteGame);

router.post('/', gameController.createGame);
router.put('/:id', gameController.updateGame);

router.post('/state', liveGameCache, gameController.getGameState);
router.post('/players', liveGameCache, gameController.getGamePlayers);
router.post('/current-player', liveGameCache, gameController.getCurrentPlayer);
router.post('/:id/scores', liveGameCache, gameController.getGameScore);
router.post('/top-card', liveGameCache, gameController.getTopCard);

router.post('/join', gameController.join);
router.post('/leave', gameController.leave);
router.post('/start', gameController.startGame);
router.post('/end', gameController.endGame);
router.put('/:id/play', gameController.playCard);
router.get('/:id/hand', gameController.getMyHand);
router.put('/:id/draw', gameController.drawCard);
router.get('/:id/state', liveGameCache, gameController.getGameOverview);
router.get('/:id/history', liveGameCache, gameController.getGameRegistry);
router.put('/:id/say-uno', gameController.sayUno);
router.put('/:id/challenge-uno', gameController.challengeUno);

export default router;
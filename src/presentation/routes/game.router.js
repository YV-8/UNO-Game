import { Router } from 'express';
import { getController} from '../controllers/game.controller.js';

const router = Router();

router.get('/', getController.getAllGame);
router.get('/:id', getController.getGameById);
router.post('/', getController.createGame);
router.put('/:id', getController.updateGame);
router.delete('/:id', getController.deleteGame);

export default router;
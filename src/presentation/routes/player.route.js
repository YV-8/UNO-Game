import { Router } from 'express';
import playerController from '../Controllers/PlayerController.js';

const router = Router();

router.post('/', playerController.createPlayer);
router.get('/', playerController.getAllPlayer);
router.get('/:id', playerController.getPlayerById);
router.put('/:id', playerController.updatePlayer);
router.delete('/:id', playerController.deletePlayer);
 
export default router;
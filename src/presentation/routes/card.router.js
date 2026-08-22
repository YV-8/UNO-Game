import { Router } from 'express';
import * as cardsController from '../controllers/card.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', cardsController.getAllCards);
router.get('/:id',cardsController.getCardById);
router.delete('/:id', cardsController.deleteCard);
router.post('/', authenticate,cardsController.createCard);
router.put('/:id',authenticate, cardsController.updateCard);

export default router;
import { Router } from 'express';
import * as cardsController from '../controllers/cards.controller.js';

const router = Router();

router.get('/', cardsController.getAllCards);
router.get('/:id', cardsController.getCardById);
router.post('/', cardsController.createCard);
router.put('/:id', cardsController.updateCard);
router.delete('/:id', cardsController.deleteCard);


router.get('/top-card', cardsController.getTopCard);

export default router;
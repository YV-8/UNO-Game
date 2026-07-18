import { Router } from 'express';
import { cardsController} from '../controllers/card.controller.js';

const router = Router();

router.get('/', cardsController.getAllCards);
router.get('/:id', cardsController.getCardById);
router.post('/', cardsController.createCard);
router.put('/:id', cardsController.updateCard);
router.delete('/:id', cardsController.deleteCard);

export default router;
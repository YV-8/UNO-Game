import { Router } from 'express';
import * as statsController from '../controllers/stats.controller.js';

const router = Router();

router.get('/requests', statsController.getRequestStats);
router.get('/response-times', statsController.getResponseTimeStats);
router.get('/status-codes', statsController.getStatusCodeStats);
router.get('/popular-endpoints', statsController.getPopularEndpoints);

export default router;
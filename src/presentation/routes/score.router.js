import { Router } from "express";
import * as scoreController from "../controllers/score.controller.js";
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticate);
router.get("/", scoreController.getAllScore);
router.get("/:id", scoreController.getScoreById);
router.delete("/:id", scoreController.deleteScore);

router.post("/", scoreController.createScore);
router.put("/:id", scoreController.updateScore);
export default router;

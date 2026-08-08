import { Router } from "express";
import * as scoreController from "../controllers/score.controller.js";
import { authenticate } from '../../middlewares/auth.middleware.js';

const route = Router();
route.get("/", scoreController.getAllScore);
route.get("/:id", scoreController.getScoreById);
route.delete("/:id", scoreController.deleteScore);

route.post("/", authenticate,scoreController.createScore);
route.put("/:id", authenticate,scoreController.updateScore);
export default route;

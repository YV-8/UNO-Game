import { Router } from "express";
import * as scoreController from "../controllers/score.controller.js";

const route = Router();
route.get("/", scoreController.getAllScore);
route.get("/:id", scoreController.getScoreById);
route.post("/", scoreController.createScore);
route.put("/:id", scoreController.updateScore);
route.delete("/:id", scoreController.deleteScore);
export default route;

import { Router } from "express";
import { scoreController} from "../controllers/score.controller";

const route = route();
route.get("/", scoreController.getScore);
route.get("/:id", scoreController.getScoreById);
route.post("/", scoreController.createScore);
route.put("/:id", scoreController.updateScore);
route.delete("/:id", scoreController.deleteScore);
export default route;

import { Rotuer, Router } from "express";
import { getPlayer, getPlayerById, createPlayer, updatePlayer, deletePlayer, patchPlayer} from "../controllers/players.controller";

const router = Router();
router.get("/", getPlayer);
router.get("/:id", getPlayerById);
router.post("/:id", createPlayer);
router.put("/:id", updatePlayer);
router.patch("/:id", patchPlayer);
router.delete("/:id", deletePlayer);
export default router;

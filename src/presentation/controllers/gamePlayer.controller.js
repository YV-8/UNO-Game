import * as GamePlayerService from '../../logic/services/gamePlayer.service.js';
import { sendSuccess } from '../../helpers/responseHandler.middleware.js';

export const join = async (req, res, next) => {
    try {
        const { id } = req.params;
        await GamePlayerService.joinGame({
            gameId: id,
            playerId: req.player.id,
            username: req.player.username,
        });
        return sendSuccess(res, 200, 'User joined the game successfully');
    } catch (error) {
        next(error);
    }
};

export const leave = async (req, res, next) => {
    try {
        const { id } = req.params;
        await GamePlayerService.leaveGame({
            gameId:id,
            playerId: req.player.id,
        });
        return sendSuccess(res, 200, 'User left the game successfully');
    } catch (error) {
        next(error);
    }
};
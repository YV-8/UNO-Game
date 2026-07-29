import GameRepository from '../../dataAccess/repositories/game.repository.js';
import gamePlayerRepository from '../../dataAccess/repositories/gamePlayer.repository.js';
import GamePlayerRepository from '../../dataAccess/repositories/gamePlayer.repository.js';
import { appError } from '../../middlewares/appError.js';

const VALID_STATUSES = ['waiting', 'Inprogress', 'finished'];
/**Join Game user
* first verificate gameId exists and requirements
* then verificate has gameid and playerid for user stay in this game
*now initialice in waiting and activecount  depends the maxPlayers
*/
export const joinGame = async ({ gameId, playerId, username }) => {
    const numGameId = Number(gameId);
    if (!numGameId) throw new appError('game_id is required', 400);
    const game = await GameRepository.findById(gameId);

    if (!game) throw new appError('Game not found', 404);
    if (game.state === 'finished') {
        throw new appError('The game has already finished',400);
    }

    const existing = await GamePlayerRepository.findByGameAndPlayer(numGameId, playerId);
    if (existing && !existing.hasLeft) {
        throw new appError('User stays in this game', 400);
    }
    if (existing && existing.hasLeft) {
        return await GamePlayerRepository.update(existing.id, { hasLeft: false })
    }
    if (game.state !== 'waiting') {
        throw new appError('The game started, only players who already joined can rejoin', 400);
    }
    const activeCount = await GamePlayerRepository.countActiveByGameId(numGameId);
    if (activeCount >= game.maxPlayers) {
        throw new appError('This game has all players', 400)
    }

    return await GamePlayerRepository.create({
        gameId,
        playerId,
        username,
        turnOrder: activeCount + 1,
        hasLeft: false,
    });
};

/**
 *leave Game need gameId and playerId,
 *where search gameId and the gameidandplayerid
 *Depends the gameplayer.hasleft the player is not active
 * @returns we use update to change hasleft from true to false
 */
export const leaveGame = async ({ gameId, playerId }) => {
    const numGameId = Number(gameId);
    if (!numGameId) throw new appError('game_id is required', 400);

    const game = await GameRepository.findById(numGameId);
    if (!game) throw new appError('Game not found', 404);

    const gamePlayer = await GamePlayerRepository.findByGameAndPlayer(numGameId, playerId);
    if (!gamePlayer || gamePlayer.hasLeft) {
        throw new appError('User is not an active player in this game', 400);
    }

    return await GamePlayerRepository.update(gamePlayer.id, { hasLeft: true });
};

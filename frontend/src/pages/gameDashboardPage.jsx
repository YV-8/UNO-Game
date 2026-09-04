import { useState } from 'react';
import { useAuth } from '../context/authContext.jsx';
import TopNav from '../components/layout/topNav.jsx';
import CreateGamePanel from '../components/panels/game/createGamePanel.jsx';
import GetGamesPanel from '../components/panels/game/getGamesPanel.jsx';
import GameByIdPanel from '../components/panels/game/gameByIdPanel.jsx';
import UpdateGamePanel from '../components/panels/game/updateGamePanel.jsx';
import DeleteGamePanel from '../components/panels/game/deleteGamePanel.jsx';
import HistoryGamePanel from '../components/panels/game/historyGamePanel.jsx';
import RealGameStatePanel from '../components/panels/game/realGameStatePanel.jsx';
import PlayerPanel from '../components/panels/game/playerPanel.jsx';
import CurrentPlayersPanel from '../components/panels/game/currentPlayersPanel.jsx';
import GamePlayersPanel from '../components/panels/gameplayer/gamePlayersPanel.jsx';
import GetScoresPanel from '../components/panels/score/getScoresPanel.jsx';

// One entry per top-nav button. `color` cycles through the 4 UNO hues —
// add new tabs here and both the nav and the panel switch pick them up.
const NAV_ITEMS = [
    { id: 'create-game', label: 'Create game', color: 'red' },
    { id: 'get-games', label: 'Get games', color: 'yellow' },
    { id: 'game-id', label: 'Game ID', color: 'green' },
    { id: 'update-game', label: 'Update game', color: 'blue' },
    { id: 'delete-game', label: 'Delete game', color: 'red' },
    { id: 'history-game', label: 'History game', color: 'yellow' },
    { id: 'real-state-game', label: 'Real stategame', color: 'green' },
    { id: 'player', label: 'Player', color: 'blue' },
    { id: 'current-players', label: 'Current players', color: 'red' },
    { id: 'gameplayers', label: 'Game players', color: 'purple' },
    { id: 'scores', label: 'Scores', color: 'red' },
];

const PANELS = {
    'create-game': CreateGamePanel,
    'get-games': GetGamesPanel,
    'game-id': GameByIdPanel,
    'update-game': UpdateGamePanel,
    'delete-game': DeleteGamePanel,
    'history-game': HistoryGamePanel,
    'real-state-game': RealGameStatePanel,
    player: PlayerPanel,
    'current-players': CurrentPlayersPanel,
    'gameplayers': GamePlayersPanel,
    'scores': GetScoresPanel,
};

const GameDashboardPage = ({ onNavigateToMenu, onNavigateToLobby }) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('create-game');
    const ActivePanel = PANELS[activeTab];

    return (
        <div className="app-shell">
            <TopNav items={NAV_ITEMS} activeTab={activeTab} onSelect={setActiveTab} onLogout={logout} onMenu={onNavigateToMenu} />
            <div className="app-shell__body">
                <main className="app-shell__content">
                    <ActivePanel onNavigateToLobby={onNavigateToLobby} />
                </main>
            </div>
        </div>
    );
};

export default GameDashboardPage;

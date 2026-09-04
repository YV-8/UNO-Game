import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext.jsx';
import TopNav from '../components/layout/topNav.jsx';
import apiClient from '../api/client.js';

const NAV_ITEMS = [
    { id: 'scores', label: 'Leaderboard', color: 'red' },
];

const ScoreDashboardPage = ({ onNavigateToMenu }) => {
    const { session, logout } = useAuth();
    const [scores, setScores] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('scores');

    useEffect(() => {
        const fetchScoresAndPlayers = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch both scores and players in parallel
                const [scoresData, playersData] = await Promise.all([
                    apiClient.get('/scores', session?.token),
                    apiClient.get('/players', session?.token)
                ]);

                // Depending on the backend response format, it might be in .data or just the array
                const scoresList = scoresData.data || scoresData;
                const playersList = playersData.data || playersData;

                // Create a player lookup map by ID
                const playerMap = {};
                if (Array.isArray(playersList)) {
                    playersList.forEach(player => {
                        playerMap[player.id] = player.username;
                    });
                }

                if (Array.isArray(scoresList)) {
                    // Map over scores and attach the player name
                    let combinedScores = scoresList.map(score => ({
                        ...score,
                        username: playerMap[score.playerId] || `Player ${score.playerId}`
                    }));

                    // Sort the scores ascending
                    combinedScores.sort((a, b) => a.score - b.score);
                    setScores(combinedScores);
                } else {
                    setScores([]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (session && session.token) {
            fetchScoresAndPlayers();
        }
    }, [session]);

    return (
        <div className="app-shell">
            <TopNav items={NAV_ITEMS} activeTab={activeTab} onSelect={setActiveTab} onLogout={logout} onMenu={onNavigateToMenu} />
            <div className="app-shell__body">
                <main className="app-shell__content app-shell__content--centered">
                    <div className="panel" style={{ width: '100%', maxWidth: '800px' }}>
                        <div className="panel__edge panel__edge--purple" />
                        <h2 className="panel__title">Leaderboard</h2>
                        <p className="panel__hint">All scores across all games</p>

                        {loading ? (
                            <p style={{ marginTop: '1rem' }}>Loading scores...</p>
                        ) : error ? (
                            <div className="panel__error-box">{error}</div>
                        ) : (
                            <table className="game-card__table" style={{ width: '100%', marginTop: '1rem' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Player</th>
                                        <th style={{ textAlign: 'left' }}>Score</th>
                                        <th style={{ textAlign: 'left' }}>Game ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scores.length === 0 ? (
                                        <tr>
                                            <td colSpan="3">No scores available.</td>
                                        </tr>
                                    ) : (
                                        scores.map((scoreObj) => (
                                            <tr key={scoreObj.id}>
                                                <td>{scoreObj.username}</td>
                                                <td>{scoreObj.score}</td>
                                                <td>{scoreObj.gameId}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ScoreDashboardPage;

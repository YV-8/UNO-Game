import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/authContext.jsx';
import { useGame } from '../context/gameContext.jsx';
import apiClient from '../api/client.js';
import { io } from 'socket.io-client';

const LobbyDashboardPage = ({ onNavigateToMenu, onNavigateToGame }) => {
    const { session } = useAuth();
    const { activeGameId, setActiveGameId } = useGame();
    
    const [gameIdInput, setGameIdInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [players, setPlayers] = useState([]);
    const [isCreator, setIsCreator] = useState(false);

    const fetchLobbyData = useCallback(async () => {
        if (!activeGameId) return;
        try {
            // Fetch players
            const playersData = await apiClient.post('/games/players', { game_id: activeGameId }, session?.token);
            if (playersData?.players) {
                setPlayers(playersData.players);
            }

            // Fetch game to check creator
            const gameData = await apiClient.get(`/games/${activeGameId}`, session?.token);
            if (gameData?.creator?.username === session?.player?.username || gameData?.creatorId === session?.player?.id) {
                setIsCreator(true);
            }
        } catch (err) {
            console.error("Failed to fetch lobby data:", err);
            // If the game doesn't exist or we can't get players, we might have been kicked or the game ended.
            // But let's just log it for now to avoid premature ejection.
        }
    }, [activeGameId, session]);

    useEffect(() => {
        let socket;
        if (activeGameId) {
            fetchLobbyData();
            
            socket = io('http://localhost:3000');
            socket.on('connect', () => {
                socket.emit('joinGame', activeGameId);
            });
            socket.on('gameStateUpdated', () => {
                fetchLobbyData();
            });
        }
        return () => {
            if (socket) {
                socket.emit('leaveGame', activeGameId);
                socket.disconnect();
            }
        };
    }, [activeGameId, fetchLobbyData]);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!gameIdInput) return;
        setError('');
        setLoading(true);
        try {
            await apiClient.post('/games/join', { game_id: gameIdInput }, session?.token);
            setActiveGameId(gameIdInput);
        } catch (err) {
            setError(err.message || 'Failed to join game');
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async () => {
        setError('');
        setLoading(true);
        try {
            await apiClient.post('/games/leave', { game_id: activeGameId }, session?.token);
            setActiveGameId('');
            setPlayers([]);
            setIsCreator(false);
        } catch (err) {
            setError(err.message || 'Failed to leave game');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        setError('');
        setLoading(true);
        try {
            await apiClient.post('/games/start', { game_id: activeGameId }, session?.token);
            if (onNavigateToGame) {
                onNavigateToGame();
            } else {
                alert('Game started successfully!');
            }
        } catch (err) {
            setError(err.message || 'Failed to start game');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-card">
                <div className="auth-card__edge" />
                <p className="auth-card__eyebrow">Lobby</p>
                <h1 className="auth-card__title">
                    {activeGameId ? `Game #${activeGameId}` : 'Join a Game'}
                </h1>

                {error && <p className="auth-card__error">{error}</p>}

                {!activeGameId ? (
                    <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <label className="auth-card__field">
                            <span className="auth-card__label">Game ID</span>
                            <input
                                className="auth-card__input"
                                type="text"
                                value={gameIdInput}
                                onChange={(e) => setGameIdInput(e.target.value)}
                                placeholder="Enter Game ID"
                                required
                            />
                        </label>
                        <button className="auth-card__submit" type="submit" disabled={loading}>
                            {loading ? 'Joining...' : 'Join Game'}
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                        <div style={{ background: 'var(--color-black-lighter)', padding: '1rem', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-white)' }}>Players ({players.length})</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {players.map((playerObj, idx) => {
                                    const username = typeof playerObj === 'string' ? playerObj : playerObj.username;
                                    const hasLeft = typeof playerObj === 'string' ? false : playerObj.hasLeft;
                                    return (
                                        <li key={idx} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: username === session?.player?.username ? 'var(--color-green-dark)' : 'var(--color-black-light)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '4px',
                                            color: 'var(--color-white)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: hasLeft ? 'red' : 'green'
                                                }} />
                                                <span>{username} {username === session?.player?.username && '(You)'}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {isCreator && (
                                <button 
                                    className="auth-card__submit" 
                                    style={{ background: 'var(--color-green)' }} 
                                    onClick={handleStart} 
                                    disabled={loading}
                                >
                                    {loading ? 'Starting...' : 'Start Game'}
                                </button>
                            )}
                            <button 
                                className="auth-card__submit" 
                                style={{ background: 'var(--color-blue)' }} 
                                onClick={() => onNavigateToGame && onNavigateToGame()} 
                            >
                                Enter Game Board
                            </button>
                            <button 
                                className="auth-card__submit" 
                                style={{ background: 'var(--color-red)' }} 
                                onClick={handleLeave} 
                                disabled={loading}
                            >
                                {loading ? 'Leaving...' : 'Leave Game'}
                            </button>
                        </div>
                    </div>
                )}

                <button 
                    type="button" 
                    className="auth-card__switch" 
                    onClick={onNavigateToMenu}
                    style={{ marginTop: '1.5rem' }}
                >
                    Back to Menu
                </button>
            </div>
        </div>
    );
};

export default LobbyDashboardPage;

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/authContext.jsx';
import { useGame } from '../context/gameContext.jsx';
import apiClient from '../api/client.js';
import UnoCard from '../components/game/UnoCard.jsx';
import { io } from 'socket.io-client';
import '../styles/gameBoard.css';

const GameBoardPage = ({ onNavigateToMenu }) => {
    const { session } = useAuth();
    const { activeGameId, setActiveGameId } = useGame();
    const [gameState, setGameState] = useState(null);
    const [error, setError] = useState('');
    const [colorModalOpen, setColorModalOpen] = useState(false);
    const [pendingCardToPlay, setPendingCardToPlay] = useState(null);
    const [turnMessage, setTurnMessage] = useState('');

    const [winnerMessage, setWinnerMessage] = useState('');
    const [finalScores, setFinalScores] = useState(null);

    const fetchGameState = useCallback(async () => {
        if (!activeGameId) return;
        try {
            const data = await apiClient.get(`/games/${activeGameId}/state`, session?.token);
            setGameState(data);
        } catch (err) {
            console.error("Failed to fetch game state:", err);
            // Don't auto-redirect immediately to avoid glitches, just log it.
        }
    }, [activeGameId, session]);

    useEffect(() => {
        if (!activeGameId) return;
        fetchGameState();

        // Connect to the backend using socket.io for real-time updates
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            socket.emit('joinGame', activeGameId);
        });

        socket.on('gameStateUpdated', () => {
            fetchGameState();
        });

        return () => {
            socket.emit('leaveGame', activeGameId);
            socket.disconnect();
        };
    }, [activeGameId, fetchGameState]);

    useEffect(() => {
        if (gameState?.state === 'finished' && !finalScores) {
            apiClient.get(`/scores/${activeGameId}`, session?.token)
                .then(data => setFinalScores(data.scores))
                .catch(err => console.error("Failed to fetch scores:", err));
        }
    }, [gameState?.state, activeGameId, finalScores, session?.token]);

    const handleLeave = async () => {
        try {
            await apiClient.post('/games/leave', { game_id: activeGameId }, session?.token);
        } catch (err) {
            console.error(err);
        }
        setActiveGameId('');
        onNavigateToMenu();
    };

    const handleDraw = async () => {
        const isMyTurn = gameState?.currentPlayer === session?.player?.username;
        if (!isMyTurn) {
            setTurnMessage("it isn't not your turn");
            setTimeout(() => setTurnMessage(''), 3000);
            return;
        }

        try {
            await apiClient.put(`/games/${activeGameId}/draw`, { player: session.player.username }, session.token);
            fetchGameState();
        } catch (err) {
            setTurnMessage(err.message || 'Failed to draw card');
            setTimeout(() => setTurnMessage(''), 3000);
        }
    };

    const handleSayUno = async () => {
        try {
            await apiClient.put(`/games/${activeGameId}/say-uno`, { player: session.player.username }, session.token);
            fetchGameState();
            alert('¡Dijiste UNO!');
        } catch (err) {
            setTurnMessage(err.message || 'Failed to say UNO');
            setTimeout(() => setTurnMessage(''), 3000);
        }
    };

    const attemptPlayCard = async (card, chosenColor = null) => {
        try {
            let cardPlayedStr = card.color === 'none' || !card.color ? card.value : `${card.color} ${card.value}`;
            const payload = { player: session.player.username, cardPlayed: cardPlayedStr };
            if (chosenColor) payload.chosenColor = chosenColor;

            const res = await apiClient.put(`/games/${activeGameId}/play`, payload, session.token);
            if (res.message && res.message.includes('win')) {
                setWinnerMessage(res.message);
                return;
            }
            fetchGameState();
        } catch (err) {
            setTurnMessage(err.message || 'Failed to play card');
            setTimeout(() => setTurnMessage(''), 3000);
        }
    };

    const handleCardClick = (card) => {
        if (!card) {
            // Clicked the deck
            handleDraw();
            return;
        }

        const isMyTurn = gameState?.currentPlayer === session?.player?.username;
        if (!isMyTurn) {
            setTurnMessage("It is not your turn!");
            setTimeout(() => setTurnMessage(''), 3000);
            return;
        }

        if (card.color === null || card.color === 'none') {
            setPendingCardToPlay(card);
            setColorModalOpen(true);
        } else {
            attemptPlayCard(card);
        }
    };

    const handleColorChoose = (color) => {
        setColorModalOpen(false);
        if (pendingCardToPlay) {
            attemptPlayCard(pendingCardToPlay, color);
            setPendingCardToPlay(null);
        }
    };

    if (!gameState) {
        return <div className="game-board__loading">Loading game board...</div>;
    }

    const { currentPlayer, topCard, hands, state: gameStatus } = gameState;
    const isMyTurn = currentPlayer === session?.player?.username;
    const myHand = hands[session?.player?.username] || [];

    // Opponents are everyone in hands that isn't me
    const opponents = Object.entries(hands).filter(([username]) => username !== session?.player?.username);

    // Active card color
    const activeColor = topCard?.color;

    let loserMessage = '';
    if (gameStatus === 'finished' && !winnerMessage) {
        const winner = Object.entries(hands).find(([u, info]) => info.cardCount === 0 || (Array.isArray(info) && info.length === 0));
        loserMessage = `¡${winner ? winner[0] : 'Alguien'} ha ganado el juego!`;
    }
    const displayResult = winnerMessage || loserMessage;
    const isWin = !!winnerMessage;

    const handleChallenge = async (challengedUsername) => {
        try {
            const res = await apiClient.put(`/games/${activeGameId}/challenge-uno`, {
                challenger: session.player.username,
                challengedPlayer: challengedUsername
            }, session.token);
            alert(res.message || 'Challenge processed');
        } catch (err) {
            setTurnMessage(err.message || 'Failed to challenge UNO');
            setTimeout(() => setTurnMessage(''), 3000);
        }
    };

    return (
        <div className="game-board" data-color={activeColor}>
            <header className="game-board__header">
                <div className="game-board__turn-status">
                    {isMyTurn ? '¡Es tu turno!' : `Turno de ${currentPlayer}`}
                </div>
                <button className="game-board__leave-btn" onClick={handleLeave}>
                    Abandonar Partida
                </button>
            </header>

            <div className="game-board__opponents">
                {opponents.map(([username, info]) => (
                    <div key={username} className="opponent-badge">
                        <div className="opponent-badge__name">{username}</div>
                        <div className="opponent-badge__cards">{info.cardCount || 0} cartas</div>
                        {info.cardCount === 1 && (
                            <button
                                onClick={() => handleChallenge(username)}
                                className="opponent-badge__challenge-btn"
                                disabled={info.sayOne}
                            >
                                {info.sayOne ? '¡Dijo UNO!' : '¡Desafiar UNO!'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="game-board__play-area">
                <div className="game-board__color-badge" data-color={activeColor}>
                    Color: {activeColor || 'Ninguno'}
                </div>
                <div className="game-board__cards-wrapper">
                    <UnoCard hidden={true} onClick={handleCardClick} />
                    <div className="game-board__top-card-wrapper" data-color={activeColor}>
                        <UnoCard card={topCard} />
                    </div>
                </div>
            </div>

            <div className="game-board__player-area">
                {turnMessage && (
                    <div className="game-board__turn-message">
                        {turnMessage}
                    </div>
                )}
                <button
                    className="uno-btn"
                    onClick={handleSayUno}
                    disabled={!myHand || myHand.length > 2}
                >
                    ¡UNO!
                </button>
                <div className="player-hand">
                    {Array.isArray(myHand) && myHand.map((card, idx) => (
                        <UnoCard
                            key={idx}
                            card={card}
                            isPlayable={isMyTurn}
                            onClick={handleCardClick}
                        />
                    ))}
                </div>
            </div>

            {/* Winner/Loser Message Modal */}
            {displayResult && (
                <div className="modal-overlay">
                    <div className="result-modal">
                        <h1 className={`result-modal__title ${isWin ? 'result-modal__title--win' : 'result-modal__title--lose'}`}>
                            {isWin ? '¡VICTORIA!' : '¡FIN DEL JUEGO!'}
                        </h1>
                        <h2 className="result-modal__message">
                            {displayResult}
                        </h2>
                        {finalScores && (
                            <div className="result-modal__scores" style={{ marginTop: '1rem', textAlign: 'left', color: 'var(--color-pastelYellow)' }}>
                                <h3 style={{ borderBottom: '1px solid var(--color-purpleGlass)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Puntajes Finales</h3>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {Object.entries(finalScores).map(([user, score]) => (
                                        <li key={user} style={{ padding: '0.2rem 0', fontWeight: 'bold' }}>
                                            {user}: <span style={{ color: 'var(--color-soft)' }}>{score} pts</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button
                            className="result-modal__btn"
                            onClick={() => {
                                setWinnerMessage('');
                                setFinalScores(null);
                                handleLeave();
                            }}
                        >
                            Volver al Menú Principal
                        </button>
                    </div>
                </div>
            )}

            {/* Color Picker Modal for Wild Cards */}
            {colorModalOpen && (
                <div className="modal-overlay">
                    <div className="color-picker-modal">
                        <h2 className="color-picker-modal__title">Elige un color</h2>
                        <div className="color-picker-modal__grid">
                            {['red', 'blue', 'green', 'yellow'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => handleColorChoose(c)}
                                    className={`color-picker-modal__btn color-picker-modal__btn--${c}`}
                                />
                            ))}
                        </div>
                        <button
                            className="uno-btn color-picker-modal__cancel-btn"
                            onClick={() => setColorModalOpen(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameBoardPage;

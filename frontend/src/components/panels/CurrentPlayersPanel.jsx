import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../api/client.js';

const CurrentPlayersPanel = () => {
    const { session } = useAuth();
    const [gameId, setGameId] = useState('');
    const [players, setPlayers] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setPlayers(null);
        try {
            const data = await apiClient.post('/games/players', { game_id: Number(gameId) }, session.token);
            setPlayers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--blue" />
            <h2 className="panel__title">Current players</h2>
            <p className="panel__hint">POST /api/games/players — every player currently in this game.</p>

            <form className="panel__form" onSubmit={handleSubmit}>
                <label className="panel__field">
                    <span className="panel__label">Game ID</span>
                    <input
                        className="panel__input"
                        value={gameId}
                        onChange={(e) => setGameId(e.target.value)}
                        required
                    />
                </label>
                <button className="panel__button" type="submit">
                    Load players
                </button>
            </form>

            {error && <p className="panel__error">{error}</p>}
            {players && <pre className="panel__result">{JSON.stringify(players, null, 2)}</pre>}
        </section>
    );
};

export default CurrentPlayersPanel;

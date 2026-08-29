import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGame } from '../../context/GameContext.jsx';
import apiClient from '../../api/client.js';

const GameByIdPanel = () => {
    const { session } = useAuth();
    const { setActiveGameId } = useGame();
    const [gameId, setGameId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setResult(null);
        try {
            const data = await apiClient.get(`/games/${gameId}`, session.token);
            setResult(data);
            setActiveGameId(gameId);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--green" />
            <h2 className="panel__title">Game by ID</h2>
            <p className="panel__hint">
                GET /api/games/:id — also sets this as the active game for the sidebar score.
            </p>

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
                    Look up
                </button>
            </form>

            {error && <p className="panel__error">{error}</p>}
            {result && <pre className="panel__result">{JSON.stringify(result, null, 2)}</pre>}
        </section>
    );
};

export default GameByIdPanel;

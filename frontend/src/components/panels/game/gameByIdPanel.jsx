import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import { useGame } from '../../../context/gameContext.jsx';
import apiClient from '../../../api/client.js';

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
                GET /api/games/:id — also sets this as the active game.
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
            {result && (
                <div className="game-card game-card--skyblue" style={{ marginTop: 'var(--space-3)' }}>
                    <h3 className="game-card__title">{result.name || `Game ${result.id || ''}`}</h3>
                    <table className="game-card__table">
                        <tbody>
                            <tr>
                                <th>Reglas</th>
                                <td>{result.rules || 'N/A'}</td>
                            </tr>
                            {Object.entries(result).map(([key, value]) => {
                                if (key === 'name' || key === 'rules') return null;
                                return (
                                    <tr key={key}>
                                        <th>{key}</th>
                                        <td>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default GameByIdPanel;

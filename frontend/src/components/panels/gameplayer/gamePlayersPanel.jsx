import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import apiClient from '../../../api/client.js';

const GamePlayersPanel = () => {
    const { session } = useAuth();
    const [gameId, setGameId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setResult(null);
        try {
            const data = await apiClient.get(`/games/${gameId}/players`, session.token);
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--purple" />
            <h2 className="panel__title">Game players</h2>
            <p className="panel__hint">GET /api/games/:id/players — list all players ordered by turn.</p>

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

            {error && <div className="panel__error-box">{error}</div>}
            
            {result && (
                <div className="game-card game-card--lila" style={{ marginTop: '1.5rem' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '1.1rem' }}>
                            Game #{result.game_id} — {result.playerCount} Players
                        </h3>
                    </div>
                    <table className="game-card__table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Username</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.players?.map((p, idx) => (
                                <tr key={idx}>
                                    <td style={{ color: 'var(--color-white)' }}>{idx + 1}</td>
                                    <td style={{ color: 'var(--color-white)' }}>{p.username}</td>
                                    <td>
                                        <span style={{ 
                                            display: 'inline-block',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            background: p.hasLeft ? 'var(--color-red)' : 'var(--color-green)',
                                            color: 'var(--color-white)'
                                        }}>
                                            {p.hasLeft ? 'Left' : 'Active'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default GamePlayersPanel;

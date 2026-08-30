import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import apiClient from '../../../api/client.js';

const GetGamesPanel = () => {
    const { session } = useAuth();
    const [games, setGames] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const loadGames = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiClient.get('/games', session.token);
            setGames(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--yellow" />
            <h2 className="panel__title">Get games</h2>
            <p className="panel__hint">GET /api/games — cached on the server (list-level TTL).</p>

            <button className="panel__button" type="button" onClick={loadGames} disabled={loading}>
                {loading ? 'Loading…' : 'Load games'}
            </button>

            {error && <p className="panel__error">{error}</p>}
            {games && games.length === 0 && <p className="panel__empty">No games yet.</p>}
            {games && games.length > 0 && (
                <div className="game-card-grid">
                    {games.map((game, idx) => (
                        <div key={game.id || idx} className="game-card">
                            <h3 className="game-card__title">{game.name || `Game ${game.id || idx}`}</h3>
                            <table className="game-card__table">
                                <tbody>
                                    <tr>
                                        <th>Reglas</th>
                                        <td>{game.rules || 'N/A'}</td>
                                    </tr>
                                    {Object.entries(game).map(([key, value]) => {
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
                    ))}
                </div>
            )}
        </section>
    );
};

export default GetGamesPanel;

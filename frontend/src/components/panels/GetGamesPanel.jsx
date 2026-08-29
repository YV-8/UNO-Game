import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../api/client.js';

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
            {games && games.length > 0 && <pre className="panel__result">{JSON.stringify(games, null, 2)}</pre>}
        </section>
    );
};

export default GetGamesPanel;

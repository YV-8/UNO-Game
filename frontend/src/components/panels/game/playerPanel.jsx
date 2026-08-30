import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import apiClient from '../../../api/client.js';

const PlayerPanel = () => {
    const { session } = useAuth();
    const [players, setPlayers] = useState(null);
    const [playerId, setPlayerId] = useState('');
    const [player, setPlayer] = useState(null);
    const [error, setError] = useState('');

    const loadAll = async () => {
        setError('');
        try {
            const data = await apiClient.get('/players', session.token);
            setPlayers(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const loadOne = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const data = await apiClient.get(`/players/${playerId}`, session.token);
            setPlayer(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--green" />
            <h2 className="panel__title">Player</h2>
            <p className="panel__hint">GET /api/players and GET /api/players/:id</p>

            <button className="panel__button" type="button" onClick={loadAll}>
                List all players
            </button>

            <form className="panel__form" onSubmit={loadOne}>
                <label className="panel__field">
                    <span className="panel__label">Player ID</span>
                    <input
                        className="panel__input"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        required
                    />
                </label>
                <button className="panel__button" type="submit">
                    Look up
                </button>
            </form>

            {error && <p className="panel__error">{error}</p>}
            {players && <pre className="panel__result">{JSON.stringify(players, null, 2)}</pre>}
            {player && <pre className="panel__result">{JSON.stringify(player, null, 2)}</pre>}
        </section>
    );
};

export default PlayerPanel;

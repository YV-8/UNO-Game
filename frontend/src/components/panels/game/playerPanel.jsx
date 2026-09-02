import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import apiClient from '../../../api/client.js';
import ResultTable from './ResultTable.jsx';

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

            {error && <div className="panel__error-box">{error}</div>}
            
            {players && (
                <div className="game-card game-card--lila" style={{ marginTop: '1.5rem' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '1.1rem' }}>
                            All Players ({players.length})
                        </h3>
                    </div>
                    <table className="game-card__table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Username</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((p, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>{p.id}</td>
                                    <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>{p.username}</td>
                                    <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>{p.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {player && (
                <div className="game-card game-card--lila" style={{ marginTop: '1.5rem' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <h3 style={{ margin: 0, color: 'var(--color-white)', fontSize: '1.1rem' }}>
                            Player #{player.id}
                        </h3>
                    </div>
                    <table className="game-card__table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Username</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>{player.id}</td>
                                <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>{player.username}</td>
                                <td style={{ padding: '0.5rem', color: 'var(--color-white)' }}>{player.email}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default PlayerPanel;

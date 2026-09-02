import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import apiClient from '../../../api/client.js';
import ResultTable from './ResultTable.jsx';

const RealGameStatePanel = () => {
    const { session } = useAuth();
    const [gameId, setGameId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setResult(null);
        try {
            const data = await apiClient.post(`/games/state`, { game_id: Number(gameId) }, session.token);
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--blue" />
            <h2 className="panel__title">Real state game</h2>
            <p className="panel__hint">POST /api/games/state — gets the game's actual state (waiting, in_progress, finished).</p>

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
                    Get state
                </button>
            </form>

            {error && <div className="panel__error-box">{error}</div>}
            {result && <ResultTable result={result} />}
        </section>
    );
};

export default RealGameStatePanel;

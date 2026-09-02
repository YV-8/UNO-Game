import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import { useGame } from '../../../context/gameContext.jsx';
import apiClient from '../../../api/client.js';
import ResultTable from './ResultTable.jsx';

const GameStatePanel = () => {
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
            const data = await apiClient.get(`/games/${gameId}/state`, session.token);
            setResult(data);
            setActiveGameId(gameId);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--yellow" />
            <h2 className="panel__title">State game</h2>
            <p className="panel__hint">
                GET /api/games/:id/state — current player, top card, hands (yours in full, rivals as
                counts), and turn history.
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
                    Get state
                </button>
            </form>

            {error && <div className="panel__error-box">{error}</div>}
            {result && <ResultTable result={result} />}
        </section>
    );
};

export default GameStatePanel;

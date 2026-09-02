import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import apiClient from '../../../api/client.js';
import ResultTable from './ResultTable.jsx';

const DeleteGamePanel = () => {
    const { session } = useAuth();
    const [gameId, setGameId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setResult(null);
        try {
            const data = await apiClient.delete(`/games/${gameId}`, session.token);
            setResult(data ?? { message: 'Deleted.' });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--red" />
            <h2 className="panel__title">Delete game</h2>
            <p className="panel__hint">DELETE /api/games/:id — this cannot be undone.</p>

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
                <button className="panel__button panel__button--danger" type="submit">
                    Delete
                </button>
            </form>

            {error && <div className="panel__error-box">{error}</div>}
            {result && <ResultTable result={result} />}
        </section>
    );
};

export default DeleteGamePanel;

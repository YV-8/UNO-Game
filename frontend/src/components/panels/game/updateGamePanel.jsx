import { useState } from 'react';
import { useAuth } from '../../../context/authContext.jsx';
import apiClient from '../../../api/client.js';
import ResultTable from './ResultTable.jsx';

const UpdateGamePanel = () => {
    const { session } = useAuth();
    const [gameId, setGameId] = useState('');
    const [name, setName] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setResult(null);
        try {
            const data = await apiClient.put(`/games/${gameId}`, { name }, session.token);
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--blue" />
            <h2 className="panel__title">Update game</h2>
            <p className="panel__hint">PUT /api/games/:id</p>

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
                <label className="panel__field">
                    <span className="panel__label">New name</span>
                    <input
                        className="panel__input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <button className="panel__button" type="submit">
                    Update
                </button>
            </form>

            {error && <div className="panel__error-box">{error}</div>}
            {result && <ResultTable result={result} />}
        </section>
    );
};

export default UpdateGamePanel;

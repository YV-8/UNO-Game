import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../api/client.js';

const CreateGamePanel = () => {
    const { session } = useAuth();
    const [name, setName] = useState('');
    const [rules, setRules] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setResult(null);
        try {
            const data = await apiClient.post(
                '/games',
                { name, rules: rules || undefined },
                session.token
            );
            setResult(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="panel">
            <div className="panel__edge panel__edge--red" />
            <h2 className="panel__title">Create game</h2>
            <p className="panel__hint">POST /api/games — you join automatically as player 1.</p>

            <form className="panel__form" onSubmit={handleSubmit}>
                <label className="panel__field">
                    <span className="panel__label">Name</span>
                    <input
                        className="panel__input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>
                <label className="panel__field">
                    <span className="panel__label">Rules (optional)</span>
                    <input className="panel__input" value={rules} onChange={(e) => setRules(e.target.value)} />
                </label>
                <button className="panel__button" type="submit">
                    Create
                </button>
            </form>

            {error && <p className="panel__error">{error}</p>}
            {result && <pre className="panel__result">{JSON.stringify(result, null, 2)}</pre>}
        </section>
    );
};

export default CreateGamePanel;

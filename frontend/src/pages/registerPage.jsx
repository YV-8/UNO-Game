import { useState } from 'react';
import { useAuth } from '../context/authContext.jsx';

const RegisterPage = ({ onSwitchToLogin }) => {
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register({ username, email, password });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-screen">
            <form className="auth-card" onSubmit={handleSubmit}>
                <div className="auth-card__edge" />
                <p className="auth-card__eyebrow">Capstone UNO</p>
                <h1 className="auth-card__title">Create account</h1>

                <label className="auth-card__field">
                    <span className="auth-card__label">Username</span>
                    <input
                        className="auth-card__input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </label>

                <label className="auth-card__field">
                    <span className="auth-card__label">Email</span>
                    <input
                        className="auth-card__input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </label>

                <label className="auth-card__field">
                    <span className="auth-card__label">Password</span>
                    <input
                        className="auth-card__input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </label>

                {error && <p className="auth-card__error">{error}</p>}

                <button className="auth-card__submit" type="submit" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create account'}
                </button>

                <button type="button" className="auth-card__switch" onClick={onSwitchToLogin}>
                    Already have an account? Sign in
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;

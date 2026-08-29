import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = ({ onSwitchToRegister }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ username, password });
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
                <h1 className="auth-card__title">Sign in</h1>

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
                    <span className="auth-card__label">Password</span>
                    <input
                        className="auth-card__input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                </label>

                {error && <p className="auth-card__error">{error}</p>}

                <button className="auth-card__submit" type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>

                <button type="button" className="auth-card__switch" onClick={onSwitchToRegister}>
                    New here? Create an account
                </button>
            </form>
        </div>
    );
};

export default LoginPage;

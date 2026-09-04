import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext.jsx';
import TopNav from '../components/layout/topNav.jsx';
import apiClient from '../api/client.js';

const NAV_ITEMS = [
    { id: 'profile', label: 'Profile', color: 'blue' },
];

const ProfileDashboardPage = ({ onNavigateToMenu }) => {
    const { session, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiClient.get('/auth/profile', session?.token);
                if (data) {
                    setUsername(data.username || '');
                    setEmail(data.email || '');
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        };
        fetchProfile();
    }, [session]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            // Updating the player requires their ID. The session usually holds the player ID.
            if (!session?.player?.id) throw new Error("Player ID not found in session");
            await apiClient.put(`/players/${session.player.id}`, { username, email }, session.token);
            setSuccess('Profile updated successfully!');
            // To be robust, one might update the session here, but it's okay for now.
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell">
            <TopNav items={NAV_ITEMS} activeTab={activeTab} onSelect={setActiveTab} onLogout={logout} onMenu={onNavigateToMenu} />
            <div className="app-shell__body">
                <main className="app-shell__content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '2rem' }}>
                    <div className="auth-card" style={{ width: '100%', maxWidth: '420px' }}>
                        <div className="auth-card__edge" style={{ backgroundColor: 'var(--color-blue)' }} />
                        <p className="auth-card__eyebrow">My Account</p>
                        <h1 className="auth-card__title">Profile</h1>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '100px', height: '100px', borderRadius: '50%',
                                background: 'var(--color-blue)', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 'bold',
                                border: '4px solid var(--color-soft)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                            }}>
                                {username ? username.charAt(0).toUpperCase() : '?'}
                            </div>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <label className="auth-card__field">
                                <span className="auth-card__label">Username</span>
                                <input
                                    className="auth-card__input"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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
                                    required
                                />
                            </label>

                            {error && <div className="panel__error-box">{error}</div>}
                            {success && (
                                <div className="panel__error-box" style={{
                                    background: 'rgba(0, 183, 255, 0.22)',
                                    borderColor: 'var(--color-green)',
                                    color: 'var(--color-green-dark)'
                                }}>
                                    {success}
                                </div>
                            )}

                            <button className="auth-card__submit" type="submit" disabled={loading} style={{ background: 'var(--color-blue)' }}>
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfileDashboardPage;

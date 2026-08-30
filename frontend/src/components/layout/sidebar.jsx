import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext.jsx';
import { useGame } from '../../context/gameContext.jsx';
import apiClient from '../../api/client.js';

const Sidebar = () => {
    const { session, logout } = useAuth();
    const { activeGameId } = useGame();
    const [score, setScore] = useState(null);
    const [error, setError] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        setError('');
        if (!activeGameId) {
            setScore(null);
            return;
        }
        apiClient
            .get(`/games/${activeGameId}/score-game`, session?.token)
            .then((data) => setScore(data))
            .catch((err) => setError(err.message));
    }, [activeGameId, session?.token]);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    return (
        <aside className="sidebar">
            <div className="sidebar__edge" />

            <p className="sidebar__section-title">Profile</p>
            <div className="sidebar__dropdown" onClick={toggleDropdown}>
                <p className="sidebar__username">
                    {session?.player?.username ?? '—'} <span style={{ fontSize: '1rem' }}>{isDropdownOpen ? '▲' : '▼'}</span>
                </p>
                {isDropdownOpen && (
                    <ul className="sidebar__dropdown-menu">
                        <li className="sidebar__dropdown-item">Editar Perfil</li>
                        <li className="sidebar__dropdown-item" onClick={logout}>Cerrar Sesión</li>
                        <li className="sidebar__dropdown-item" style={{ borderTop: '1px solid #ccc', paddingTop: '8px' }}>
                            Mi Score: {score ? JSON.stringify(score) : 'N/A'}
                        </li>
                    </ul>
                )}
            </div>

            <p className="sidebar__section-title">Current score</p>
            {!activeGameId && (
                <p className="sidebar__empty">
                    Pick a game in “Game ID” or “State game” to see its score here
                </p>
            )}
            {activeGameId && !score && !error && <p className="sidebar__empty">Loading…</p>}
            {error && <p className="sidebar__error">{error}</p>}
            {score && <pre className="sidebar__score-value">{JSON.stringify(score, null, 2)}</pre>}
        </aside>
    );
};

export default Sidebar;

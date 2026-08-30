import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext.jsx';
import { useGame } from '../../context/gameContext.jsx';
import apiClient from '../../api/client.js';

const Sidebar = () => {
    const { session } = useAuth();
    const { activeGameId } = useGame();
    const [score, setScore] = useState(null);
    const [error, setError] = useState('');

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

    return (
        <aside className="sidebar">
            <div className="sidebar__edge" />

            <p className="sidebar__section-title">Profile</p>
            <p className="sidebar__username">{session?.player?.username ?? '—'}</p>

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

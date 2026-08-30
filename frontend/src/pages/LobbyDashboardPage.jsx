import { useState } from 'react';
import { useAuth } from '../context/authContext.jsx';
import TopNav from '../components/layout/topNav.jsx';
import Sidebar from '../components/layout/sidebar.jsx';

const NAV_ITEMS = [
    { id: 'joingame', label: 'Join Game', color: 'red' },
    { id: 'startgame', label: 'Start Game', color: 'yellow' },
    { id: 'leavegame', label: 'Leave Game', color: 'green' },
    { id: 'endgame', label: 'End Game', color: 'blue' },
    { id: 'score', label: 'Score', color: 'red' },
    { id: 'state', label: 'State', color: 'yellow' },
    { id: 'history', label: 'History', color: 'green' },
];

const LobbyDashboardPage = ({ onNavigateToMenu }) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('joingame');

    return (
        <div className="app-shell">
            <TopNav items={NAV_ITEMS} activeTab={activeTab} onSelect={setActiveTab} onLogout={logout} onMenu={onNavigateToMenu} />
            <div className="app-shell__body">
                <main className="app-shell__content">
                    <div className="panel">
                        <div className="panel__edge" style={{ backgroundColor: 'var(--color-' + NAV_ITEMS.find(i => i.id === activeTab).color + ')' }} />
                        <h2 className="panel__title">{NAV_ITEMS.find(i => i.id === activeTab).label}</h2>
                        <p className="panel__hint">Placeholder panel for {activeTab}</p>
                        
                        {activeTab === 'joingame' && (
                            <div className="panel__form">
                                <p>You are in the lobby. Waiting for other players...</p>
                            </div>
                        )}
                        {activeTab === 'startgame' && (
                            <div className="panel__form">
                                <p>If you are admin, you can start the game here.</p>
                                <button className="panel__button">Start Game Now</button>
                            </div>
                        )}
                    </div>
                </main>
                <Sidebar />
            </div>
        </div>
    );
};

export default LobbyDashboardPage;

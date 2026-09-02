import { useState } from 'react';
import { useAuth } from '../context/authContext.jsx';
import Sidebar from '../components/layout/sidebar.jsx';

const PlayerDashboardPage = ({ onNavigateToMenu }) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('getplayers');

    return (
        <div className="app-shell">
            <div className="app-shell__body">
                <main className="app-shell__content">
                    <div className="panel">
                        <h2 className="panel__title">Dashboard</h2>
                        <p className="panel__hint">Welcome to your dashboard</p>
                    </div>
                </main>
                <Sidebar />
            </div>
        </div>
    );
};

export default PlayerDashboardPage;

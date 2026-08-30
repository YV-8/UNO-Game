import { useState } from 'react';
import { useAuth } from '../context/authContext.jsx';
import TopNav from '../components/layout/topNav.jsx';
import Sidebar from '../components/layout/sidebar.jsx';

const NAV_ITEMS = [
    { id: 'getall', label: 'Get All', color: 'red' },
    { id: 'getid', label: 'Get ID', color: 'yellow' },
    { id: 'create', label: 'Create Score', color: 'green' },
    { id: 'update', label: 'Update', color: 'blue' },
    { id: 'delete', label: 'Delete', color: 'red' },
];

const ScoreDashboardPage = ({ onNavigateToMenu }) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('getall');

    return (
        <div className="app-shell">
            <TopNav items={NAV_ITEMS} activeTab={activeTab} onSelect={setActiveTab} onLogout={logout} onMenu={onNavigateToMenu} />
            <div className="app-shell__body">
                <main className="app-shell__content">
                    <div className="panel">
                        <div className="panel__edge" style={{ backgroundColor: 'var(--color-' + NAV_ITEMS.find(i => i.id === activeTab).color + ')' }} />
                        <h2 className="panel__title">{NAV_ITEMS.find(i => i.id === activeTab).label}</h2>
                        <p className="panel__hint">Placeholder panel for {activeTab}</p>
                    </div>
                </main>
                <Sidebar />
            </div>
        </div>
    );
};

export default ScoreDashboardPage;

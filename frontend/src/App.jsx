import { useState } from 'react';
import { AuthProvider, useAuth } from './context/authContext.jsx';
import { GameProvider } from './context/gameContext.jsx';
import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/registerPage.jsx';
import MenuPage from './pages/menuPage.jsx';
import GameDashboardPage from './pages/GameDashboardPage.jsx';
import PlayerDashboardPage from './pages/PlayerDashboardPage.jsx';
import ProfileDashboardPage from './pages/ProfileDashboardPage.jsx';
import ScoreDashboardPage from './pages/ScoreDashboardPage.jsx';
import CardDashboardPage from './pages/CardDashboardPage.jsx';
import LobbyDashboardPage from './pages/LobbyDashboardPage.jsx';
import './styles/variables.css';
import './styles/app.css';

const AuthGate = () => {
    const { session } = useAuth();
    const [mode, setMode] = useState('login');
    const [currentView, setCurrentView] = useState('menu');

    if (session) {
        switch (currentView) {
            case 'game': return <GameDashboardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'player': return <PlayerDashboardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'profile': return <ProfileDashboardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'score': return <ScoreDashboardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'card': return <CardDashboardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'lobby': return <LobbyDashboardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'menu':
            default:
                return <MenuPage onNavigate={setCurrentView} />;
        }
    }

    return mode === 'login' ? (
        <LoginPage onSwitchToRegister={() => setMode('register')} />
    ) : (
        <RegisterPage onSwitchToLogin={() => setMode('login')} />
    );
};

const App = () => (
    <AuthProvider>
        <GameProvider>
            <AuthGate />
        </GameProvider>
    </AuthProvider>
);

export default App;

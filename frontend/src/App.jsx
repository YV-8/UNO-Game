import { useState } from 'react';
import { AuthProvider, useAuth } from './context/authContext.jsx';
import { GameProvider } from './context/gameContext.jsx';
import LoginPage from './pages/loginPage.jsx';
import RegisterPage from './pages/registerPage.jsx';
import MenuPage from './pages/menuPage.jsx';
import GameDashboardPage from './pages/gameDashboardPage.jsx';
import ScoreDashboardPage from './pages/scoreDashboardPage.jsx';
import ProfileDashboardPage from './pages/profileDashboardPage.jsx';
import LobbyDashboardPage from './pages/lobbyDashboardPage.jsx';
import GameBoardPage from './pages/gameBoardPage.jsx';
import './styles/variables.css';
import './styles/app.css';

const AuthGate = () => {
    const { session } = useAuth();
    const [mode, setMode] = useState('login');
    const [currentView, setCurrentView] = useState('menu');

    if (session) {
        switch (currentView) {
            case 'game': return <GameDashboardPage onNavigateToMenu={() => setCurrentView('menu')} onNavigateToLobby={() => setCurrentView('lobby')} />;
            case 'board': return <GameBoardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'player': return <ScoreDashboardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'profile': return <ProfileDashboardPage onNavigateToMenu={() => setCurrentView('menu')} />;
            case 'lobby': return <LobbyDashboardPage onNavigateToMenu={() => setCurrentView('menu')} onNavigateToGame={() => setCurrentView('board')} />;
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

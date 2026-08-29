import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { GameProvider } from './context/GameContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import './styles/variables.css';
import './styles/app.css';

const AuthGate = () => {
    const { session } = useAuth();
    const [mode, setMode] = useState('login');

    if (session) return <DashboardPage />;

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

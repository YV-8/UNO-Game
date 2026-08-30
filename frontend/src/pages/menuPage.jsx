import { useAuth } from '../context/authContext.jsx';

const MenuPage = ({ onNavigate }) => {
    const { logout } = useAuth();

    return (
        <div className="auth-screen">
            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="auth-card__title" style={{ color: 'var(--color-soft)', margin: 0 }}>
                        Main Menu
                    </h1>
                    <button className="topnav__logout" onClick={logout}>
                        Log out
                    </button>
                </div>
                
                <div className="menu-grid">
                    <button 
                        className="menu-button menu-button--pink" 
                        onClick={() => onNavigate('game')}
                    >
                        Game
                    </button>
                    <button 
                        className="menu-button menu-button--cream" 
                        onClick={() => onNavigate('player')}
                    >
                        Player
                    </button>
                    <button 
                        className="menu-button menu-button--lightpurple" 
                        onClick={() => onNavigate('profile')}
                    >
                        Profile
                    </button>
                    <button 
                        className="menu-button menu-button--soft" 
                        onClick={() => onNavigate('score')}
                    >
                        Score
                    </button>
                    <button 
                        className="menu-button menu-button--skyblue" 
                        onClick={() => onNavigate('card')}
                    >
                        Card
                    </button>
                    <button 
                        className="menu-button menu-button--green" 
                        onClick={() => onNavigate('lobby')}
                    >
                        Join the Game
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;

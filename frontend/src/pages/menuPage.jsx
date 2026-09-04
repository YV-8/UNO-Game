import { useAuth } from '../context/authContext.jsx';

const MenuPage = ({ onNavigate }) => {
    const { logout } = useAuth();

    return (
        <div className="auth-screen">
            <div className="menu-container">
                <div className="menu-header">
                    <h1 className="auth-card__title menu-header__title">
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
                        Score
                    </button>
                    <button
                        className="menu-button menu-button--green"
                        onClick={() => onNavigate('lobby')}
                    >
                        Join the Game
                    </button>
                    <button
                        className="menu-button menu-button--lightpurple"
                        onClick={() => onNavigate('profile')}
                    >
                        Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;

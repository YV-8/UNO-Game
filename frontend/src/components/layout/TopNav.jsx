const TopNav = ({ items, activeTab, onSelect, onLogout }) => (
    <header className="topnav">
        <span className="topnav__brand">UNO</span>
        <ul className="topnav__list">
            {items.map((item) => (
                <li key={item.id}>
                    <button
                        type="button"
                        className={[
                            'topnav__button',
                            `topnav__button--${item.color}`,
                            activeTab === item.id ? 'topnav__button--active' : '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={() => onSelect(item.id)}
                    >
                        {item.label}
                    </button>
                </li>
            ))}
        </ul>
        <button type="button" className="topnav__logout" onClick={onLogout}>
            Log out
        </button>
    </header>
);

export default TopNav;

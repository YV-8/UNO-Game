import { createContext, useContext, useState } from 'react';

/*
 * Seed for the shared game context described in PROJECT_SUMMARY.md section 8
 * (GameContext + useGameSocket). For now it only tracks which game is
 * "active" — the Socket.IO wiring is a
 * later iteration, this just keeps the same context shape ready for it.
 */
const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const [activeGameId, setActiveGameId] = useState('');
    return (
        <GameContext.Provider value={{ activeGameId, setActiveGameId }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
    return ctx;
};

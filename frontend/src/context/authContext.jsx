import { createContext, useCallback, useContext, useState } from 'react';
import apiClient from '../api/client.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'uno_session';

const loadStoredSession = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(loadStoredSession);

    const persist = (next) => {
        setSession(next);
        if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        else localStorage.removeItem(STORAGE_KEY);
    };

    const login = useCallback(async ({ username, password }) => {
        const { access_token: token } = await apiClient.post('/auth/login', { username, password });
        const player = await apiClient.get('/auth/profile', token);
        persist({ token, player });
        return player;
    }, []);

    const register = useCallback(
        async ({ username, email, password }) => {
            await apiClient.post('/auth/register', { username, email, password });
            return login({ username, password });
        },
        [login]
    );

    const logout = useCallback(async () => {
        if (session?.token) {
            await apiClient.post('/auth/logout', undefined, session.token).catch(() => {});
        }
        persist(null);
    }, [session]);

    return (
        <AuthContext.Provider value={{ session, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};

import React, { createContext, useState, useEffect, PropsWithChildren } from 'react';

interface User {
    nickname: string;
    email: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    token: string | null;
    login: (userData?: User, token?: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userData = localStorage.getItem('userData');
        
        setIsLoggedIn(loggedIn);
        if (userData) {
            setUser(JSON.parse(userData));
        }
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const login = (userData?: User, token?: string) => {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
        
        if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
            setUser(userData);
        }
        
        if (token) {
            localStorage.setItem('userToken', token);
            setToken(token);
        }
    };

    const logout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
    };

    const value = { isLoggedIn, user, token, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
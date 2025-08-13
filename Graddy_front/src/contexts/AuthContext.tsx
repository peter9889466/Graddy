// src/contexts/AuthContext.js

// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, PropsWithChildren } from 'react';

// createContext의 초기값으로 null 대신 타입 지정
interface AuthContextType {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

// 초기값으로 null을 사용하고, 나중에 값으로 덮어쓸 것임을 알려주기 위해 null 허용
export const AuthContext = createContext<AuthContextType | null>(null);

// children prop의 타입을 명시적으로 지정
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);
    }, []);

    const login = () => {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
    };

    const value = { isLoggedIn, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
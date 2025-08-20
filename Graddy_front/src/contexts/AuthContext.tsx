// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect, PropsWithChildren } from 'react';

// createContext의 초기값으로 null 대신 타입 지정
interface User {
    nickname: string;
    email: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (userData?: User) => void;
    logout: () => void;
}

// 초기값으로 null을 사용하고, 나중에 값으로 덮어쓸 것임을 알려주기 위해 null 허용
export const AuthContext = createContext<AuthContextType | null>(null);

// children prop의 타입을 명시적으로 지정
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userData = localStorage.getItem('userData');
        
        setIsLoggedIn(loggedIn);
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const login = (userData?: User) => {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
        
        if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
            setUser(userData);
        }
    };

    const logout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        setIsLoggedIn(false);
        setUser(null);
    };

    const value = { isLoggedIn, user, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
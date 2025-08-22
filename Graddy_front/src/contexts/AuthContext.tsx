import React, { createContext, useState, useEffect, PropsWithChildren } from 'react';

interface User {
    nickname: string;
    email: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    token: string | null; // 💡 토큰 상태 추가
    login: (userData?: User, token?: string) => void; // 💡 토큰 매개변수 추가
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('userToken'); // 💡 토큰 가져오기
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userData = localStorage.getItem('userData');
        const userToken = localStorage.getItem('token');
        
        setIsLoggedIn(loggedIn);
        setToken(userToken);
        if (userData) {
            setUser(JSON.parse(userData));
        }
        if (storedToken) { // 💡 토큰이 있으면 상태에 저장
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
    };

    const logout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken'); // 💡 토큰 삭제
        setIsLoggedIn(false);
        setUser(null);
        setToken(null); // 💡 상태 초기화
    };

    const value = { isLoggedIn, user, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
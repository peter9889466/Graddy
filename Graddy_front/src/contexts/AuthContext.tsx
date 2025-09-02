// src/contexts/AuthContext.js

import React, {
    createContext,
    useState,
    useEffect,
    PropsWithChildren,
} from "react";

interface User {
    nickname: string;
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
    const [token, setToken] = useState<string | null>(null); // 💡 토큰 상태 초기화

    useEffect(() => {
        const storedToken = localStorage.getItem("userToken");
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userData = localStorage.getItem("userData");

        setIsLoggedIn(loggedIn);
        if (userData) {
            setUser(JSON.parse(userData));
        }
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const login = (userData?: User, token?: string) => {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);

        if (userData) {
            localStorage.setItem("userData", JSON.stringify(userData));
            setUser(userData);
        }

        if (token) {
            // 💡 토큰이 전달되면 로컬 스토리지에 저장
            localStorage.setItem("userToken", token);
            setToken(token); // 💡 상태에도 저장
        }
    };

    const logout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userData");
        localStorage.removeItem("userToken");
        setIsLoggedIn(false);
        setUser(null);
        setToken(null);
    };

    const value = { isLoggedIn, user, token, login, logout }; // 💡 토큰을 값에 포함

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

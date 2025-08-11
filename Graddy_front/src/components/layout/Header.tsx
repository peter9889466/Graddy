import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    // 임시로 로그인 상태를 관리 (나중에 전역 상태나 context로 변경 가능)
    const [isLoggedIn, setIsLoggedIn] = useState(true); // 테스트를 위해 true로 설정
    const navigate = useNavigate();

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    const handleMyPageClick = () => {
        navigate("/mypage");
    };

    return (
        <header
            className="shadow-lg transition-all duration-300 ease-in-out"
            style={{ backgroundColor: "#FFF3D2" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 로고 */}
                    <div className="flex items-center space-x-2 cursor-pointer transform hover:scale-105 transition-transform duration-200">
                        <img
                            src="/logo.png"
                            alt="Graddy Logo"
                            className="h-12 w-auto drop-shadow-sm"
                        />
                    </div>

                    {/* 로그인된 상태의 네비게이션 메뉴 */}
                    {isLoggedIn ? (
                        <div className="flex items-center space-x-6 animate-fadeIn">
                            <button
                                className="font-medium transition-all duration-200 hover:scale-105 hover:drop-shadow-sm relative group"
                                style={{ color: "#8B85E9" }}
                            >
                                자유게시판
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                            </button>
                            <button
                                className="font-medium transition-all duration-200 hover:scale-105 hover:drop-shadow-sm relative group"
                                style={{ color: "#8B85E9" }}
                            >
                                스터디
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                            </button>
                            <button
                                onClick={handleMyPageClick}
                                className="px-6 py-2 text-white rounded-lg font-medium transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                마이페이지
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 text-white rounded-lg font-medium transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                로그아웃
                            </button>
                        </div>
                    ) : (
                        /* 로그아웃된 상태의 네비게이션 메뉴 */
                        <div className="flex items-center space-x-6 animate-fadeIn">
                            <button
                                className="font-medium transition-all duration-200 hover:scale-105 hover:drop-shadow-sm relative group"
                                style={{ color: "#8B85E9" }}
                            >
                                자유게시판
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                            </button>
                            <button
                                className="font-medium transition-all duration-200 hover:scale-105 hover:drop-shadow-sm relative group"
                                style={{ color: "#8B85E9" }}
                            >
                                스터디
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                            </button>
                            <button
                                onClick={handleLogin}
                                className="px-8 py-2 text-white rounded-lg font-medium transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 relative overflow-hidden group"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                <span className="relative z-10">로그인</span>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </header>
    );
};

export default Header;

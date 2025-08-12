import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header: React.FC = () => {
    // 임시로 로그인 상태를 관리 (나중에 전역 상태나 context로 변경 가능)
    const [isLoggedIn, setIsLoggedIn] = useState(true); // 테스트를 위해 true로 설정
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsMobileMenuOpen(false);
    };

    const handleMyPageClick = () => {
        navigate("/mypage");
        setIsMobileMenuOpen(false);
    };

    const handleLogoClick = () => {
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header
            className="shadow-lg transition-all duration-300 ease-in-out relative"
            style={{ backgroundColor: "#FFFFFF" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* 로고 */}
                    <div
                        onClick={handleLogoClick}
                        className="flex items-center space-x-2 cursor-pointer transform hover:scale-105 transition-transform duration-200"
                    >
                        <img
                            src="/logo.png"
                            alt="Graddy Logo"
                            className="h-10 sm:h-12 lg:h-14 w-auto drop-shadow-sm"
                        />
                    </div>

                    {/* 데스크톱 네비게이션 메뉴 */}
                    <div className="hidden md:flex">
                        {isLoggedIn ? (
                            <div className="flex items-center space-x-3 lg:space-x-6 animate-fadeIn">
                                <button
                                    className="font-medium transition-all duration-200 hover:scale-105 hover:drop-shadow-sm relative group text-sm lg:text-base"
                                    style={{ color: "#8B85E9" }}
                                >
                                    자유게시판
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                                </button>
                                <button
                                    className="font-medium transition-all duration-200 hover:scale-105 hover:drop-shadow-sm relative group text-sm lg:text-base"
                                    style={{ color: "#8B85E9" }}
                                >
                                    스터디
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                                </button>
                                <button
                                    onClick={handleMyPageClick}
                                    className="px-3 lg:px-6 py-2 text-white rounded-lg font-medium transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 text-sm lg:text-base"
                                    style={{ backgroundColor: "#8B85E9" }}
                                >
                                    마이페이지
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 lg:px-6 py-2 text-white rounded-lg font-medium transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 text-sm lg:text-base"
                                    style={{ backgroundColor: "#8B85E9" }}
                                >
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3 lg:space-x-6 animate-fadeIn">
                                <button
                                    className="font-medium transition-all duration-200 hover:scale-105 hover:drop-shadow-sm relative group text-sm lg:text-base"
                                    style={{ color: "#8B85E9" }}
                                >
                                    자유게시판
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                                </button>
                                <button
                                    className="font-medium transition-all duration-200 hover:scale-105 hover:drop-shadow-sm relative group text-sm lg:text-base"
                                    style={{ color: "#8B85E9" }}
                                >
                                    스터디
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                                </button>
                                <button
                                    onClick={handleLogin}
                                    className="px-4 lg:px-8 py-2 text-white rounded-lg font-medium transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 relative overflow-hidden group text-sm lg:text-base"
                                    style={{ backgroundColor: "#8B85E9" }}
                                >
                                    <span className="relative z-10">
                                        로그인
                                    </span>
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 모바일 햄버거 메뉴 버튼 */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg transition-all duration-200 hover:bg-white hover:bg-opacity-20"
                            style={{ color: "#8B85E9" }}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* 모바일 드롭다운 메뉴 */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
                        <div className="px-4 py-4 space-y-3">
                            {isLoggedIn ? (
                                <>
                                    <button
                                        className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-200"
                                        style={{ color: "#8B85E9" }}
                                    >
                                        자유게시판
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-200"
                                        style={{ color: "#8B85E9" }}
                                    >
                                        스터디
                                    </button>
                                    <button
                                        onClick={handleMyPageClick}
                                        className="block w-full text-left px-4 py-3 text-white rounded-lg font-medium transition-all duration-200"
                                        style={{ backgroundColor: "#8B85E9" }}
                                    >
                                        마이페이지
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-3 text-white rounded-lg font-medium transition-all duration-200"
                                        style={{ backgroundColor: "#8B85E9" }}
                                    >
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-200"
                                        style={{ color: "#8B85E9" }}
                                    >
                                        자유게시판
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-200"
                                        style={{ color: "#8B85E9" }}
                                    >
                                        스터디
                                    </button>
                                    <button
                                        onClick={handleLogin}
                                        className="block w-full text-left px-4 py-3 text-white rounded-lg font-medium transition-all duration-200"
                                        style={{ backgroundColor: "#8B85E9" }}
                                    >
                                        로그인
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
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

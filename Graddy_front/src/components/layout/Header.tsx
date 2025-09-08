import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext"; // AuthContext 가져오기

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const authContext = useContext(AuthContext); // Context를 가져옴

    // authContext가 null인 경우를 대비한 안전 장치
    if (!authContext) {
        throw new Error(
            "Header 컴포넌트는 AuthProvider 내에서 사용되어야 합니다."
        );
    }
    const { isLoggedIn, logout } = authContext;

    // 현재 경로에 따른 활성 상태 확인 함수
    const isActiveRoute = (route: string) => {
        return location.pathname === route;
    };

    const handleLogin = () => {
        navigate("/login");
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
        navigate("/");
    };

    const handleMyPageClick = () => {
        navigate("/mypage");
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    // 프로필 메뉴 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)
            ) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogoClick = () => {
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    const handleStudySearch = () => {
        navigate("/search");
        setIsMobileMenuOpen(false);
    };

    const handleRanking = () => {
        navigate("/ranking");
        setIsMobileMenuOpen(false);
    };

    const handleCommunity = () => {
        navigate("/community");
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            className={`shadow-md transition-all duration-300 ease-in-out relative backdrop-blur-sm `}
        >
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex items-center h-20">
                    {/* 로고 */}
                    <div
                        onClick={handleLogoClick}
                        className="flex items-center space-x-2 cursor-pointer transform hover:scale-105 transition-transform duration-200"
                    >
                        <img
                            src="/logo.png"
                            alt="Graddy Logo"
                            className="h-12 sm:h-14 lg:h-16 w-auto drop-shadow-sm"
                        />
                    </div>

                    <div className="hidden md:flex items-center space-x-8 ml-8">
                        <>
                            <button
                                onClick={handleStudySearch}
                                className={`relative group transition-colors duration-200 font-medium ${
                                    isActiveRoute('/search') ? 'text-[#8B85E9]' : 'text-gray-700 hover:text-[#8B85E9]'
                                }`}
                            >
                                찾기
                                <div className={`absolute -bottom-1 left-0 h-0.5 bg-[#8B85E9] transition-all duration-300 ease-in-out ${
                                    isActiveRoute('/search') 
                                        ? 'w-full' 
                                        : 'w-0 group-hover:w-full'
                                }`}></div>
                            </button>
                            <button
                                onClick={handleRanking}
                                className={`relative group transition-colors duration-200 font-medium ${
                                    isActiveRoute('/ranking') ? 'text-[#8B85E9]' : 'text-gray-700 hover:text-[#8B85E9]'
                                }`}
                            >
                                랭킹
                                <div className={`absolute -bottom-1 left-0 h-0.5 bg-[#8B85E9] transition-all duration-300 ease-in-out ${
                                    isActiveRoute('/ranking') 
                                        ? 'w-full' 
                                        : 'w-0 group-hover:w-full'
                                }`}></div>
                            </button>

                            <button
                                onClick={handleCommunity}
                                className={`relative group transition-colors duration-200 font-medium ${
                                    isActiveRoute('/community') ? 'text-[#8B85E9]' : 'text-gray-700 hover:text-[#8B85E9]'
                                }`}
                            >
                                커뮤니티
                                <div className={`absolute -bottom-1 left-0 h-0.5 bg-[#8B85E9] transition-all duration-300 ease-in-out ${
                                    isActiveRoute('/community') 
                                        ? 'w-full' 
                                        : 'w-0 group-hover:w-full'
                                }`}></div>
                            </button>
                        </>
                    </div>
                    <div className="hidden md:flex flex-1 items-center justify-end space-x-2 lg:space-x-4 animate-fadeIn">
                        {isLoggedIn ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={toggleProfileMenu}
                                    className="w-12 h-12 rounded-full overflow-hidden transform hover:scale-105 transition-all duration-200 shadow-md"
                                >
                                    <img
                                        src="/android-icon-72x72.png"
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </button>

                                {/* 드롭다운 메뉴 */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        <button
                                            onClick={handleMyPageClick}
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-2"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                            <span>마이페이지</span>
                                        </button>
                                        <hr className="my-1 border-gray-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
                                            <span>로그아웃</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="px-6 lg:px-8 py-2 text-white rounded-xl font-semibold transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 relative overflow-hidden group text-sm lg:text-base shadow-md"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                <span className="relative z-10">로그인</span>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

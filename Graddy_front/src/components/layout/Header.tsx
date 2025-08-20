import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext"; // AuthContext 가져오기
import { Menu, X, Search } from "lucide-react";

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchCategory, setSearchCategory] = useState("제목");
    const navigate = useNavigate();
    const authContext = useContext(AuthContext); // Context를 가져옴

    // authContext가 null인 경우를 대비한 안전 장치
    if (!authContext) {
        throw new Error(
            "Header 컴포넌트는 AuthProvider 내에서 사용되어야 합니다."
        );
    }
    const { isLoggedIn, logout } = authContext;

    const handleLogin = () => {
        navigate("/login");
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate("/");
    };

    const handleMyPageClick = () => {
        navigate("/mypage");
        setIsMobileMenuOpen(false);
    };

    const handleLogoClick = () => {
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    const handleStudySearch = () => {
        navigate("/search");
        setIsMobileMenuOpen(false);
    };

    const handleStudyCreate = () => {
        // 스터디 생성 페이지로 이동 (나중에 구현)
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    return (
        <header
            className="shadow-md transition-all duration-200 ease-in-out relative backdrop-blur-sm"
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
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

                    {/* 스터디 생성 및 검색 링크 */}
                    <div className="hidden md:flex items-center space-x-8 ml-8">
                        <button
                            onClick={() => navigate("/study-create")}
                            className="relative group text-gray-700 hover:text-[#8B85E9] transition-colors duration-200 font-medium"
                        >
                            스터디 생성
                            <div className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#8B85E9] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out transform -translate-x-1/2 group-hover:translate-x-0"></div>
                        </button>
                        <button
                            onClick={() => navigate("/search")}
                            className="relative group text-gray-700 hover:text-[#8B85E9] transition-colors duration-200 font-medium"
                        >
                            스터디 검색
                            <div className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#8B85E9] group-hover:w-full group-hover:left-0 transition-all duration-300 ease-in-out transform -translate-x-1/2 group-hover:translate-x-0"></div>
                        </button>
                    </div>

                    <div className="hidden md:flex flex-1 items-center justify-end space-x-2 lg:space-x-4 animate-fadeIn">
                        {/* 스터디 검색 영역 */}
                        
                        {isLoggedIn ? (
                            <>
                                <button
                                    onClick={handleMyPageClick}
                                    className="px-4 lg:px-6 py-2 text-white rounded-xl font-semibold transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 text-sm lg:text-base shadow-md"
                                    style={{ backgroundColor: "#8B85E9" }}
                                >
                                    마이페이지
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 lg:px-6 py-2 text-white rounded-xl font-semibold transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 text-sm lg:text-base shadow-md"
                                    style={{ backgroundColor: "#8B85E9" }}
                                >
                                    로그아웃
                                </button>
                            </>
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

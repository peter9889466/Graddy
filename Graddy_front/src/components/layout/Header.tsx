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
        logout(); // Context의 logout 함수 호출
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

    const handleSearch = () => {
        navigate("/search");
        setIsMobileMenuOpen(false);
    };

    const handleSearchToggle = () => {
        setIsSearchOpen(!isSearchOpen);
        if (isSearchOpen) {
            setSearchQuery("");
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate("/search", {
                state: {
                    searchValue: searchQuery.trim(),
                    searchCategory: searchCategory,
                },
            });
            setIsSearchOpen(false);
            setSearchQuery("");
            setIsMobileMenuOpen(false);
        }
    };

    const handleSearchInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchQuery(e.target.value);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header
            className="shadow-xl transition-all duration-300 ease-in-out relative backdrop-blur-sm"
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

                    <div className="hidden md:flex flex-1 items-center justify-end space-x-2 lg:space-x-4 animate-fadeIn">
                        {/* 스터디 검색 영역 */}
                        <div className=" items-center rounded-xl px-3 py-1">
                            <div className="w-full flex items-center gap-3">
                                <div
                                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                        isSearchOpen
                                            ? "w-36 opacity-100"
                                            : "w-0 opacity-0"
                                    }`}
                                >
                                    <select
                                        value={searchCategory}
                                        onChange={(e) =>
                                            setSearchCategory(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none shadow-sm"
                                    >
                                        <option value="제목">제목</option>
                                        <option value="스터디장">
                                            스터디장
                                        </option>
                                        <option value="태그">태그</option>
                                    </select>
                                </div>

                                <form
                                    onSubmit={handleSearchSubmit}
                                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                                        isSearchOpen
                                            ? "w-96 opacity-100"
                                            : "w-0 opacity-0"
                                    }`}
                                >
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchInputChange}
                                        placeholder="스터디를 검색해보세요"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-base shadow-sm"
                                        autoFocus={isSearchOpen}
                                    />
                                </form>

                                <button
                                    onClick={handleSearchToggle}
                                    className={`p-2 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-md ${
                                        isSearchOpen
                                            ? "ml-2 bg-white shadow-sm"
                                            : "hover:scale-110"
                                    }`}
                                    style={{ color: "#8B85E9" }}
                                    title={
                                        isSearchOpen ? "검색 닫기" : "검색 열기"
                                    }
                                >
                                    {isSearchOpen ? (
                                        <X className="w-5 h-5" />
                                    ) : (
                                        <Search className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
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

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </header>
    );
};

export default Header;

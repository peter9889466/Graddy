import React from "react";

const Header: React.FC = () => {
    return (
        <header className="shadow-sm" style={{ backgroundColor: "#FFF3D2" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 로고 */}
                    <div className="flex items-center space-x-2">
                        <img
                            src="/logo.png"
                            alt="Graddy Logo"
                            className="h-12 w-auto"
                        />
                    </div>

                    {/* 네비게이션 메뉴 */}
                    <div className="flex items-center space-x-6">
                        <button
                            className="font-medium transition-colors hover:opacity-80"
                            style={{ color: "#8B85E9" }}
                        >
                            자유게시판
                        </button>
                        <button
                            className="font-medium transition-colors hover:opacity-80"
                            style={{ color: "#8B85E9" }}
                        >
                            스터디
                        </button>
                        <button
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium"
                            style={{ backgroundColor: "#8B85E9" }}
                        >
                            마이페이지
                        </button>
                        <button
                            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium"
                            style={{ backgroundColor: "#8B85E9" }}
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

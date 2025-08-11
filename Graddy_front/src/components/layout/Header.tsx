import React from "react";

const Header: React.FC = () => {
    return (
        <header className="bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* 로고 */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-purple-600">
                            Graddy
                        </span>
                    </div>

                    {/* 네비게이션 메뉴 */}
                    <div className="flex items-center space-x-6">
                        <button className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                            자유게시판
                        </button>
                        <button className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                            스터디
                        </button>
                        <button className="px-4 py-2 text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors font-medium">
                            마이페이지
                        </button>
                        <button className="px-4 py-2 text-purple-600 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

import React from "react";

const Footer: React.FC = () => {
    return (
        <footer
            className="mt-auto border-t shadow-sm"
            style={{ backgroundColor: "#FFF3D2", borderColor: "#8B85E9" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    {/* 로고 및 회사 정보 */}
                    <div className="flex flex-col items-center md:items-start space-y-2">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/logo.png"
                                alt="Graddy Logo"
                                className="h-8 w-auto"
                            />
                            <span
                                className="text-lg font-bold"
                                style={{ color: "#8B85E9" }}
                            >
                                Graddy
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 text-center md:text-left">
                            함께 성장하는 스터디 플랫폼
                        </p>
                    </div>

                    {/* 링크 섹션 */}
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 text-center">
                        <div className="space-y-2">
                            <h4
                                className="text-sm font-semibold"
                                style={{ color: "#8B85E9" }}
                            >
                                서비스
                            </h4>
                            <div className="space-y-1">
                                <button className="block text-xs sm:text-sm text-gray-600 hover:text-purple-600 transition-colors">
                                    자유게시판
                                </button>
                                <button className="block text-xs sm:text-sm text-gray-600 hover:text-purple-600 transition-colors">
                                    스터디 찾기
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4
                                className="text-sm font-semibold"
                                style={{ color: "#8B85E9" }}
                            >
                                고객지원
                            </h4>
                            <div className="space-y-1">
                                <button className="block text-xs sm:text-sm text-gray-600 hover:text-purple-600 transition-colors">
                                    FAQ
                                </button>
                                <button className="block text-xs sm:text-sm text-gray-600 hover:text-purple-600 transition-colors">
                                    문의하기
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 연락처 정보 */}
                    <div className="text-center md:text-right space-y-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                            이메일: support@graddy.com
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                            전화: 02-1234-5678
                        </p>
                    </div>
                </div>

                {/* 저작권 정보 */}
                <div className="mt-6 pt-4 border-t border-purple-200 text-center">
                    <p className="text-xs text-gray-500">
                        © 2024 Graddy. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

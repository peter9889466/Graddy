import React from "react";

const Footer: React.FC = () => {
    return (
        <footer
            className="mt-auto border-t shadow-sm"
            style={{ backgroundColor: "#FFFFFF", bordercolor: "#777777" }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
                    {/* 로고 및 회사 정보 */}
                    <div className="flex items-center space-x-2">
                        <img
                            src="/logo.png"
                            alt="Graddy Logo"
                            className="h-10 w-auto"
                        />

                        <p className="text-xs text-gray-600 text-center md:text-left">
                            함께 성장하는 스터디 플랫폼
                        </p>
                    </div>

                    {/* 링크 섹션 */}
                    <div className="flex flex-row space-x-6 sm:space-x-8 text-center">
                        <a className="text-xs sm:text-sm text-gray-600 transition-colors">
                            FAQ
                        </a>
                        <a className="text-xs sm:text-sm text-gray-600 transition-colors">
                            문의하기
                        </a>
                    </div>

                    {/* 연락처 정보 */}
                    <div className="text-center md:text-right">
                        <a
                            className="text-xs sm:text-sm text-gray-600 transition-colors"
                            href="https://www.github.com/peter9889466/Graddy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                    </div>
                </div>

                {/* 저작권 정보 */}
                <div className="mt-1 pt-1 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        © 2025 Graddy. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

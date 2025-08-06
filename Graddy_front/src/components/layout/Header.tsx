import React from "react";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/clerk-react";
import SearchBar from "../search/SearchBar";

const Header: React.FC = () => {
    return (
        <>
            {/* 로그인된 사용자 헤더 */}
            <SignedIn>
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* 로고 */}
                            <div className="flex items-center">
                                <img
                                    src="/logo.png"
                                    alt="Graddy Logo"
                                    className="h-12 w-auto"
                                />
                            </div>

                            {/* 검색바 */}
                            <SearchBar />

                            {/* 사용자 메뉴 */}
                            <div className="flex items-center space-x-4">
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                                    마이페이지
                                </button>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                    로그아웃
                                </button>
                                <UserButton />
                            </div>
                        </div>
                    </div>
                </header>
            </SignedIn>

            {/* 비로그인 사용자 헤더 */}
            <SignedOut>
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* 로고 */}
                            <div className="flex items-center">
                                <img
                                    src="/logo.png"
                                    alt="Graddy Logo"
                                    className="h-12 w-auto"
                                />
                            </div>

                            {/* 로그인 버튼 */}
                            <div className="flex items-center">
                                <SignInButton>
                                    <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                                        로그인
                                    </button>
                                </SignInButton>
                            </div>
                        </div>
                    </div>
                </header>
            </SignedOut>
        </>
    );
};

export default Header;

import React from "react";
import { useAutoComplete } from "../../hooks/useAutoComplete";

// 검색 데이터 타입 정의
interface SearchItem {
    id: string;
    title: string;
    category: string;
}

// 샘플 검색 데이터 (실제로는 API에서 가져올 데이터)
const searchItems: SearchItem[] = [
    { id: "1", title: "리액트 기초", category: "프로그래밍" },
    { id: "2", title: "자바스크립트 심화", category: "프로그래밍" },
    { id: "3", title: "타입스크립트 입문", category: "프로그래밍" },
    { id: "4", title: "웹 디자인 기초", category: "디자인" },
    { id: "5", title: "UI/UX 디자인", category: "디자인" },
    { id: "6", title: "데이터베이스 설계", category: "데이터베이스" },
    { id: "7", title: "SQL 쿼리 최적화", category: "데이터베이스" },
    { id: "8", title: "파이썬 프로그래밍", category: "프로그래밍" },
    { id: "9", title: "머신러닝 기초", category: "AI" },
    { id: "10", title: "딥러닝 실습", category: "AI" },
];

const SearchBar: React.FC = () => {
    // 자동완성 훅 사용
    const {
        isOpen,
        filteredItems,
        activeIndex,
        getInputProps,
        getItemProps,
        getResetButtonProps,
    } = useAutoComplete({
        items: searchItems,
        filterFn: (item: SearchItem, inputValue: string) => {
            const searchTerm = inputValue.toLowerCase();
            return (
                item.title.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        },
        debounceDelay: 200,
    });

    return (
        <div className="relative flex-1 max-w-2xl mx-8">
            <div className="relative">
                <input
                    {...getInputProps()}
                    type="text"
                    placeholder="검색"
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </button>
            </div>

            {/* 자동완성 드롭다운 */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredItems.map((item, index) => (
                        <div
                            {...getItemProps(index)}
                            className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                                activeIndex === index
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-900"
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">
                                        {item.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {item.category}
                                    </div>
                                </div>
                                <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;

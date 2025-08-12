import React, { useState, useEffect, useRef } from "react";
import { useAutoComplete } from "../../hooks/useAutoComplete";

// 검색 타입 정의
type SearchType = "title" | "author" | "both";

interface SearchTypeOption {
    value: SearchType;
    label: string;
}

const searchTypeOptions: SearchTypeOption[] = [
    { value: "title", label: "제목" },
    { value: "author", label: "작성자" },
    { value: "both", label: "제목 + 작성자" },
];

// 검색 데이터 타입 정의
interface SearchItem {
    id: string;
    title: string;
    author: string;
    category: string;
}

// 샘플 검색 데이터 (실제로는 API에서 가져올 데이터)
const searchItems: SearchItem[] = [
    { id: "1", title: "리액트 기초", author: "김개발", category: "프로그래밍" },
    {
        id: "2",
        title: "자바스크립트 심화",
        author: "이코딩",
        category: "프로그래밍",
    },
    {
        id: "3",
        title: "타입스크립트 입문",
        author: "박타입",
        category: "프로그래밍",
    },
    {
        id: "4",
        title: "웹 디자인 기초",
        author: "최디자인",
        category: "디자인",
    },
    { id: "5", title: "UI/UX 디자인", author: "정유엑스", category: "디자인" },
    {
        id: "6",
        title: "데이터베이스 설계",
        author: "한데이터",
        category: "데이터베이스",
    },
    {
        id: "7",
        title: "SQL 쿼리 최적화",
        author: "조쿼리",
        category: "데이터베이스",
    },
    {
        id: "8",
        title: "파이썬 프로그래밍",
        author: "김파이썬",
        category: "프로그래밍",
    },
    { id: "9", title: "머신러닝 기초", author: "이머신", category: "AI" },
    { id: "10", title: "딥러닝 실습", author: "박딥러닝", category: "AI" },
];

const SearchBar: React.FC = () => {
    const [searchType, setSearchType] = useState<SearchType>("title");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 검색 타입에 따른 필터링 함수
    const getFilterFunction = (type: SearchType) => {
        return (item: SearchItem, inputValue: string) => {
            const searchTerm = inputValue.toLowerCase();
            switch (type) {
                case "title":
                    return item.title.toLowerCase().includes(searchTerm);
                case "author":
                    return item.author.toLowerCase().includes(searchTerm);
                case "both":
                    return (
                        item.title.toLowerCase().includes(searchTerm) ||
                        item.author.toLowerCase().includes(searchTerm)
                    );
                default:
                    return false;
            }
        };
    };

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
        filterFn: getFilterFunction(searchType),
        debounceDelay: 200,
    });

    const currentSearchTypeLabel =
        searchTypeOptions.find((option) => option.value === searchType)
            ?.label || "제목";

    return (
        <div className="flex items-center space-x-3 flex-1 max-w-2xl mx-8">
            {/* 검색 타입 선택 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none min-w-[100px]"
                >
                    <span className="text-sm font-medium text-gray-700">
                        {currentSearchTypeLabel}
                    </span>
                    <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                            isDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]">
                        {searchTypeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setSearchType(option.value);
                                    setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md ${
                                    searchType === option.value
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-700"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 검색 입력창 */}
            <div className="relative flex-1">
                <input
                    {...getInputProps()}
                    type="text"
                    placeholder={`${currentSearchTypeLabel}으로 검색`}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none"
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
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-40 max-h-60 overflow-y-auto">
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
                                        작성자: {item.author} | {item.category}
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

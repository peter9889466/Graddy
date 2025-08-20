import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";      
import { useAutoComplete } from "../hooks/useAutoComplete";
import { studyList, searchSuggestions, StudyData } from "../data/studyData";
import { Search } from "lucide-react";

export const StudySearchPage = () => {
    const location = useLocation();
    const [selectedCategory, setSelectedCategory] = useState("제목");
    const [selectedStatus, setSelectedStatus] = useState("전체");
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const {
        inputValue,
        filteredSuggestions,
        showSuggestions,
        activeSuggestionIndex,
        handleInputChange,
        handleSuggestionClick,
        handleKeyDown,
        setInputValue,
    } = useAutoComplete({ suggestions: searchSuggestions });

    // Header에서 전달된 검색 파라미터 처리
    useEffect(() => {
        if (location.state) {
            const { searchValue, searchCategory } = location.state as {
                searchValue?: string;
                searchCategory?: string;
            };

            if (searchValue) {
                setInputValue(searchValue);
            }
            if (searchCategory) {
                setSelectedCategory(searchCategory);
            }
        }
    }, [location.state, setInputValue]);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusOpen(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredStudies = useMemo(() => {
        // 로컬 스토리지에서 사용자가 생성한 스터디 가져오기
        const userStudies: StudyData[] = JSON.parse(localStorage.getItem('userStudies') || '[]');
        
        // 기존 스터디 목록과 사용자 스터디 목록 합치기
        let filtered: StudyData[] = [...studyList, ...userStudies];

        // 모집 상태 필터링
        if (selectedStatus === "모집중") {
            filtered = filtered.filter((study) => study.isRecruiting);
        } else if (selectedStatus === "모집완료") {
            filtered = filtered.filter((study) => !study.isRecruiting);
        }
        // "전체"인 경우 필터링하지 않음

        // 검색어 필터링
        if (inputValue.trim()) {
            filtered = filtered.filter((study) => {
                switch (selectedCategory) {
                    case "제목":
                        return study.title
                            .toLowerCase()
                            .includes(inputValue.toLowerCase());
                    case "스터디장":
                        return study.leader
                            .toLowerCase()
                            .includes(inputValue.toLowerCase());
                    case "태그":
                        return study.tags.some((tag: string) =>
                            tag.toLowerCase().includes(inputValue.toLowerCase())
                        );
                    default:
                        return (
                            study.title
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()) ||
                            study.description
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                        );
                }
            });
        }

        return filtered;
    }, [inputValue, selectedCategory, selectedStatus]);

    const statusOptions = [
        { value: "전체", label: "전체" },
        { value: "모집중", label: "모집중" },
        { value: "모집완료", label: "모집완료" }
    ];

    const categoryOptions = [
        { value: "제목", label: "제목" },
        { value: "스터디장", label: "스터디장" },
        { value: "태그", label: "태그" }
    ];

    return (
        <div className="max-w-6xl mx-auto p-5 h-screen overflow-y-auto">
            <div className="flex gap-5 mb-8 items-center justify-center">
                <div className="flex gap-2.5">
                    {/* 모집 상태 드롭다운 */}
                    <div className="relative" ref={statusDropdownRef}>
                        <button
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className={`px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${
                                isStatusOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
                            } focus:outline-none min-w-[120px]`}
                        >
                            <span>{selectedStatus}</span>
                            <svg 
                                className={`w-4 h-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {isStatusOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                                {statusOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedStatus(option.value);
                                            setIsStatusOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${index !== statusOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        style={{ 
                                            backgroundColor: selectedStatus === option.label ? '#E8E6FF' : '#FFFFFF',
                                            color: selectedStatus === option.label ? '#8B85E9' : '#374151'
                                        }}
                                    >
                                        <div className="font-medium">{option.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 검색 카테고리 드롭다운 */}
                    <div className="relative" ref={categoryDropdownRef}>
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className={`px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${
                                isCategoryOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
                            } focus:outline-none min-w-[100px]`}
                        >
                            <span>{selectedCategory}</span>
                            <svg 
                                className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {isCategoryOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                                {categoryOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedCategory(option.value);
                                            setIsCategoryOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${index !== categoryOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        style={{ 
                                            backgroundColor: selectedCategory === option.label ? '#E8E6FF' : '#FFFFFF',
                                            color: selectedCategory === option.label ? '#8B85E9' : '#374151'
                                        }}
                                    >
                                        <div className="font-medium">{option.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative w-[500px]">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="검색어를 입력하세요"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base outline-none"
                    />
                                         <button
                         style={{ color: "#8B85E9" }}
                         className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-lg cursor-pointer"
                     >
                         <Search size={20} className="text-gray-500" />
                     </button>

                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 rounded-b-lg max-h-48 overflow-y-auto z-50">
                            {filteredSuggestions.map((suggestion, index) => (
                                <div
                                    key={suggestion}
                                    className={`px-4 py-2.5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                                        index === activeSuggestionIndex
                                            ? "bg-gray-50"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleSuggestionClick(suggestion)
                                    }
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-5">
                {filteredStudies.map((study) => (
                    <div
                        key={study.id}
                        className="flex items-center p-5 border border-gray-200 rounded-lg bg-white gap-5"
                    >
                        <div className="flex-1">
                            <div className="text-lg font-bold text-gray-800 mb-2">
                                {study.title}
                            </div>
                            <div className="text-base mb-2 text-gray-800">
                                {study.description}
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                                스터디 기간: {study.period} / 스터디장:{" "}
                                {study.leader}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {study.tags.map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-xl text-xs"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="min-w-20">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    study.isRecruiting
                                        ? "bg-blue-50 text-blue-700"
                                        : "bg-purple-50 text-purple-700"
                                }`}
                            >
                                {study.recruitmentStatus}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

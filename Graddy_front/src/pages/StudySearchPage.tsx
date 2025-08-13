import React, { useState, useMemo } from "react";
import { useAutoComplete } from "../hooks/useAutoComplete";
import { studyList, searchSuggestions, StudyData } from "../data/studyData";

export const StudySearchPage = () => {
    const [selectedCategory, setSelectedCategory] = useState("제목");
    const [selectedStatus, setSelectedStatus] = useState("모집중");

    const {
        inputValue,
        filteredSuggestions,
        showSuggestions,
        activeSuggestionIndex,
        handleInputChange,
        handleSuggestionClick,
        handleKeyDown,
    } = useAutoComplete({ suggestions: searchSuggestions });

    const filteredStudies = useMemo(() => {
        let filtered = studyList;

        // 모집 상태 필터링
        if (selectedStatus === "모집중") {
            filtered = filtered.filter((study) => study.isRecruiting);
        } else if (selectedStatus === "모집완료") {
            filtered = filtered.filter((study) => !study.isRecruiting);
        }

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
                        return study.tags.some((tag) =>
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

    return (
        <div className="max-w-6xl mx-auto p-5">
            <div className="flex gap-5 mb-8 items-center">
                <div className="flex gap-2.5">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                    >
                        <option value="전체">모집중/모집완료</option>
                        <option value="모집중">모집중</option>
                        <option value="모집완료">모집완료</option>
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                    >
                        <option value="제목">제목</option>
                        <option value="스터디장">스터디장</option>
                        <option value="태그">태그</option>
                    </select>
                </div>

                <div className="relative flex-1 flex">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="검색어를 입력하세요"
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-base outline-none focus:border-violet-500"
                    />
                    <button className="absolute right-2.5 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-lg cursor-pointer">
                        🔍
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

                        <div className="flex-1">
                            <div className="text-base mb-2 text-gray-800">
                                {study.description}
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                                스터디 기간: {study.period}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {study.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-xl text-xs"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="text-right min-w-36">
                            <div className="text-lg font-bold text-gray-800 mb-2">
                                {study.title}
                            </div>
                            <div className="text-sm text-gray-600">
                                스터디장: {study.leader}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAutoComplete } from "../hooks/useAutoComplete";
import { searchSuggestions } from "../data/studyData";
import { StudyApiService, StudyData, BackendStudyProjectData } from "../services/studyApi";
import { Search, Plus } from "lucide-react";

export const StudySearchPage = () => {
    const location = useLocation();
    const [selectedCategory, setSelectedCategory] = useState("제목");
    const [selectedStatus, setSelectedStatus] = useState("전체");
    const [selectedType, setSelectedType] = useState("전체");
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const typeDropdownRef = useRef<HTMLDivElement>(null);
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
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setIsTypeOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [studiesProjects, setStudiesProjects] = useState<BackendStudyProjectData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 백엔드에서 스터디/프로젝트 목록 가져오기
    useEffect(() => {
        const fetchStudiesProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('API 호출 시작...');
                const data = await StudyApiService.getStudiesProjects();
                console.log('API 응답 데이터:', data);
                console.log('데이터 타입:', typeof data);
                console.log('데이터 길이:', Array.isArray(data) ? data.length : '배열이 아님');
                
                if (Array.isArray(data)) {
                    setStudiesProjects(data);
                    console.log('스터디/프로젝트 데이터 로드 성공:', data);
                } else {
                    console.warn('API 응답이 배열이 아닙니다:', data);
                    setStudiesProjects([]);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : '스터디/프로젝트 데이터를 불러오는데 실패했습니다.';
                setError(errorMessage);
                console.error('스터디/프로젝트 목록 조회 실패:', err);
                console.error('에러 상세:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudiesProjects();
    }, []);

    const filteredStudies = useMemo(() => {
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const convertedStudies = studiesProjects.map(study => {
            // ENUM 값에 따른 모집 상태 매핑
            const getRecruitmentStatus = (isRecruiting: string) => {
                switch (isRecruiting) {
                    case 'recruitment':
                        return '모집중';
                    case 'complete':
                        return '모집 완료';
                    case 'end':
                        return '스터디 종료';
                    default:
                        return '모집중';
                }
            };

            const getIsRecruiting = (isRecruiting: string) => {
                return isRecruiting === 'recruitment';
            };

            return {
                studyId: study.studyProjectId,
                studyName: study.studyProjectName,
                studyTitle: study.studyProjectTitle,
                studyDesc: study.studyProjectDesc,
                studyLevel: study.studyLevel,
                userId: study.userId,
                studyStart: study.studyProjectStart,
                studyEnd: study.studyProjectEnd,
                studyTotal: study.studyProjectTotal,
                soltStart: study.soltStart,
                soltEnd: study.soltEnd,
                isRecruiting: getIsRecruiting(study.isRecruiting),
                recruitmentStatus: getRecruitmentStatus(study.isRecruiting),
                type: study.typeCheck === 'study' ? '스터디' : '프로젝트',
                tags: study.tagNames || [],
                leader: study.userId, // userId를 leader로 사용
                createdAt: study.createdAt,
                updatedAt: study.createdAt
            };
        });

        let filtered = convertedStudies;

        // 모집 상태 필터링
        if (selectedStatus === "모집중") {
            filtered = filtered.filter((study) => study.recruitmentStatus === "모집중");
        } else if (selectedStatus === "모집 완료") {
            filtered = filtered.filter((study) => study.recruitmentStatus === "모집 완료" || study.recruitmentStatus === "스터디 종료");
        }

        // 타입 필터링 (스터디/프로젝트)
        if (selectedType === "스터디") {
            filtered = filtered.filter((study) => study.type === "스터디");
        } else if (selectedType === "프로젝트") {
            filtered = filtered.filter((study) => study.type === "프로젝트");
        }

        // 검색어 필터링
        if (inputValue.trim()) {
            filtered = filtered.filter((study) => {
                switch (selectedCategory) {
                    case "제목":
                        return study.studyTitle
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
                            study.studyTitle
                                .toLowerCase()
                                .includes(inputValue.toLowerCase()) ||
                            study.studyDesc
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                        );
                }
            });
        }

        return filtered;
    }, [studiesProjects, inputValue, selectedCategory, selectedStatus, selectedType]);

    const statusOptions = [
        { value: "전체", label: "전체" },
        { value: "모집중", label: "모집중" },
        { value: "모집완료", label: "모집완료" }
    ];

    const typeOptions = [
        { value: "전체", label: "전체" },
        { value: "스터디", label: "스터디" },
        { value: "프로젝트", label: "프로젝트" }
    ];

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('날짜 포맷팅 오류:', error);
            return dateString; // 오류 시 원본 문자열 반환
        }
    };

    const categoryOptions = [
        { value: "제목", label: "제목" },
        { value: "스터디장", label: "스터디장" },
        { value: "태그", label: "태그" }
    ];

    return (
        <div className="max-w-6xl mx-auto p-5 min-h-screen scrollbar-hide">
            <div className="flex gap-5 mb-8 items-center justify-center">
                <div className="flex gap-2.5">
                    {/* 모집 상태 드롭다운 */}
                    <div className="relative" ref={statusDropdownRef}>
                        <button
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className={`px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${isStatusOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
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

                    {/* 타입 드롭다운 */}
                    <div className="relative" ref={typeDropdownRef}>
                        <button
                            onClick={() => setIsTypeOpen(!isTypeOpen)}
                            className={`px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${isTypeOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
                                } focus:outline-none min-w-[100px]`}
                        >
                            <span>{selectedType}</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isTypeOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                                {typeOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedType(option.value);
                                            setIsTypeOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${index !== typeOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        style={{
                                            backgroundColor: selectedType === option.label ? '#E8E6FF' : '#FFFFFF',
                                            color: selectedType === option.label ? '#8B85E9' : '#374151'
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
                            className={`px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${isCategoryOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
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
                                    className={`px-4 py-2.5 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${index === activeSuggestionIndex
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

                {/* 모집하기 버튼 */}
                <button
                    onClick={() => navigate('/study/create')}
                    className="px-6 py-2.5 bg-[#8B85E9] text-white rounded-lg font-medium hover:bg-[#7A74D8] transition-colors duration-200 flex items-center gap-2"
                >
                    생성하기
                </button>
            </div>

            <div className="flex flex-col gap-5">
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85E9]"></div>
                        <span className="ml-2 text-gray-600">스터디/프로젝트 데이터를 불러오는 중...</span>
                    </div>
                )}
                
                {error && (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-red-600 text-center">
                            <p className="font-medium">데이터 로드 실패</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
                
                {!loading && !error && filteredStudies.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>검색 결과가 없습니다.</p>
                    </div>
                )}
                
                {!loading && !error && filteredStudies.map((study) => (
                    <div
                        key={study.studyId}
                        className="flex items-center p-5 border border-gray-200 rounded-lg bg-white gap-5 cursor-pointer"
                    >
                        <div className="flex-1">
                            <div
                                className="text-lg font-bold text-gray-800 mb-2  duration-200"
                                onClick={() =>
                                    navigate(`/study/${study.studyId}`, {
                                        state: {
                                            title: study.studyTitle,
                                            description: study.studyDesc,
                                            leader: study.leader,
                                            period: `${formatDate(study.studyStart)} ~ ${formatDate(study.studyEnd)}`,
                                            tags: study.tags
                                        }
                                    })
                                }
                            >
                                {study.studyTitle}
                            </div>
                            <div
                                className="text-base mb-2 text-gray-800 duration-200"
                                onClick={() =>
                                    navigate(`/study/${study.studyId}`, {
                                        state: {
                                            title: study.studyTitle,
                                            description: study.studyDesc,
                                            leader: study.leader,
                                            period: `${formatDate(study.studyStart)} ~ ${formatDate(study.studyEnd)}`,
                                            tags: study.tags
                                        }
                                    })
                                }
                            >
                                {study.studyDesc}
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                                스터디 기간: {formatDate(study.studyStart)} ~ {formatDate(study.studyEnd)} / 스터디장:{" "}
                                {study.leader}
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {study.tags.map((tag: string, index: number) => (
                                    <span key={index} className="px-2 py-0.5 rounded-xl text-xs bg-gray-100 text-gray-600">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="min-w-20 flex flex-col items-center gap-2">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    study.recruitmentStatus === "모집중" 
                                        ? "bg-blue-50 text-blue-700"
                                        : study.recruitmentStatus === "모집 완료"
                                        ? "bg-purple-50 text-purple-700"
                                        : "bg-gray-50 text-gray-700"
                                }`}
                            >
                                {study.recruitmentStatus}
                            </span>
                            {study.recruitmentStatus === "모집중" && (
                                <span className="text-xs text-gray-600">
                                    (현재 인원/{study.studyTotal}명)
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

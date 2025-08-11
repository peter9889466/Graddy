import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

// 타입 정의
type Category =
    | "all"
    | "languages"
    | "frameworks"
    | "fields"
    | "platforms"
    | "skills";

interface TechData {
    languages: string[];
    frameworks: string[];
    fields: string[];
    platforms: string[];
    skills: string[];
}

interface TabConfig {
    id: Category;
    label: string;
}

interface InterestProps {
    maxSelections?: number;
    initialSelections?: string[];
    onComplete?: (selectedTags: string[]) => void;
    onCancel?: () => void;
}

// 기술 스택 데이터
const techData: TechData = {
    languages: [
        "Python",
        "JavaScript",
        "Java",
        "C#",
        "C++",
        "C",
        "TypeScript",
        "Kotlin",
        "Swift",
        "Go",
        "PHP",
        "Dart",
        "Rust",
        "Ruby",
        "Assembly",
    ],
    frameworks: [
        "React",
        "Node.js",
        "Spring",
        "Spring Boot",
        "Django",
        "Flask",
        "Vue",
        "Pandas",
        "Unity",
        "Angular",
        "Express",
        "FastAPI",
    ],
    fields: [
        "인공지능(AI)",
        "머신러닝",
        "딥러닝",
        "빅데이터",
        "LLM",
        "데이터 리터러시",
        "웹 프론트엔드",
        "웹 백엔드",
        "모바일 앱(iOS)",
        "모바일 앱(Android)",
        "임베디드",
        "게임 개발",
        "정보 보안",
        "모의해킹",
    ],
    platforms: [
        "AWS",
        "Docker",
        "Linux",
        "Git",
        "Kubernetes",
        "CI/CD",
        "NOSQL",
        "DBMS/RDBMS",
        "SQL",
        "MongoDB",
        "PostgreSQL",
        "Redis",
    ],
    skills: [
        "알고리즘",
        "코딩 테스트",
        "객체지향",
        "UI/UX",
        "서비스 기획",
        "데이터 구조",
        "네트워크",
        "운영체제",
        "소프트웨어 아키텍처",
    ],
};

// 탭 설정
const tabs: TabConfig[] = [
    { id: "all", label: "전체" },
    { id: "languages", label: "프로그래밍 언어" },
    { id: "frameworks", label: "프레임워크/라이브러리" },
    { id: "fields", label: "기술 분야" },
    { id: "platforms", label: "플랫폼/도구" },
    { id: "skills", label: "역량/개념" },
];

const InterestSelection: React.FC<InterestProps> = ({
    maxSelections = 10,
    initialSelections = [],
    onComplete,
    onCancel,
}) => {
    const [selectedTags, setSelectedTags] =
        useState<string[]>(initialSelections);
    const [currentCategory, setCurrentCategory] = useState<Category>("all");
    const [searchTerm, setSearchTerm] = useState("");

    // 모달 ref
    const modalRef = useRef<HTMLDivElement>(null);

    // ESC 키 이벤트 리스너
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleCancel();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // 모달이 열릴 때 포커스 설정
    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.focus();
        }
    }, []);

    // 현재 카테고리의 태그들 가져오기
    const getCurrentTags = useMemo((): string[] => {
        if (currentCategory === "all") {
            return Object.values(techData).flat();
        }
        return techData[currentCategory] || [];
    }, [currentCategory]);

    // 검색 필터링된 태그들
    const filteredTags = useMemo((): string[] => {
        return getCurrentTags.filter((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [getCurrentTags, searchTerm]);

    // 태그 선택/해제
    const toggleTag = (tag: string): void => {
        if (selectedTags.includes(tag)) {
            setSelectedTags((prev) => prev.filter((t) => t !== tag));
        } else {
            if (selectedTags.length >= maxSelections) {
                alert(`최대 ${maxSelections}개까지 선택할 수 있습니다.`);
                return;
            }
            setSelectedTags((prev) => [...prev, tag]);
        }
    };

    // 선택된 태그 제거
    const removeTag = (tag: string): void => {
        setSelectedTags((prev) => prev.filter((t) => t !== tag));
    };

    // 완료 버튼 클릭
    const handleComplete = (): void => {
        onComplete?.(selectedTags);
    };

    // 취소 버튼 클릭
    const handleCancel = (): void => {
        onCancel?.();
    };

    // 백드롭 클릭 핸들러
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-900/60 flex items-center justify-center p-4 z-50"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="text-center mb-6">
                    <h2
                        className="text-2xl sm:text-3xl font-bold mb-3"
                        style={{ color: "#8B85E9" }}
                    >
                        관심분야 수정
                    </h2>
                    <p className="text-gray-600 text-sm">
                        관심있는 기술과 분야를 선택해주세요 (최대{" "}
                        {maxSelections}개)
                    </p>
                </div>

                {/* 검색창 */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="기술이나 분야를 검색해보세요..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 border-2 rounded-full text-sm outline-none transition-colors focus:ring-2"
                        style={{
                            borderColor: "#8B85E9",
                        }}
                        onFocus={(e) => {
                            e.target.style.boxShadow =
                                "0 0 0 2px rgba(139, 133, 233, 0.2)";
                        }}
                        onBlur={(e) => {
                            e.target.style.boxShadow = "none";
                        }}
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>

                {/* 탭 네비게이션 */}
                <div className="mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setCurrentCategory(tab.id)}
                                className={`px-3 sm:px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                    currentCategory === tab.id
                                        ? "text-white shadow-lg"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                                style={
                                    currentCategory === tab.id
                                        ? { backgroundColor: "#8B85E9" }
                                        : {}
                                }
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 태그 그리드 */}
                <div className="mb-6">
                    <div className="h-48 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
                        {filteredTags.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                                검색 결과가 없습니다
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {filteredTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 sm:px-4 py-2 rounded-full text-xs font-medium transition-all ${
                                            selectedTags.includes(tag)
                                                ? "text-white shadow-md"
                                                : "bg-white text-gray-700 border border-gray-200 hover:bg-purple-50"
                                        }`}
                                        style={
                                            selectedTags.includes(tag)
                                                ? { backgroundColor: "#8B85E9" }
                                                : {}
                                        }
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 선택된 태그 영역 */}
                <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                        선택한 관심분야
                    </div>
                    <div
                        className="min-h-16 p-4 rounded-xl border border-dashed"
                        style={{
                            backgroundColor: "#F3F2FF",
                            borderColor: "#8B85E9",
                        }}
                    >
                        {selectedTags.length === 0 ? (
                            <div className="flex items-center justify-center h-8 text-gray-400 text-sm italic">
                                관심분야를 선택해주세요
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedTags.map((tag) => (
                                    <div
                                        key={tag}
                                        className="flex items-center gap-2 px-3 py-1 text-white rounded-full text-xs"
                                        style={{ backgroundColor: "#8B85E9" }}
                                    >
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="hover:opacity-70 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 카운트 정보 */}
                <div className="text-center text-sm text-gray-500 mb-6">
                    {selectedTags.length}/{maxSelections} 선택됨
                </div>

                {/* 버튼들 */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleComplete}
                        className="px-6 py-3 text-white rounded-lg font-medium text-sm transition-all hover:opacity-90"
                        style={{ backgroundColor: "#8B85E9" }}
                    >
                        저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterestSelection;

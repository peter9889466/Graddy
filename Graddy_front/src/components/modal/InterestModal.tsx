import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, AlertCircle } from "lucide-react";
import {
    getAllInterests,
    updateUserInterests,
    Interest,
    UserInterest,
} from "../../services/userService";

// 타입 정의
interface InterestItem {
    id: number;
    name: string;
    category: string;
}

interface SelectedInterestItem extends InterestItem {
    difficulty: string;
}

interface InterestProps {
    maxSelections?: number;
    initialSelections?: UserInterest[];
    onComplete?: (selectedInterests: UserInterest[]) => void;
    onCancel?: () => void;
}

// 카테고리 매핑
const categories = {
    all: "전체",
    1: "프로그래밍 언어",
    2: "프레임워크/라이브러리",
    3: "도구/라이브러리",
    4: "플랫폼/OS",
};

// 카테고리 ID를 문자열로 변환하는 함수
const getCategoryString = (interestDivision: number): string => {
    switch (interestDivision) {
        case 1:
            return "language";
        case 2:
            return "framework";
        case 3:
            return "tool";
        case 4:
            return "platform";
        default:
            return "other";
    }
};

const InterestSelection: React.FC<InterestProps> = ({
    maxSelections = 10,
    initialSelections = [],
    onComplete,
    onCancel,
}) => {
    const [allInterests, setAllInterests] = useState<InterestItem[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<
        SelectedInterestItem[]
    >([]);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeDifficulty, setActiveDifficulty] = useState<string | null>(
        null
    );
    const [hintMessage, setHintMessage] = useState<string>("");
    const [showHint, setShowHint] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 모달 ref
    const modalRef = useRef<HTMLDivElement>(null);

    // 관심분야 데이터 로드
    useEffect(() => {
        const fetchInterests = async () => {
            try {
                setIsLoading(true);
                const interests = await getAllInterests();
                const mappedInterests = interests.map((interest) => ({
                    id: interest.interestId,
                    name: interest.interestName,
                    category: getCategoryString(interest.interestDivision),
                }));
                setAllInterests(mappedInterests);

                // 초기 선택된 관심분야 설정
                const initialSelected = initialSelections.map((item) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    difficulty: item.difficulty,
                }));
                setSelectedInterests(initialSelected);
            } catch (error) {
                console.error("관심분야 로드 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterests();
    }, [initialSelections]);

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

    // 힌트 메시지 자동 숨김
    useEffect(() => {
        if (hintMessage) {
            setShowHint(true);
            const timer = setTimeout(() => {
                setShowHint(false);
                setTimeout(() => setHintMessage(""), 300);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hintMessage]);

    // 필터링 로직 - Join2와 동일
    const filteredInterests = allInterests.filter((item) => {
        const matchesSearch = item.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
            activeCategory === "all" || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    // Join2와 동일한 관심분야 클릭 핸들러
    const handleInterestClick = (item: InterestItem) => {
        if (!activeDifficulty) {
            setHintMessage("난이도를 먼저 선택해주세요!");
            return;
        }

        setSelectedInterests((prev) => {
            const exists = prev.find((i) => i.id === item.id);
            if (exists) {
                return prev.filter((i) => i.id !== item.id);
            } else {
                if (prev.length >= maxSelections) {
                    setHintMessage(
                        `최대 ${maxSelections}개까지만 선택할 수 있습니다.`
                    );
                    return prev;
                }
                return [...prev, { ...item, difficulty: activeDifficulty }];
            }
        });
    };

    // 선택된 관심분야 제거
    const removeSelected = (id: number) => {
        setSelectedInterests((prev) => prev.filter((i) => i.id !== id));
    };

    // Join2와 동일한 난이도 색상 함수
    const getDifficultyColors = (difficulty: string) => {
        switch (difficulty) {
            case "초급":
                return {
                    bgColor: "bg-emerald-100",
                    textColor: "text-emerald-800",
                    borderColor: "border-emerald-300",
                    iconColor: "text-emerald-600",
                };
            case "중급":
                return {
                    bgColor: "bg-blue-100",
                    textColor: "text-blue-800",
                    borderColor: "border-blue-300",
                    iconColor: "text-blue-600",
                };
            case "고급":
                return {
                    bgColor: "bg-purple-100",
                    textColor: "text-purple-800",
                    borderColor: "border-purple-300",
                    iconColor: "text-purple-600",
                };
            default:
                return {
                    bgColor: "bg-gray-100",
                    textColor: "text-gray-800",
                    borderColor: "border-gray-300",
                    iconColor: "text-gray-600",
                };
        }
    };

    // Join2와 동일한 난이도 버튼 스타일 함수
    const getDifficultyButtonStyle = (level: string) => {
        const isActive = activeDifficulty === level;
        switch (level) {
            case "초급":
                return `${
                    isActive
                        ? "bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-200"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                } 
            transition-all duration-200 ease-in-out transform ${
                isActive ? "scale-105" : "hover:scale-105"
            }`;
            case "중급":
                return `${
                    isActive
                        ? "bg-blue-500 text-white shadow-lg ring-2 ring-blue-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                } 
            transition-all duration-200 ease-in-out transform ${
                isActive ? "scale-105" : "hover:scale-105"
            }`;
            case "고급":
                return `${
                    isActive
                        ? "bg-purple-500 text-white shadow-lg ring-2 ring-purple-200"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                } 
            transition-all duration-200 ease-in-out transform ${
                isActive ? "scale-105" : "hover:scale-105"
            }`;
            default:
                return "";
        }
    };

    // 완료 버튼 클릭
    const handleComplete = async (): Promise<void> => {
        if (selectedInterests.length === 0) {
            setHintMessage("최소 하나 이상의 관심분야를 선택해주세요!");
            return;
        }

        setIsSaving(true);
        try {
            const userInterests: UserInterest[] = selectedInterests.map(
                (item) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    difficulty: item.difficulty,
                })
            );

            await updateUserInterests(userInterests);
            onComplete?.(userInterests);
        } catch (error) {
            console.error("관심분야 저장 실패:", error);
            alert("관심분야 저장에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSaving(false);
        }
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
                        학습하고 싶은 기술과 분야를 선택하면 맞춤형 콘텐츠를
                        추천해드려요 (최대 {maxSelections}개)
                    </p>
                </div>

                {/* 힌트 메시지 */}
                {hintMessage && (
                    <div
                        className={`mb-6 transition-all duration-300 ${
                            showHint
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-2"
                        }`}
                    >
                        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <span className="text-amber-800 text-sm font-medium">
                                {hintMessage}
                            </span>
                        </div>
                    </div>
                )}

                {/* 검색창 */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="기술이나 분야를 검색해보세요..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                        onFocus={(e) =>
                            ((
                                e.target as HTMLInputElement
                            ).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`)
                        }
                        onBlur={(e) =>
                            ((e.target as HTMLInputElement).style.boxShadow =
                                "none")
                        }
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                {/* 카테고리 필터 */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(categories).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                activeCategory === key
                                    ? "text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            style={
                                activeCategory === key
                                    ? { backgroundColor: "#8B85E9" }
                                    : {}
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-4 gap-6 mb-6">
                    {/* 난이도 선택 */}
                    <div className="md:col-span-1">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            난이도 선택
                        </h3>
                        <div className="space-y-3">
                            {["초급", "중급", "고급"].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setActiveDifficulty(level)}
                                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm ${getDifficultyButtonStyle(
                                        level
                                    )}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 관심분야 목록 */}
                    <div className="md:col-span-3">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            기술 및 분야
                        </h3>
                        <div className="border border-gray-200 rounded-xl p-4 h-64 overflow-y-auto bg-gray-50">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85E9]"></div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {filteredInterests.map((item) => {
                                        const isSelected =
                                            selectedInterests.some(
                                                (i) => i.id === item.id
                                            );
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() =>
                                                    handleInterestClick(item)
                                                }
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                    isSelected
                                                        ? "bg-white text-white shadow-md"
                                                        : "bg-white text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200"
                                                }`}
                                                style={
                                                    isSelected
                                                        ? {
                                                              backgroundColor:
                                                                  "#8B85E9",
                                                              color: "white",
                                                              boxShadow:
                                                                  "0 0 0 2px rgba(139, 133, 233, 0.2)",
                                                          }
                                                        : {}
                                                }
                                                onMouseEnter={
                                                    !isSelected
                                                        ? (e) => {
                                                              (
                                                                  e.target as HTMLButtonElement
                                                              ).style.backgroundColor =
                                                                  "rgba(139, 133, 233, 0.05)";
                                                              (
                                                                  e.target as HTMLButtonElement
                                                              ).style.color =
                                                                  "#8B85E9";
                                                          }
                                                        : undefined
                                                }
                                                onMouseLeave={
                                                    !isSelected
                                                        ? (e) => {
                                                              (
                                                                  e.target as HTMLButtonElement
                                                              ).style.backgroundColor =
                                                                  "white";
                                                              (
                                                                  e.target as HTMLButtonElement
                                                              ).style.color =
                                                                  "rgb(55, 65, 81)";
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {item.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {!isLoading && filteredInterests.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    검색 결과가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 선택된 관심분야 */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                            선택한 관심분야
                        </h3>
                        <span className="text-sm text-gray-500">
                            {selectedInterests.length}/{maxSelections}
                        </span>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4 min-h-20 bg-gray-50">
                        {selectedInterests.length === 0 ? (
                            <div className="flex items-center justify-center h-12 text-gray-500 text-sm">
                                선택된 관심분야가 없습니다
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedInterests.map((item) => {
                                    const {
                                        bgColor,
                                        textColor,
                                        borderColor,
                                        iconColor,
                                    } = getDifficultyColors(item.difficulty);
                                    return (
                                        <span
                                            key={item.id}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${bgColor} ${textColor} ${borderColor}`}
                                        >
                                            <span>{item.name}</span>
                                            <span
                                                className={`text-xs px-1.5 py-0.5 rounded ${iconColor} bg-white bg-opacity-50`}
                                            >
                                                {item.difficulty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    removeSelected(item.id)
                                                }
                                                className={`hover:bg-white hover:bg-opacity-50 rounded-full p-0.5 transition-colors ${iconColor}`}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
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
                        className={`px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                            selectedInterests.length > 0 && !isSaving
                                ? "text-white hover:opacity-90"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        style={
                            selectedInterests.length > 0 && !isSaving
                                ? { backgroundColor: "#8B85E9" }
                                : {}
                        }
                        disabled={selectedInterests.length === 0 || isSaving}
                    >
                        {isSaving ? "저장 중..." : "저장하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterestSelection;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, CheckCircle, AlertCircle } from "lucide-react";

interface InterestItem {
    id: number;
    name: string;
    category: string;
}

interface SelectedInterestItem extends InterestItem {
    difficulty: string;
}

const allInterests: InterestItem[] = [
    { id: 1, name: "Python", category: "language" }, 
    { id: 2, name: "JavaScript", category: "language" }, 
    { id: 3, name: "Java", category: "language" },
    { id: 4, name: "C++", category: "language" }, 
    { id: 5, name: "C", category: "language" }, 
    { id: 6, name: "TypeScript", category: "language" },
    { id: 7, name: "Kotlin", category: "language" }, 
    { id: 8, name: "Swift", category: "language" }, 
    { id: 9, name: "Go", category: "language" },
    { id: 10, name: "PHP", category: "language" }, 
    { id: 11, name: "Dart", category: "language" }, 
    { id: 12, name: "Rust", category: "language" },
    { id: 13, name: "Ruby", category: "language" }, 
    { id: 14, name: "Assembly", category: "language" }, 
    { id: 15, name: "React", category: "framework" },
    { id: 16, name: "Node.js", category: "framework" }, 
    { id: 17, name: "Spring", category: "framework" }, 
    { id: 18, name: "Spring Boot", category: "framework" },
    { id: 19, name: "Django", category: "framework" }, 
    { id: 20, name: "Flask", category: "framework" }, 
    { id: 21, name: "Vue", category: "framework" },
    { id: 22, name: "Pandas", category: "tool" }, 
    { id: 23, name: "Unity", category: "tool" }, 
    { id: 24, name: "Linux", category: "platform" },
];

const categories = {
    all: "전체",
    language: "프로그래밍 언어", 
    framework: "프레임워크/라이브러리",
    tool: "도구/라이브러리",
    platform: "플랫폼/OS"
};

const Join2: React.FC = () => {
    const [selectedInterests, setSelectedInterests] = useState<SelectedInterestItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [hintMessage, setHintMessage] = useState<string>("");
    const [showHint, setShowHint] = useState(false);
    const navigate = useNavigate();

    const maxSelections = 10;

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
            setHintMessage(`최대 ${maxSelections}개까지만 선택할 수 있습니다.`);
            return prev;
            }
            return [...prev, { ...item, difficulty: activeDifficulty }];
        }
        });
    };

    const removeSelected = (id: number) => {
        setSelectedInterests((prev) => prev.filter((i) => i.id !== id));
    };

    const getDifficultyColors = (difficulty: string) => {
        switch (difficulty) {
        case "초급":
            return { 
            bgColor: "bg-emerald-100", 
            textColor: "text-emerald-800", 
            borderColor: "border-emerald-300",
            iconColor: "text-emerald-600"
            };
        case "중급":
            return { 
            bgColor: "bg-blue-100", 
            textColor: "text-blue-800", 
            borderColor: "border-blue-300",
            iconColor: "text-blue-600"
            };
        case "고급":
            return { 
            bgColor: "bg-purple-100", 
            textColor: "text-purple-800", 
            borderColor: "border-purple-300",
            iconColor: "text-purple-600"
            };
        default:
            return { 
            bgColor: "bg-gray-100", 
            textColor: "text-gray-800", 
            borderColor: "border-gray-300",
            iconColor: "text-gray-600"
            };
        }
    };

    const getDifficultyButtonStyle = (level: string) => {
        const isActive = activeDifficulty === level;
        switch (level) {
        case "초급":
            return `${isActive 
            ? "bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-200" 
            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"} 
            transition-all duration-200 ease-in-out transform ${isActive ? "scale-105" : "hover:scale-105"}`;
        case "중급":
            return `${isActive 
            ? "bg-blue-500 text-white shadow-lg ring-2 ring-blue-200" 
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"} 
            transition-all duration-200 ease-in-out transform ${isActive ? "scale-105" : "hover:scale-105"}`;
        case "고급":
            return `${isActive 
            ? "bg-purple-500 text-white shadow-lg ring-2 ring-purple-200" 
            : "bg-purple-100 text-purple-700 hover:bg-purple-200"} 
            transition-all duration-200 ease-in-out transform ${isActive ? "scale-105" : "hover:scale-105"}`;
        default:
            return "";
        }
    };

    // 필터링 로직
    const filteredInterests = allInterests.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const isProceedEnabled = selectedInterests.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* 메인 카드 */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* 헤더 */}
                    <div className="px-6 py-8 text-white" style={{ background: `linear-gradient(to right, #8B85E9, #8B85E9)` }}>
                        <h2 className="text-2xl font-bold mb-2">관심분야를 선택해주세요</h2>
                        <p className="opacity-90 text-sm">
                        학습하고 싶은 기술과 분야를 선택하면 맞춤형 콘텐츠를 추천해드려요
                        </p>
                    </div>

                    <div className="p-6">
                        {/* 힌트 메시지 */}
                        {hintMessage && (
                        <div className={`mb-6 transition-all duration-300 ${showHint ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                            <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <span className="text-amber-800 text-sm font-medium">{hintMessage}</span>
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
                            onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                            onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
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
                            style={activeCategory === key ? { backgroundColor: "#8B85E9" } : {}}
                            >
                            {label}
                            </button>
                        ))}
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 mb-6">
                        {/* 난이도 선택 */}
                        <div className="md:col-span-1">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">난이도 선택</h3>
                            <div className="space-y-3">
                            {["초급", "중급", "고급"].map((level) => (
                                <button
                                key={level}
                                onClick={() => setActiveDifficulty(level)}
                                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm ${getDifficultyButtonStyle(level)}`}
                                >
                                {level}
                                </button>
                            ))}
                            </div>
                        </div>

                        {/* 관심분야 목록 */}
                        <div className="md:col-span-3">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">기술 및 분야</h3>
                            <div className="border border-gray-200 rounded-xl p-4 h-64 overflow-y-auto bg-gray-50">
                                <div className="flex flex-wrap gap-2">
                                    {filteredInterests.map((item) => {
                                    const isSelected = selectedInterests.some((i) => i.id === item.id);
                                    return (
                                        <button
                                        key={item.id}
                                        onClick={() => handleInterestClick(item)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                            isSelected
                                            ? "bg-white text-white shadow-md"
                                            : "bg-white text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200"
                                        }`}
                                        style={isSelected ? { 
                                            backgroundColor: "#8B85E9",
                                            color: "white",
                                            boxShadow: "0 0 0 2px rgba(139, 133, 233, 0.2)"
                                        } : {}}
                                        onMouseEnter={!isSelected ? (e) => {
                                            (e.target as HTMLButtonElement).style.backgroundColor = "rgba(139, 133, 233, 0.05)";
                                            (e.target as HTMLButtonElement).style.color = "#8B85E9";
                                        } : undefined}
                                        onMouseLeave={!isSelected ? (e) => {
                                            (e.target as HTMLButtonElement).style.backgroundColor = "white";
                                            (e.target as HTMLButtonElement).style.color = "rgb(55, 65, 81)";
                                        } : undefined}
                                        >
                                        {item.name}
                                        </button>
                                    );
                                    })}
                                </div>
                                {filteredInterests.length === 0 && (
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
                                <h3 className="text-sm font-semibold text-gray-700">선택한 관심분야</h3>
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
                                    const { bgColor, textColor, borderColor, iconColor } = getDifficultyColors(item.difficulty);
                                    return (
                                        <span
                                        key={item.id}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${bgColor} ${textColor} ${borderColor}`}
                                        >
                                        <span>{item.name}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${iconColor} bg-white bg-opacity-50`}>
                                            {item.difficulty}
                                        </span>
                                        <button
                                            onClick={() => removeSelected(item.id)}
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

                        {/* 하단 버튼 */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                className="flex-1 py-4 px-6 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                                onClick={() => navigate("/")}
                            >
                                이전
                            </button>

                            <button
                                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                isProceedEnabled
                                    ? "text-white hover:shadow-xl transform hover:scale-105"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                style={isProceedEnabled ? { 
                                backgroundColor: "#8B85E9",
                                boxShadow: "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)"
                                } : {}}
                                onMouseEnter={isProceedEnabled ? (e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = "#7d75e3";
                                } : undefined}
                                onMouseLeave={isProceedEnabled ? (e) => {
                                (e.target as HTMLButtonElement).style.backgroundColor = "#8B85E9";
                                } : undefined}
                                onClick={() => navigate("/login")}
                                disabled={!isProceedEnabled}
                            >
                                다음
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Join2;
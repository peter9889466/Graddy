import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Interface for a single interest item
interface InterestItem {
    id: number;
    name: string;
}

const allInterests: InterestItem[] = [
    { id: 1, name: "Python" },
    { id: 2, name: "JavaScript" },
    { id: 3, name: "Java" },
    { id: 4, name: "C++" },
    { id: 5, name: "C" },
    { id: 6, name: "TypeScript" },
    { id: 7, name: "Kotlin" },
    { id: 8, name: "Swift" },
    { id: 9, name: "Go" },
    { id: 10, name: "PHP" },
    { id: 11, name: "Dart" },
    { id: 12, name: "Rust" },
    { id: 13, name: "Ruby" },
    { id: 14, name: "Assembly" },
    { id: 15, name: "React" },
    { id: 16, name: "Node.js" },
    { id: 17, name: "Spring" },
    { id: 18, name: "Spring Boot" },
    { id: 19, name: "Django" },
    { id: 20, name: "Flask" },
    { id: 21, name: "Vue" },
    { id: 22, name: "Pandas" },
    { id: 23, name: "Unity" },
    { id: 24, name: "Linux" },
];

const Join2: React.FC<{ nextPage?: () => void }> = ({
    nextPage = () => {},
}) => {
    const [selectedInterests, setSelectedInterests] = useState<InterestItem[]>(
        []
    );
    const [searchTerm, setSearchTerm] = useState<string>("");

    const handleInterestClick = (item: InterestItem) => {
        if (selectedInterests.find((i) => i.id === item.id)) {
            // Remove if already selected
            setSelectedInterests(
                selectedInterests.filter((i) => i.id !== item.id)
            );
        } else if (selectedInterests.length < 10) {
            // Add if less than 10 selected
            setSelectedInterests([...selectedInterests, item]);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredInterests = allInterests.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const navigate = useNavigate();
    const backPage = () => {
        navigate("/login");
    };
    const skipPage = () => {
        navigate("/");
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-1/2">
                {/* Join2 폼 */}
                <div
                    className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border-2 flex flex-col justify-center items-center  h-[80vh]"
                    style={{ borderColor: "#8B85E9" }}
                >
                    <h2
                        className="text-xl sm:text-2xl font-bold mb-2"
                        style={{ color: "#8B85E9" }}
                    >
                        관심분야 선택
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        관심있는 기술과 분야를 선택해주세요 (최대 10개)
                    </p>

                    <div className="space-y-6 w-3/5">
                        {/* 검색창 */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="기술이나 분야를 검색해보세요..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent"
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
                            {/* FaSearch 아이콘을 SVG로 대체 */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 512 512"
                                    fill="currentColor"
                                >
                                    <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 100-288 144 144 0 100 288z" />
                                </svg>
                            </div>
                        </div>

                        {/* 탭 버튼 - 두 줄로 배치되도록 수정 */}
                        <div className="flex flex-wrap gap-2 text-sm justify-center">
                            <button
                                className="px-4 py-2 rounded-full text-white font-medium"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                전체
                            </button>
                            <button className="px-4 py-2 rounded-full text-gray-600 font-medium bg-gray-200">
                                프로그래밍 언어
                            </button>
                            <button className="px-4 py-2 rounded-full text-gray-600 font-medium bg-gray-200">
                                프레임워크/라이브러리
                            </button>
                            <button className="px-4 py-2 rounded-full text-gray-600 font-medium bg-gray-200">
                                기술 분야
                            </button>
                            <button className="px-4 py-2 rounded-full text-gray-600 font-medium bg-gray-200">
                                플랫폼/도구
                            </button>
                            <button className="px-4 py-2 rounded-full text-gray-600 font-medium bg-gray-200">
                                역할/직무
                            </button>
                        </div>

                        {/* 관심분야 목록 */}
                        <div
                            className="p-4 border rounded-xl overflow-y-auto"
                            style={{
                                borderColor: "#8B85E9",
                                maxHeight: "200px",
                            }}
                        >
                            <div className="flex flex-wrap gap-2 justify-center">
                                {filteredInterests.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() =>
                                            handleInterestClick(item)
                                        }
                                        className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                                            selectedInterests.find(
                                                (i) => i.id === item.id
                                            )
                                                ? "bg-[#8B85E9] text-white"
                                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        }`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 선택된 관심분야 */}
                        <div className="mt-6">
                            <h3
                                className="font-medium mb-2"
                                style={{ color: "#8B85E9" }}
                            >
                                선택된 관심분야
                            </h3>
                            <div
                                className="p-4 border rounded-xl flex flex-wrap gap-2"
                                style={{
                                    borderColor: "#8B85E9",
                                    minHeight: "60px",
                                }}
                            >
                                {selectedInterests.map((item) => (
                                    <span
                                        key={item.id}
                                        className="px-3 py-1 text-sm rounded-full flex items-center space-x-1"
                                        style={{
                                            backgroundColor: "#8B85E9",
                                            color: "white",
                                        }}
                                    >
                                        <span>{item.name}</span>
                                        <button
                                            onClick={() =>
                                                handleInterestClick(item)
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                                <span className="text-gray-500 text-sm ml-auto my-auto">
                                    {selectedInterests.length}/10 선택됨
                                </span>
                            </div>
                        </div>

                        {/* 하단 버튼 */}
                        <div className="flex justify-center space-x-4 pt-4">
                            <button
                                onClick={backPage}
                                className="py-3 px-6 text-white rounded-full font-medium transition-all duration-200 hover:opacity-90 transform hover:scale-[1.02]"
                                style={{
                                    backgroundColor: "#8B85E9",
                                    width: "calc(100% / 3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#7A73E0";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#8B85E9";
                                }}
                            >
                                회원가입
                            </button>
                            <button
                                onClick={skipPage}
                                className="py-3 px-6 rounded-full font-medium transition-all duration-200 hover:opacity-90 transform hover:scale-[1.02]"
                                style={{
                                    backgroundColor: "#E0E0E0",
                                    color: "#555",
                                    width: "calc(100% / 3)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#D0D0D0";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#E0E0E0";
                                }}
                            >
                                나중에 설정하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Join2;

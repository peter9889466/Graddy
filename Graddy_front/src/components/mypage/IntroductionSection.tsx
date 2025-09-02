import React, { useState } from "react";
import { Edit3 } from "lucide-react";
import { updateUserIntroduction } from "../../services/userService";

interface IntroductionSectionProps {
    introduction: string;
    onIntroductionUpdate: (newIntroduction: string) => void;
}

const IntroductionSection: React.FC<IntroductionSectionProps> = ({
    introduction,
    onIntroductionUpdate,
}) => {
    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [editedIntroduction, setEditedIntroduction] = useState(introduction);
    const [isLoading, setIsLoading] = useState(false);

    const handleEditIntro = () => {
        setEditedIntroduction(introduction);
        setIsEditingIntro(true);
    };

    const handleSaveIntro = async () => {
        if (editedIntroduction.trim() === introduction) {
            setIsEditingIntro(false);
            return;
        }

        setIsLoading(true);
        try {
            await updateUserIntroduction(editedIntroduction.trim());
            onIntroductionUpdate(editedIntroduction.trim());
            setIsEditingIntro(false);
        } catch (error) {
            console.error("소개글 수정 실패:", error);
            alert("소개글 수정에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedIntroduction(introduction);
        setIsEditingIntro(false);
    };
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h4
                    className="text-lg sm:text-xl font-semibold"
                    style={{ color: "#8B85E9" }}
                >
                    내 소개
                </h4>
                <div className="flex justify-end mb-4">
                    {!isEditingIntro && (
                        <button
                            onClick={handleEditIntro}
                            className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg  duration-200 group text-sm sm:text-base "
                            style={{
                                color: "#8B85E9",
                            }}
                        >
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>수정</span>
                        </button>
                    )}
                </div>
            </div>
            <div
                className="rounded-xl p-4 sm:p-6 lg:p-8 border"
                style={{
                    backgroundColor: "#F8F9FF",
                    borderColor: "#E5E7EB",
                }}
            >
                {isEditingIntro ? (
                    <div className="space-y-4">
                        <textarea
                            value={editedIntroduction}
                            onChange={(e) =>
                                setEditedIntroduction(e.target.value)
                            }
                            className="w-full p-3 sm:p-4 border rounded-lg resize-none text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                            rows={5}
                            placeholder="자신을 소개해보세요..."
                            disabled={isLoading}
                        />
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm sm:text-base border border-gray-300 hover:border-gray-400"
                                disabled={isLoading}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveIntro}
                                className="px-4 sm:px-6 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base shadow-md hover:shadow-lg"
                                style={{
                                    backgroundColor: isLoading
                                        ? "#9CA3AF"
                                        : "#8B85E9",
                                }}
                                disabled={isLoading}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.backgroundColor =
                                            "#7A73E0";
                                        e.currentTarget.style.transform =
                                            "translateY(-1px) scale(1.02)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.backgroundColor =
                                            "#8B85E9";
                                        e.currentTarget.style.transform =
                                            "translateY(0) scale(1)";
                                    }
                                }}
                            >
                                {isLoading ? "저장 중..." : "저장"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="min-h-[100px] sm:min-h-[120px] flex items-start p-4 rounded-lg"
                        style={{ backgroundColor: "#FFFFFF" }}
                    >
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg whitespace-pre-wrap">
                            {introduction ||
                                "아직 소개글이 작성되지 않았습니다. 수정 버튼을 눌러 자신을 소개해보세요!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IntroductionSection;

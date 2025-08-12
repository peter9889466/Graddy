import React from "react";
import { Edit3 } from "lucide-react";

interface IntroductionSectionProps {
    introduction: string;
    isEditingIntro: boolean;
    onEditIntro: () => void;
    onSaveIntro: () => void;
    onCancelEdit: () => void;
    onIntroductionChange: (value: string) => void;
}

const IntroductionSection: React.FC<IntroductionSectionProps> = ({
    introduction,
    isEditingIntro,
    onEditIntro,
    onSaveIntro,
    onCancelEdit,
    onIntroductionChange,
}) => {
    return (
        <div
            className="rounded-xl p-4 sm:p-6 lg:p-8"
            style={{ backgroundColor: "#F3F2FF" }}
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                <h4
                    className="text-lg sm:text-xl font-semibold"
                    style={{ color: "#8B85E9" }}
                >
                    내 소개
                </h4>
                {!isEditingIntro && (
                    <button
                        onClick={onEditIntro}
                        className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 group text-sm sm:text-base"
                        style={{ color: "#8B85E9" }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#E8E6FF";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                "transparent";
                        }}
                    >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                        <span>수정</span>
                    </button>
                )}
            </div>

            {isEditingIntro ? (
                <div className="space-y-4">
                    <textarea
                        value={introduction}
                        onChange={(e) => onIntroductionChange(e.target.value)}
                        className="w-full p-3 sm:p-4 border rounded-lg resize-none text-sm sm:text-base"
                        style={{
                            borderColor: "#777777",
                        }}
                        rows={4}
                        placeholder="자신을 소개해보세요..."
                    />
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <button
                            onClick={onCancelEdit}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm sm:text-base"
                        >
                            취소
                        </button>
                        <button
                            onClick={onSaveIntro}
                            className="px-4 sm:px-6 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                            style={{
                                backgroundColor: "#8B85E9",
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
                            저장
                        </button>
                    </div>
                </div>
            ) : (
                <div className="min-h-[80px] sm:min-h-[120px] flex items-start">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                        {introduction}
                    </p>
                </div>
            )}
        </div>
    );
};

export default IntroductionSection;

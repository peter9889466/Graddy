import React, { useState, useRef } from "react";
import { Edit3, Camera, ExternalLink } from "lucide-react";

interface SelectedInterestItem {
    id: number;
    name: string;
    category: string;
    difficulty: string;
}

interface MemberData {
    nickname: string;
    githubUrl?: string;
}

interface ProfileSectionProps {
    profileImage: string;
    userScore: number;
    userInterests: SelectedInterestItem[];
    memberData: MemberData;
    isEditingGithub: boolean;
    onProfileImageClick: () => void;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInterestEdit: () => void;
    onGithubEdit: () => void;
    onGithubSave: () => void;
    onGithubCancel: () => void;
    onGithubChange: (value: string) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
    profileImage,
    userScore,
    userInterests,
    memberData,
    isEditingGithub,
    onProfileImageClick,
    onImageChange,
    onInterestEdit,
    onGithubEdit,
    onGithubSave,
    onGithubCancel,
    onGithubChange,
    fileInputRef,
}) => {
    console.log("🔍 [DEBUG] ProfileSection 렌더링 - userInterests:", userInterests);
    
    const handleGithubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onGithubChange(value);
    };
    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* 왼쪽: 프로필 정보 */}
            <div className="flex-1 space-y-4 sm:space-y-6 pt-8">
                {/* 프로필 이미지 */}
                <div className="flex justify-center lg:justify-start -mt-4">
                    <div className="relative">
                        <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border cursor-pointer group relative"
                            style={{
                                borderColor: "#777777",
                            }}
                            onClick={onProfileImageClick}
                        >
                            <img
                                src={profileImage || "/android-icon-72x72.png"}
                                alt="프로필 이미지"
                                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/android-icon-72x72.png";
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-full">
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onImageChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2">
                            닉네임
                        </label>
                        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-lg text-gray-600 text-sm sm:text-base">
                            {memberData.nickname}
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs sm:text-sm font-medium">
                                GitHub URL
                            </label>
                            {!isEditingGithub && (
                                <button
                                    onClick={onGithubEdit}
                                    className="flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 text-xs"
                                    style={{ color: "#8B85E9" }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#E8E6FF";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "transparent";
                                    }}
                                >
                                    <Edit3 className="w-3 h-3" />
                                    <span>수정</span>
                                </button>
                            )}
                        </div>
                        {isEditingGithub ? (
                            <div className="space-y-2">
                                <input
                                    type="url"
                                    value={memberData.githubUrl || ""}
                                    onChange={handleGithubChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:border-purple-400"
                                    placeholder="https://github.com/username"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={onGithubCancel}
                                        className="px-3 py-1 text-gray-600 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={onGithubSave}
                                        className="px-3 py-1 text-white text-xs rounded-lg transition-colors"
                                        style={{ backgroundColor: "#8B85E9" }}
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
                            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-lg text-sm sm:text-base break-all">
                                {memberData.githubUrl ? (
                                    <a
                                        href={memberData.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                    >
                                        {memberData.githubUrl}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <span className="text-gray-500">
                                        GitHub URL을 설정해주세요
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 오른쪽: 유저 점수와 관심분야 */}
            <div className="flex-1 space-y-4 sm:space-y-6">
                {/* 유저 점수 */}
                <div
                    className="rounded-xl p-4 border"
                    style={{ borderColor: "#d9d9d9" }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h4
                                className="text-sm sm:text-base font-semibold mb-1"
                                style={{
                                    color: "#8B85E9",
                                }}
                            >
                                내 점수
                            </h4>
                            <p className="text-xs text-gray-600">
                                활동 기반 평가 점수
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span
                                className="text-xl sm:text-2xl font-bold"
                                style={{
                                    color: "#8B85E9",
                                }}
                            >
                                {userScore?.toLocaleString() || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 관심분야 */}
                <div>
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h4
                            className="text-base sm:text-lg font-semibold"
                            style={{ color: "#8B85E9" }}
                        >
                            관심분야
                        </h4>
                        <button
                            onClick={onInterestEdit}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-200 text-xs sm:text-sm"
                            style={{ color: "#8B85E9" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "#E8E6FF";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                    "transparent";
                            }}
                        >
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>수정</span>
                        </button>
                    </div>
                    <div
                        className="border rounded-lg p-4 min-h-32 sm:min-h-40"
                        style={{
                            borderColor: "#d9d9d9",
                            backgroundColor: "#F9F9FF",
                        }}
                    >
                        {userInterests.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500 text-xs sm:text-sm">
                                관심분야를 설정해보세요
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {userInterests.map((interest: any) => {
                                    // InterestModal.tsx와 동일한 난이도별 Tailwind 색상 매핑
                                    const getDifficultyColors = (
                                        difficulty: string
                                    ) => {
                                        switch (difficulty) {
                                            case "초급":
                                                return {
                                                    bgColor: "bg-emerald-100",
                                                    textColor:
                                                        "text-emerald-800",
                                                    borderColor:
                                                        "border-emerald-300",
                                                };
                                            case "중급":
                                                return {
                                                    bgColor: "bg-blue-100",
                                                    textColor: "text-blue-800",
                                                    borderColor:
                                                        "border-blue-300",
                                                };
                                            case "고급":
                                                return {
                                                    bgColor: "bg-purple-100",
                                                    textColor:
                                                        "text-purple-800",
                                                    borderColor:
                                                        "border-purple-300",
                                                };
                                            default:
                                                return {
                                                    bgColor: "bg-gray-100",
                                                    textColor: "text-gray-800",
                                                    borderColor:
                                                        "border-gray-300",
                                                };
                                        }
                                    };

                                    const { bgColor, textColor, borderColor } =
                                        getDifficultyColors(
                                            interest.difficulty
                                        );

                                    return (
                                        <span
                                            key={interest.id || interest.interestId}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${bgColor} ${textColor} ${borderColor}`}
                                        >
                                            <span>{interest.name || interest.interestName}</span>
                                            <span
                                                className={`text-xs px-1.5 py-0.5 rounded ${textColor} bg-white bg-opacity-50`}
                                            >
                                                {interest.difficulty}
                                            </span>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;

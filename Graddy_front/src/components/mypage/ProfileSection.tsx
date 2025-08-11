import React, { useRef } from "react";
import { Edit3, Camera, Star } from "lucide-react";

interface ProfileSectionProps {
    profileImage: string;
    userScore: number;
    userInterests: string[];
    onProfileImageClick: () => void;
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInterestEdit: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
    profileImage,
    userScore,
    userInterests,
    onProfileImageClick,
    onImageChange,
    onInterestEdit,
    fileInputRef,
}) => {
    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* 왼쪽: 프로필 정보 */}
            <div className="flex-1 space-y-4 sm:space-y-6">
                {/* 프로필 이미지 */}
                <div className="flex justify-center lg:justify-start">
                    <div className="relative">
                        <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 cursor-pointer group"
                            style={{
                                borderColor: "#8B85E9",
                            }}
                            onClick={onProfileImageClick}
                        >
                            <img
                                src={profileImage}
                                alt="프로필 이미지"
                                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
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
                        <label
                            className="block text-xs sm:text-sm font-medium mb-2"
                            style={{
                                color: "#8B85E9",
                            }}
                        >
                            닉네임
                        </label>
                        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-lg text-gray-600 text-sm sm:text-base">
                            사용자 {/* 임시 데이터 */}
                        </div>
                    </div>
                    <div>
                        <label
                            className="block text-xs sm:text-sm font-medium mb-2"
                            style={{
                                color: "#8B85E9",
                            }}
                        >
                            이메일
                        </label>
                        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 rounded-lg text-gray-600 text-sm sm:text-base break-all">
                            graddy@gmail.com {/* 임시 데이터 */}
                        </div>
                    </div>
                </div>
            </div>

            {/* 오른쪽: 유저 점수와 관심분야 */}
            <div className="flex-1 space-y-4 sm:space-y-6">
                {/* 유저 점수 */}
                <div
                    className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border-2"
                    style={{ borderColor: "#8B85E9" }}
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
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-current" />
                            <span
                                className="text-xl sm:text-2xl font-bold"
                                style={{
                                    color: "#8B85E9",
                                }}
                            >
                                {userScore.toLocaleString()}
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
                        className="border-2 rounded-lg p-4 min-h-32 sm:min-h-40"
                        style={{
                            borderColor: "#8B85E9",
                            backgroundColor: "#F9F9FF",
                        }}
                    >
                        {userInterests.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500 text-xs sm:text-sm">
                                관심분야를 설정해보세요
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {userInterests.map((interest, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 text-white rounded-full text-xs sm:text-sm font-medium"
                                        style={{
                                            backgroundColor: "#8B85E9",
                                        }}
                                    >
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;

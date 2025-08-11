import React, { useState, useRef } from "react";
import { User, Settings, Trash2, Edit3, Camera, Star } from "lucide-react";
import DeleteModal from "../components/modal/DeleteModal";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import ResponsiveSidebar from "../components/layout/ResponsiveSidebar";
import ResponsiveMainContent from "../components/layout/ResponsiveMainContent";
import InterestSelection from "../components/interest/InterestSelection";

export const MyPage = () => {
    const [activeTab, setActiveTab] = useState("마이페이지");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [profileImage, setProfileImage] = useState("/android-icon-72x72.png");
    const [userInterests, setUserInterests] = useState<string[]>([
        "React",
        "JavaScript",
        "Node.js",
    ]);
    const [introduction, setIntroduction] = useState(
        "안녕하세요! 함께 성장하는 개발자가 되고 싶습니다."
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 임시 데이터 (나중에 DB에서 받아올 예정)
    // const nickname = "개발자김씨";
    // const email = "developer@example.com";
    const userScore = 1000; // 백엔드에서 받아올 점수

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    const handleEditIntro = () => {
        setIsEditingIntro(true);
    };

    const handleSaveIntro = () => {
        setIsEditingIntro(false);
        // 여기서 서버에 저장 로직 추가
    };

    const handleProfileImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string);
                // 여기서 서버에 이미지 업로드 로직 추가
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInterestEdit = () => {
        setShowInterestModal(true);
    };

    const handleInterestComplete = (selectedTags: string[]) => {
        setUserInterests(selectedTags);
        setShowInterestModal(false);
        // 여기서 서버에 관심분야 저장 로직 추가
    };

    const handleInterestCancel = () => {
        setShowInterestModal(false);
    };

    const sideMenuItems = [
        { name: "마이페이지", icon: User },
        { name: "회원정보 수정", icon: Settings },
        { name: "회원탈퇴", icon: Trash2, onClick: handleDeleteAccount },
    ];

    return (
        <>
            <PageLayout>
                <ResponsiveContainer variant="sidebar">
                    {/* 사이드 네비게이션 */}
                    <ResponsiveSidebar>
                        {/* 마이페이지 섹션 */}
                        <div
                            className="bg-white rounded-xl shadow-sm border-2 p-3 sm:p-4"
                            style={{ borderColor: "#8B85E9" }}
                        >
                            <h3
                                className="font-bold mb-3 text-sm sm:text-base"
                                style={{ color: "#8B85E9" }}
                            >
                                마이페이지
                            </h3>
                            <div className="space-y-2">
                                {sideMenuItems.slice(0, 2).map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => setActiveTab(item.name)}
                                        className={`w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-sm sm:text-base ${
                                            activeTab === item.name
                                                ? "font-medium"
                                                : "text-gray-600 hover:bg-purple-50"
                                        }`}
                                        style={
                                            activeTab === item.name
                                                ? {
                                                      backgroundColor:
                                                          "#E8E6FF",
                                                      color: "#8B85E9",
                                                  }
                                                : {
                                                      color:
                                                          activeTab !==
                                                          item.name
                                                              ? "#6B7280"
                                                              : "#8B85E9",
                                                  }
                                        }
                                        onMouseEnter={(e) => {
                                            if (activeTab !== item.name) {
                                                e.currentTarget.style.color =
                                                    "#8B85E9";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== item.name) {
                                                e.currentTarget.style.color =
                                                    "#6B7280";
                                            }
                                        }}
                                    >
                                        <item.icon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                                        <span className="truncate">
                                            {item.name}
                                        </span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-red-600 hover:bg-red-50 text-sm sm:text-base"
                                >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                                    <span className="truncate">회원탈퇴</span>
                                </button>
                            </div>
                        </div>

                        {/* 내 스터디 목록 */}
                        <div
                            className="bg-white rounded-xl shadow-sm border-2 p-3 sm:p-4"
                            style={{ borderColor: "#8B85E9" }}
                        >
                            <h3
                                className="font-bold mb-3 text-sm sm:text-base"
                                style={{ color: "#8B85E9" }}
                            >
                                내 스터디 목록
                            </h3>
                            <div className="text-gray-500 text-xs sm:text-sm">
                                {/* DB에서 스터디 목록을 받아올 예정 */}
                                스터디 목록을 불러오는 중...
                            </div>
                        </div>
                    </ResponsiveSidebar>

                    {/* 메인 콘텐츠 */}
                    <ResponsiveMainContent padding="md">
                        {activeTab === "마이페이지" && (
                            <div className="space-y-6 sm:space-y-8">
                                {/* 상단 영역: 프로필 정보와 관심분야를 양옆에 배치 */}
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
                                                    onClick={
                                                        handleProfileImageClick
                                                    }
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
                                                    onChange={handleImageChange}
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
                                                    {/* {nickname} */}
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
                                                    {/* {email} */}
                                                    graddy@gmail.com{" "}
                                                    {/* 임시 데이터 */}
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
                                                    onClick={handleInterestEdit}
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
                                                        {userInterests.map(
                                                            (
                                                                interest,
                                                                index
                                                            ) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-3 py-1 text-white rounded-full text-xs sm:text-sm font-medium"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#8B85E9",
                                                                    }}
                                                                >
                                                                    {interest}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr
                                    style={{
                                        borderColor: "#8B85E9",
                                        opacity: 0.3,
                                    }}
                                />

                                {/* 내 소개 - 더 넓은 영역 */}
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
                                                onClick={handleEditIntro}
                                                className="flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 group text-sm sm:text-base"
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
                                                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                                                <span>수정</span>
                                            </button>
                                        )}
                                    </div>

                                    {isEditingIntro ? (
                                        <div className="space-y-4">
                                            <textarea
                                                value={introduction}
                                                onChange={(e) =>
                                                    setIntroduction(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full p-3 sm:p-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none text-sm sm:text-base"
                                                style={{
                                                    borderColor: "#8B85E9",
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.boxShadow =
                                                        "0 0 0 2px rgba(139, 133, 233, 0.2)";
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.boxShadow =
                                                        "none";
                                                }}
                                                rows={4}
                                                placeholder="자신을 소개해보세요..."
                                            />
                                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                                                <button
                                                    onClick={() =>
                                                        setIsEditingIntro(false)
                                                    }
                                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm sm:text-base"
                                                >
                                                    취소
                                                </button>
                                                <button
                                                    onClick={handleSaveIntro}
                                                    className="px-4 sm:px-6 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                                                    style={{
                                                        backgroundColor:
                                                            "#8B85E9",
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
                            </div>
                        )}

                        {activeTab === "회원정보 수정" && (
                            <div className="space-y-4 sm:space-y-6">
                                <h2
                                    className="text-xl sm:text-2xl font-bold"
                                    style={{ color: "#8B85E9" }}
                                >
                                    회원정보 수정
                                </h2>
                                <div className="text-gray-500 text-sm sm:text-base">
                                    회원정보 수정 기능은 추후 업데이트
                                    예정입니다.
                                </div>
                            </div>
                        )}
                    </ResponsiveMainContent>
                </ResponsiveContainer>
            </PageLayout>

            {/* 회원탈퇴 모달 */}
            {showDeleteModal && (
                <DeleteModal onClose={() => setShowDeleteModal(false)} />
            )}

            {/* 관심분야 수정 모달 */}
            {showInterestModal && (
                <InterestSelection
                    maxSelections={10}
                    initialSelections={userInterests}
                    onComplete={handleInterestComplete}
                    onCancel={handleInterestCancel}
                />
            )}
        </>
    );
};

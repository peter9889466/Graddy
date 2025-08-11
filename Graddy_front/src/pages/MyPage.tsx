import React, { useState } from "react";
import { User, Settings, Trash2, Edit3 } from "lucide-react";
import DeleteModal from "../components/modal/DeleteModal";

export const MyPage = () => {
    const [activeTab, setActiveTab] = useState("마이페이지");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [introduction, setIntroduction] = useState(
        "안녕하세요! 함께 성장하는 개발자가 되고 싶습니다."
    );

    // 임시 데이터 (나중에 DB에서 받아올 예정)
    // const nickname = "개발자김씨";
    // const email = "developer@example.com";

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

    const sideMenuItems = [
        { name: "마이페이지", icon: User },
        { name: "회원정보 수정", icon: Settings },
        { name: "회원탈퇴", icon: Trash2, onClick: handleDeleteAccount },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#FFF3D2" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* 사이드 네비게이션 */}
                    <div className="w-64 space-y-4">
                        {/* 마이페이지 섹션 */}
                        <div
                            className="bg-white rounded-xl shadow-sm border-2 p-4"
                            style={{ borderColor: "#8B85E9" }}
                        >
                            <h3
                                className="font-bold mb-3"
                                style={{ color: "#8B85E9" }}
                            >
                                마이페이지
                            </h3>
                            <div className="space-y-2">
                                {sideMenuItems.slice(0, 2).map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => setActiveTab(item.name)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group ${
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
                                        <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span>{item.name}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>회원탈퇴</span>
                                </button>
                            </div>
                        </div>

                        {/* 내 스터디 목록 */}
                        <div
                            className="bg-white rounded-xl shadow-sm border-2 p-4"
                            style={{ borderColor: "#8B85E9" }}
                        >
                            <h3
                                className="font-bold mb-3"
                                style={{ color: "#8B85E9" }}
                            >
                                내 스터디 목록
                            </h3>
                            <div className="text-gray-500 text-sm">
                                {/* DB에서 스터디 목록을 받아올 예정 */}
                                스터디 목록을 불러오는 중...
                            </div>
                        </div>
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="flex-1">
                        <div
                            className="bg-white rounded-xl shadow-sm border-2 p-8"
                            style={{ borderColor: "#8B85E9" }}
                        >
                            {activeTab === "마이페이지" && (
                                <div className="space-y-8">
                                    {/* 상단 영역: 프로필 정보와 관심분야를 양옆에 배치 */}
                                    <div className="flex gap-8">
                                        {/* 왼쪽: 프로필 정보 */}
                                        <div className="flex-1 space-y-6">
                                            {/* 프로필 이미지 */}
                                            <div className="flex justify-start">
                                                <div className="w-20 h-20 rounded-full overflow-hidden border-2">
                                                    <img
                                                        src="/android-icon-36x36.png"
                                                        alt="프로필 이미지"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>

                                            {/* 기본 정보 */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label
                                                        className="block text-sm font-medium mb-2"
                                                        style={{
                                                            color: "#8B85E9",
                                                        }}
                                                    >
                                                        닉네임
                                                    </label>
                                                    <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                                                        {/* {nickname} */}
                                                        사용자{" "}
                                                        {/* 임시 데이터 */}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label
                                                        className="block text-sm font-medium mb-2"
                                                        style={{
                                                            color: "#8B85E9",
                                                        }}
                                                    >
                                                        이메일
                                                    </label>
                                                    <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                                                        {/* {email} */}
                                                        graddy@gmail.com{" "}
                                                        {/* 임시 데이터 */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 오른쪽: 관심분야 */}
                                        <div className="flex-1">
                                            <h4
                                                className="text-lg font-semibold mb-4"
                                                style={{ color: "#8B85E9" }}
                                            >
                                                관심분야
                                            </h4>
                                            <div
                                                className="border-2 border-dashed rounded-lg p-8 text-center text-gray-500 h-48 flex items-center justify-center"
                                                style={{
                                                    borderColor: "#8B85E9",
                                                    opacity: 0.6,
                                                }}
                                            >
                                                관심분야 설정 기능은 추후
                                                업데이트 예정입니다.
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
                                        className="rounded-xl p-8"
                                        style={{ backgroundColor: "#F3F2FF" }}
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                            <h4
                                                className="text-xl font-semibold"
                                                style={{ color: "#8B85E9" }}
                                            >
                                                내 소개
                                            </h4>
                                            {!isEditingIntro && (
                                                <button
                                                    onClick={handleEditIntro}
                                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group"
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
                                                    <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
                                                    className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
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
                                                    rows={6}
                                                    placeholder="자신을 소개해보세요..."
                                                />
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() =>
                                                            setIsEditingIntro(
                                                                false
                                                            )
                                                        }
                                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                                    >
                                                        취소
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleSaveIntro
                                                        }
                                                        className="px-6 py-2 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
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
                                            <div className="min-h-[120px] flex items-start">
                                                <p className="text-gray-700 leading-relaxed text-lg">
                                                    {introduction}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "회원정보 수정" && (
                                <div className="space-y-6">
                                    <h2
                                        className="text-2xl font-bold"
                                        style={{ color: "#8B85E9" }}
                                    >
                                        회원정보 수정
                                    </h2>
                                    <div className="text-gray-500">
                                        회원정보 수정 기능은 추후 업데이트
                                        예정입니다.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 회원탈퇴 모달 */}
            {showDeleteModal && (
                <DeleteModal onClose={() => setShowDeleteModal(false)} />
            )}
        </div>
    );
};

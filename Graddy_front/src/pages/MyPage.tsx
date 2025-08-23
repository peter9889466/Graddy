import React, { useState, useRef } from "react";
import DeleteModal from "../components/modal/DeleteModal";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import ResponsiveSidebar from "../components/layout/ResponsiveSidebar";
import ResponsiveMainContent from "../components/layout/ResponsiveMainContent";
import InterestSelection from "../components/modal/InterestModal";
import ProfileSection from "../components/mypage/ProfileSection";
import IntroductionSection from "../components/mypage/IntroductionSection";
import ProfileEditForm from "../components/mypage/ProfileEditForm";
import MyPageSidebar from "../components/mypage/MyPageSidebar";
import MyStudyList from "../components/mypage/MyStudyList";

// InterestModal과 동일한 타입 정의
interface SelectedInterestItem {
    id: number;
    name: string;
    category: string;
    difficulty: string;
}

export const MyPage = () => {
    const [activeTab, setActiveTab] = useState("마이페이지");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [profileImage, setProfileImage] = useState("/android-icon-72x72.png");
    const [userInterests, setUserInterests] = useState<SelectedInterestItem[]>([
        { id: 15, name: "React", category: "framework", difficulty: "중급" },
        { id: 2, name: "JavaScript", category: "language", difficulty: "중급" },
        { id: 16, name: "Node.js", category: "framework", difficulty: "초급" },
    ]);
    const [introduction, setIntroduction] = useState(
        "안녕하세요! 함께 성장하는 개발자가 되고 싶습니다."
    );
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // 회원정보 수정 관련 상태
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [name, setName] = useState("김개발");
    const [nickname, setNickname] = useState("사용자");
    const [email, setEmail] = useState("graddy@gmail.com");
    const [phone, setPhone] = useState("010-1234-5678");

    // 임시 데이터 (나중에 DB에서 받아올 예정)
    const userScore = 1000; // 백엔드에서 받아올 점수

    // 사용자 닉네임 (AuthContext에서 가져올 예정)
    const userNickname = nickname;

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

    const handleInterestComplete = (
        selectedInterests: SelectedInterestItem[]
    ) => {
        setUserInterests(selectedInterests);
        setShowInterestModal(false);
        // 여기서 서버에 관심분야 저장 로직 추가
    };

    const handleInterestCancel = () => {
        setShowInterestModal(false);
    };

    // 비밀번호 검증 함수
    const validatePasswords = () => {
        if (password && confirmPassword && password !== confirmPassword) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
            return false;
        }
        setPasswordError("");
        return true;
    };

    // 비밀번호 변경 핸들러
    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (confirmPassword && value !== confirmPassword) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
        } else {
            setPasswordError("");
        }
    };

    // 비밀번호 확인 변경 핸들러
    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (password && value !== password) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
        } else {
            setPasswordError("");
        }
    };

    // 회원정보 수정 제출 핸들러
    const handleUpdateProfile = () => {
        // 비밀번호가 입력된 경우에만 검증
        if (password || confirmPassword) {
            if (!validatePasswords()) {
                alert("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
                return;
            }
            if (password.length < 6) {
                alert("비밀번호는 최소 6자 이상이어야 합니다.");
                return;
            }
        }

        // 여기서 서버에 업데이트 요청을 보낼 예정
        alert("회원정보가 성공적으로 수정되었습니다.");

        // 비밀번호 필드 초기화
        setPassword("");
        setConfirmPassword("");
        setPasswordError("");
    };

    return (
        <>
            <PageLayout>
                <ResponsiveContainer variant="sidebar">
                    {/* 사이드 네비게이션 */}
                    <ResponsiveSidebar>
                        <MyPageSidebar
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            onDeleteAccount={handleDeleteAccount}
                        />
                    </ResponsiveSidebar>

                    {/* 메인 콘텐츠 */}
                    <ResponsiveMainContent padding="md">
                        {activeTab === "마이페이지" && (
                            <div className="space-y-6 sm:space-y-8">
                                {/* 프로필 섹션 */}
                                <ProfileSection
                                    profileImage={profileImage}
                                    userScore={userScore}
                                    userInterests={userInterests}
                                    onProfileImageClick={
                                        handleProfileImageClick
                                    }
                                    onImageChange={handleImageChange}
                                    onInterestEdit={handleInterestEdit}
                                    fileInputRef={fileInputRef}
                                />

                                <hr
                                    style={{
                                        borderColor: "#777777",
                                        opacity: 0.3,
                                    }}
                                />

                                {/* 내 소개 섹션 */}
                                <IntroductionSection
                                    introduction={introduction}
                                    isEditingIntro={isEditingIntro}
                                    onEditIntro={handleEditIntro}
                                    onSaveIntro={handleSaveIntro}
                                    onCancelEdit={() =>
                                        setIsEditingIntro(false)
                                    }
                                    onIntroductionChange={setIntroduction}
                                />
                            </div>
                        )}

                        {activeTab === "스터디/프로젝트" && (
                            <MyStudyList userNickname={userNickname} />
                        )}

                        {activeTab === "회원정보 수정" && (
                            <ProfileEditForm
                                password={password}
                                confirmPassword={confirmPassword}
                                passwordError={passwordError}
                                name={name}
                                nickname={nickname}
                                email={email}
                                phone={phone}
                                onPasswordChange={handlePasswordChange}
                                onConfirmPasswordChange={
                                    handleConfirmPasswordChange
                                }
                                onNicknameChange={setNickname}
                                onEmailChange={setEmail}
                                onPhoneChange={setPhone}
                                onUpdateProfile={handleUpdateProfile}
                            />
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

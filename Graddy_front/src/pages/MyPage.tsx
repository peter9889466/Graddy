import React, { useState, useRef, useEffect, useContext } from "react";
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
import { MyStudyList } from "../components/mypage/MyStudyList";
import { AuthContext } from "../contexts/AuthContext";
import {
    getMyPageInfo,
    getUpdatePageInfo,
    updateUserProfile,
    updateUserInterests,
    withdrawUser,
    UserInterest,
    MyPageResponse,
    UpdatePageInfo,
    UserProfileUpdateRequest,
    UserInterestsUpdateRequest,
} from "../services/userApi";

// InterestModal과 동일한 타입 정의
interface SelectedInterestItem {
    id: number;
    name: string;
    category: string;
    difficulty: string;
}

export const MyPage = () => {
    const authContext = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("마이페이지");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEditingIntro, setIsEditingIntro] = useState(false);
    const [isEditingGithub, setIsEditingGithub] = useState(false);
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [profileImage, setProfileImage] = useState("/android-icon-72x72.png");
    const [userInterests, setUserInterests] = useState<SelectedInterestItem[]>(
        []
    );
    const [introduction, setIntroduction] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [tempGithubUrl, setTempGithubUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [loading, setLoading] = useState(true);

    // 회원정보 수정 관련 상태
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [userScore, setUserScore] = useState(0);

    // 사용자 닉네임
    const userNickname = nickname;

    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                if (activeTab === "마이페이지") {
                    const myPageResponse = await getMyPageInfo();
                    if (myPageResponse.success) {
                        const data = myPageResponse.data;
                        setNickname(data.nickname);
                        setUserScore(data.userScore);
                        setGithubUrl(data.githubUrl || "");
                        setIntroduction(data.introduction || ""); // introduction 필드 추가 필요

                        // 관심분야 변환
                        const interests = data.interests.map((interest) => ({
                            id: interest.interestId,
                            name: interest.interestName,
                            category: "framework", // 기본값
                            difficulty: interest.interestLevel,
                        }));
                        setUserInterests(interests);
                    }
                } else if (activeTab === "회원정보 수정") {
                    const updatePageResponse = await getUpdatePageInfo();
                    if (updatePageResponse.success) {
                        const data = updatePageResponse.data;
                        setName(data.name);
                        setNickname(data.nickname);
                        setEmail(data.userId); // userId를 email로 사용
                        setPhone(data.tel);
                    }
                }
            } catch (error) {
                console.error("데이터 로드 실패:", error);
                alert("데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (authContext?.isLoggedIn) {
            loadData();
        }
    }, [activeTab, authContext?.isLoggedIn]);

    const handleDeleteAccount = async () => {
        if (
            window.confirm(
                "정말로 회원탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다."
            )
        ) {
            try {
                const response = await withdrawUser();
                if (response.success) {
                    alert("회원탈퇴가 완료되었습니다.");
                    authContext?.logout();
                    window.location.href = "/";
                }
            } catch (error) {
                console.error("회원탈퇴 실패:", error);
                alert("회원탈퇴에 실패했습니다.");
            }
        }
        setShowDeleteModal(false);
    };

    const handleEditIntro = () => {
        setIsEditingIntro(true);
    };

    const handleSaveIntro = async () => {
        try {
            // 소개글은 현재 API에 없으므로 임시로 로컬 상태만 업데이트
            setIsEditingIntro(false);
            alert("소개글이 저장되었습니다.");
        } catch (error) {
            console.error("소개글 저장 실패:", error);
            alert("소개글 저장에 실패했습니다.");
        }
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
                // TODO: 서버에 이미지 업로드 로직 추가
                alert(
                    "프로필 이미지가 변경되었습니다. (서버 업로드 기능은 추후 구현 예정)"
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInterestEdit = () => {
        setShowInterestModal(true);
    };

    const handleInterestComplete = async (
        selectedInterests: SelectedInterestItem[]
    ) => {
        try {
            const requestData: UserInterestsUpdateRequest = {
                interests: selectedInterests.map((interest) => ({
                    interestId: interest.id,
                    interestLevel: interest.difficulty,
                })),
            };

            const response = await updateUserInterests(requestData);
            if (response.success) {
                setUserInterests(selectedInterests);
                setShowInterestModal(false);
                alert("관심분야가 성공적으로 수정되었습니다.");
            }
        } catch (error) {
            console.error("관심분야 수정 실패:", error);
            alert("관심분야 수정에 실패했습니다.");
        }
    };

    const handleInterestCancel = () => {
        setShowInterestModal(false);
    };

    // GitHub URL 편집 핸들러들
    const handleGithubEdit = () => {
        setIsEditingGithub(true);
        setTempGithubUrl(githubUrl);
    };

    const handleGithubSave = async () => {
        try {
            // TODO: GitHub URL 업데이트 API 호출
            setGithubUrl(tempGithubUrl);
            setIsEditingGithub(false);
            console.log("GitHub URL이 저장되었습니다:", tempGithubUrl);
        } catch (error) {
            console.error("GitHub URL 저장 실패:", error);
            alert("GitHub URL 저장에 실패했습니다.");
        }
    };

    const handleGithubCancel = () => {
        setIsEditingGithub(false);
        setTempGithubUrl("");
    };

    const handleGithubChange = (value: string) => {
        setTempGithubUrl(value);
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
    const handleUpdateProfile = async () => {
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

        try {
            const requestData: UserProfileUpdateRequest = {};

            if (password) {
                requestData.newPassword = password;
            }
            if (nickname) {
                requestData.newNickname = nickname;
            }
            if (phone) {
                requestData.newTel = phone;
            }

            const response = await updateUserProfile(requestData);
            if (response.success) {
                alert("회원정보가 성공적으로 수정되었습니다.");

                // 닉네임이 변경된 경우 AuthContext 업데이트
                if (requestData.newNickname && authContext?.user) {
                    authContext.login(
                        {
                            ...authContext.user,
                            nickname: requestData.newNickname,
                        },
                        authContext.token || undefined
                    );
                }

                // 비밀번호 필드 초기화
                setPassword("");
                setConfirmPassword("");
                setPasswordError("");
            }
        } catch (error) {
            console.error("회원정보 수정 실패:", error);
            alert("회원정보 수정에 실패했습니다.");
        }
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
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-lg">로딩 중...</div>
                            </div>
                        ) : (
                            <>
                                {activeTab === "마이페이지" && (
                                    <div className="space-y-6 sm:space-y-8">
                                        {/* 프로필 섹션 */}
                                        <ProfileSection
                                            profileImage={profileImage}
                                            userScore={userScore}
                                            userInterests={userInterests}
                                            memberData={{
                                                nickname: nickname,
                                                githubUrl: githubUrl,
                                            }}
                                            isEditingGithub={isEditingGithub}
                                            onProfileImageClick={
                                                handleProfileImageClick
                                            }
                                            onImageChange={handleImageChange}
                                            onInterestEdit={handleInterestEdit}
                                            onGithubEdit={handleGithubEdit}
                                            onGithubSave={handleGithubSave}
                                            onGithubCancel={handleGithubCancel}
                                            onGithubChange={handleGithubChange}
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
                                            onIntroductionChange={
                                                setIntroduction
                                            }
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
                            </>
                        )}
                    </ResponsiveMainContent>
                </ResponsiveContainer>
            </PageLayout>

            {/* 회원탈퇴 모달 */}
            {showDeleteModal && (
                <DeleteModal
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteAccount}
                />
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

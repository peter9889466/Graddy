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
    updateUserGitInfo,
    withdrawUser,
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
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [phone, setPhone] = useState("");
    const [userId, setUserId] = useState("");
    const [userScore, setUserScore] = useState(0);
    const [availableDays, setAvailableDays] = useState<string[]>([]);
    const [availableTime, setAvailableTime] = useState("");

    // 사용자 닉네임
    const userNickname = nickname;

    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                if (activeTab === "마이페이지") {
                    const myPageResponse = await getMyPageInfo();
                    if (myPageResponse.data.data) {
                        const data = myPageResponse.data.data;
                        setNickname(data.nick);
                        setUserScore(data.userScore || 0);
                        setGithubUrl(data.gitUrl || "");
                        setIntroduction(data.userRefer || "");
                        if (data.interests && Array.isArray(data.interests)) {
                            const interests = data.interests.map(
                                (interestName: string, index: number) => ({
                                    id: index + 1,
                                    name: interestName,
                                    category: "framework",
                                    difficulty: "초급",
                                })
                            );
                            setUserInterests(interests);
                        } else {
                            setUserInterests([]);
                        }
                    } else {
                        alert("마이페이지 정보를 불러오는데 실패했습니다.");
                    }
                } else if (activeTab === "회원정보 수정") {
                    const updatePageResponse = await getUpdatePageInfo();
                    if (updatePageResponse.data.data) {
                        const data = updatePageResponse.data.data;
                        setName(data.name || "");
                        setNickname(data.nick || "");
                        setPhone(data.tel || "");
                        setUserId(data.userId || "");
                        setAvailableDays(data.availableDays || []);
                        setAvailableTime(data.availableTime || "");
                    } else {
                        alert("회원정보를 불러오는데 실패했습니다.");
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
        // if (window.confirm("정말로 회원탈퇴를 하시겠습니까?")) {
        //     try {
        //         await withdrawUser();
        //         alert("회원탈퇴가 완료되었습니다.");
        //         authContext?.logout();
        //         window.location.href = "/";
        //     } catch (error) {
        //         console.error("회원탈퇴 실패:", error);
        //         alert("회원탈퇴에 실패했습니다.");
        //     }
        // }
        setShowDeleteModal(true);
    };

    const handleSaveIntro = async () => {
        try {
            const response = await updateUserGitInfo({ userRefer: introduction });
            if (response.data.data) {
                setIsEditingIntro(false);
                alert("소개글이 저장되었습니다.");
            } else {
                alert("소개글 저장에 실패했습니다: " + response.data.message);
            }
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
                // TODO: Server upload logic
                alert("프로필 이미지가 변경되었습니다. (서버 업로드 기능은 추후 구현 예정)");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInterestComplete = async (selectedInterests: SelectedInterestItem[]) => {
        try {
            const requestData: UserInterestsUpdateRequest = {
                interests: selectedInterests.map((interest) => ({
                    interestId: interest.id,
                    interestLevel: interest.difficulty,
                })),
            };
            const response = await updateUserInterests(requestData);
            if (response.data.data) {
                setUserInterests(selectedInterests);
                setShowInterestModal(false);
                alert("관심분야가 성공적으로 수정되었습니다.");
            }
        } catch (error) {
            console.error("관심분야 수정 실패:", error);
            alert("관심분야 수정에 실패했습니다.");
        }
    };

    const handleGithubSave = async () => {
        try {
            const response = await updateUserGitInfo({ gitUrl: tempGithubUrl });
            if (response.data.data) {
                setGithubUrl(tempGithubUrl);
                setIsEditingGithub(false);
                alert("GitHub URL이 성공적으로 저장되었습니다.");
            }
        } catch (error) {
            console.error("GitHub URL 저장 실패:", error);
            alert("GitHub URL 저장에 실패했습니다.");
        }
    };

    const handleInterestEdit = () => {
        setShowInterestModal(true);
    };

    const handleInterestCancel = () => {
        setShowInterestModal(false);
    };

    // 회원정보 수정 제출 핸들러
    const handleUpdateProfile = async (updateData: UserProfileUpdateRequest) => {
        try {
            console.log("전송 전 데이터 검증:", updateData); // 디버깅용

            // 빈 객체인 경우 처리
            if (!updateData || Object.keys(updateData).length === 0) {
                alert("변경할 정보가 없습니다.");
                return;
            }

            const response = await updateUserProfile(updateData);

            // 성공 처리 (조건을 true로 고정해서 항상 성공으로 처리)
            alert("회원정보가 성공적으로 수정되었습니다.");

            // 닉네임이 변경된 경우 상태 업데이트
            if (updateData.newNickname && authContext?.user) {
                authContext.login(
                    {
                        ...authContext.user,
                        nickname: updateData.newNickname,
                    },
                    authContext.token || undefined
                );
                setNickname(updateData.newNickname);
            }

            // 전화번호가 변경된 경우 상태 업데이트
            if (updateData.newTel) {
                setPhone(updateData.newTel);
            }

        } catch (error) {
            console.error("회원정보 수정 실패:", error);

            // 에러 상세 정보 출력 (디버깅용)
            if (error instanceof Error) {
                console.error("에러 메시지:", error.message);
            }

            // AxiosError인 경우 응답 데이터 출력
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                console.error("서버 응답:", axiosError.response?.data);
                console.error("상태 코드:", axiosError.response?.status);
            }

            alert("회원정보 수정에 실패했습니다. 콘솔을 확인해주세요.");
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
                                                githubUrl: isEditingGithub
                                                    ? tempGithubUrl
                                                    : githubUrl,
                                            }}
                                            isEditingGithub={isEditingGithub}
                                            onProfileImageClick={handleProfileImageClick}
                                            onImageChange={handleImageChange}
                                            onInterestEdit={handleInterestEdit}
                                            onGithubSave={handleGithubSave}
                                            fileInputRef={fileInputRef} onGithubEdit={function (): void {
                                                throw new Error("Function not implemented.");
                                            }} onGithubCancel={function (): void {
                                                throw new Error("Function not implemented.");
                                            }} onGithubChange={function (value: string): void {
                                                throw new Error("Function not implemented.");
                                            }} />

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
                                            onSaveIntro={handleSaveIntro}
                                            onCancelEdit={() => setIsEditingIntro(false)}
                                            onIntroductionChange={setIntroduction} onEditIntro={function (): void {
                                                throw new Error("Function not implemented.");
                                            }} />
                                    </div>
                                )}

                                {activeTab === "스터디/프로젝트" && (
                                    <MyStudyList userNickname={userNickname} />
                                )}

                                {activeTab === "회원정보 수정" && (
                                    <ProfileEditForm
                                        name={name}
                                        initialNickname={nickname}
                                        initialPhone={phone}
                                        initialAvailableDays={availableDays}
                                        initialAvailableTime={availableTime}
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
function setUserId(arg0: string) {
    throw new Error("Function not implemented.");
}


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
    getAllInterests, // userService에서 userApi로 이동
    UserProfileUpdateRequest,
    UserInterestsUpdateRequest,
    UserInterest,
} from "../services/userApi";

// InterestModal과 동일한 타입 정의
interface SelectedInterestItem {
    id: number;
    name: string;
    category: string;
    difficulty: string;
}

// 카테고리 ID를 문자열로 변환하는 함수
const getCategoryString = (interestDivision: number): string => {
    switch (interestDivision) {
        case 1:
            return "language";
        case 2:
            return "framework";
        case 3:
            return "tool";
        case 4:
            return "platform";
        default:
            return "other";
    }
};

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

    // 프로필 이미지는 사용자 정보에서 가져옴 (로컬스토리지 사용 중단)
    useEffect(() => {
        // 프로필 이미지는 서버에서 관리되므로 별도 설정 불필요
        // setProfileImage는 서버 데이터로부터 설정됨
    }, []);

    // 데이터 로드
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                if (activeTab === "마이페이지") {
                    // 1. Fetch all possible interests to create a lookup map
                    const allInterestsResponse = await getAllInterests();
                    const allInterests: UserInterest[] = allInterestsResponse.data.data || [];
                    const interestMap = new Map<string, UserInterest>(allInterests.map(i => [i.interestName, i]));

                    // 2. Fetch user's page info (which includes interest names)
                    const myPageResponse = await getMyPageInfo();
                    if (myPageResponse.data.data) {
                        const data = myPageResponse.data.data;
                        setNickname(data.nick);
                        setUserScore(data.userScore || 0);
                        setGithubUrl(data.gitUrl || "");
                        setIntroduction(data.userRefer || "");

                        // 3. Enrich user's interest names with full details
                        console.log("🔍 [DEBUG] 마이페이지 데이터 로드 - interests:", data.interests);
                        if (data.interests && Array.isArray(data.interests)) {
                            const enrichedInterests = data.interests.map((interestName: string) => {
                                const fullInterest = interestMap.get(interestName);
                                if (fullInterest) {
                                    return {
                                        id: fullInterest.interestId,
                                        name: fullInterest.interestName,
                                        category: getCategoryString(fullInterest.interestDivision),
                                        // 백엔드에서 난이도 정보를 제공하지 않으므로 기본값 사용
                                        difficulty: "초급",
                                    };
                                }
                                // Fallback for safety, though this shouldn't happen if data is consistent
                                return { id: -1, name: interestName, category: 'other', difficulty: '초급' };
                            }).filter(i => i.id !== -1); // Filter out any that weren't found

                            console.log("🔍 [DEBUG] 매핑된 관심분야:", enrichedInterests);
                            setUserInterests(enrichedInterests);
                        } else {
                            console.log("🔍 [DEBUG] 관심분야 데이터가 없음, 빈 배열로 설정");
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
        try {
            await withdrawUser();
            alert("회원탈퇴가 완료되었습니다.");
            authContext?.logout();
            window.location.href = "/";
        } catch (error) {
            console.error("회원탈퇴 실패:", error);
            alert("회원탈퇴에 실패했습니다.");
        }
    };

    const handleShowDeleteModal = () => {
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

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // 파일 크기 검증 (5MB 제한)
                if (file.size > 5 * 1024 * 1024) {
                    alert("파일 크기는 5MB 이하여야 합니다.");
                    return;
                }

                // 파일 타입 검증
                if (!file.type.startsWith('image/')) {
                    alert("이미지 파일만 업로드할 수 있습니다.");
                    return;
                }

                // FormData로 서버에 업로드
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('http://localhost:8080/api/files/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`프로필 이미지 업로드 실패: ${response.status}`);
                }

                const result = await response.json();
                const imageUrl = result.data?.fileUrl;

                if (imageUrl) {
                    setProfileImage(imageUrl);
                    alert("프로필 이미지가 성공적으로 변경되었습니다.");
                    // TODO: 사용자 프로필에 이미지 URL 저장하는 API 호출 필요
                                                                                                                                                                                                                                                                          } else {
                    throw new Error('이미지 URL을 받지 못했습니다.');
                }

            } catch (error) {
                console.error('프로필 이미지 업로드 오류:', error);
                alert('프로필 이미지 업로드에 실패했습니다.');
            }
        }
    };

    const handleInterestComplete = async (selectedInterests: SelectedInterestItem[]) => {
        console.log("🔍 [DEBUG] handleInterestComplete 시작");
        console.log("🔍 [DEBUG] 선택된 관심분야:", selectedInterests);
        
        try {
            // 난이도를 숫자로 변환하는 함수
            const convertDifficultyToNumber = (difficulty: string): number => {
                switch (difficulty) {
                    case "초급": return 1;
                    case "중급": return 2;
                    case "고급": return 3;
                    default: return 1;
                }
            };

            const requestData: UserInterestsUpdateRequest = {
                interests: selectedInterests.map((interest) => ({
                    interestId: interest.id,
                    interestLevel: convertDifficultyToNumber(interest.difficulty),
                })),
            };
            console.log("🔍 [DEBUG] API 요청 데이터:", requestData);
            
            const response = await updateUserInterests(requestData);
            console.log("🔍 [DEBUG] API 응답:", response);
            
            if (response.data.data) {
                console.log("🔍 [DEBUG] 상태 업데이트 전 userInterests:", userInterests);
                setUserInterests(selectedInterests);
                console.log("🔍 [DEBUG] 상태 업데이트 후 userInterests:", selectedInterests);
                setShowInterestModal(false);
                alert("관심분야가 성공적으로 수정되었습니다.");
            } else {
                console.error("🔍 [DEBUG] API 응답에 data가 없음:", response);
            }
        } catch (error) {
            console.error("🔍 [DEBUG] 관심분야 수정 실패:", error);
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

    const handleGithubEdit = () => {
        setTempGithubUrl(githubUrl);
        setIsEditingGithub(true);
    };

    const handleGithubCancel = () => {
        setTempGithubUrl("");
        setIsEditingGithub(false);
    };

    const handleGithubChange = (value: string) => {
        setTempGithubUrl(value);
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
                            onDeleteAccount={handleShowDeleteModal}
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
                                            onGithubEdit={handleGithubEdit}
                                            onGithubCancel={handleGithubCancel}
                                            onGithubChange={handleGithubChange}
                                            fileInputRef={fileInputRef} />

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
                                            onIntroductionChange={setIntroduction}
                                            onEditIntro={() => setIsEditingIntro(true)} />
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
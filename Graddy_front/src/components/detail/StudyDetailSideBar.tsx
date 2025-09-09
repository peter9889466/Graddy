import React, { useState } from "react";
import { User, Settings, Trash2 } from "lucide-react";
import ProfileModal from "../modal/ProfileModal";
import axios from "axios";

interface SideMenuItem {
    name: string;
    icon?: React.ComponentType<any>;
    onClick?: () => void;
    requiresAuth?: boolean;
    requiresMembership?: boolean;
}

interface StudyDetailSideBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isLoggedIn: boolean;
    isStudyMember: boolean;
    isProject?: boolean;
    isStudyLeader?: boolean;
    userMemberType?: string | null;
    maxMembers?: number;
    members?: Array<{
        memberId: number;
        userId: string;
        nick: string;
        memberType: string;
        memberStatus: string;
        joinedAt: string;
    }>;
    applications?: Array<{
        userId: string;
        nick: string;
        studyProjectId: number;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        message: string;
        appliedAt: string;
    }>;
    onProcessApplication?: (userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => void;
    studyProjectId?: number; // 스터디 프로젝트 ID 추가
    onApplyToStudy?: () => void; // 가입 신청 콜백 함수 추가
}

// API 응답 타입 정의
interface MemberDetailResponse {
    memberId: number;
    userId: string;
    studyProjectId: number;
    nick: string;
    gitUrl: string;
    userRefer: string;
    imgUrl: string | null;
    userScore: number;
    interests: Array<{
        id: number;
        name: string;
        category: string;
        difficulty: string;
    }>;
    joinedAt: string;
}

// 스터디원 데이터 타입 정의 (ProfileModal에 전달할 타입)
interface StudyMember {
    nickname: string;
    githubUrl: string;
    score: number;
    interests: Array<{
        id: number;
        name: string;
        category: string;
        difficulty: string;
    }>;
    introduction: string;
    profileImage?: string;
}

const StudyDetailSideBar: React.FC<StudyDetailSideBarProps> = ({
    activeTab,
    onTabChange,
    isLoggedIn,
    isStudyMember,
    isProject = false,
    isStudyLeader = false,
    userMemberType = null,
    maxMembers = 10,
    members = [],
    applications = [],
    onProcessApplication,
    onApplyToStudy,
    studyProjectId,
}) => {
    const [selectedMember, setSelectedMember] = useState<StudyMember | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoadingMember, setIsLoadingMember] = useState(false);

    const sideMenuItems: SideMenuItem[] = isProject 
        ? [
            { name: "프로젝트 메인" },
            { name: "커뮤니티", requiresAuth: true, requiresMembership: true },
        ]
        : [
            { name: "스터디 메인" },
            { name: "커리큘럼" },
            { name: "커뮤니티", requiresAuth: true, requiresMembership: true },
            { name: "과제 제출", requiresAuth: true, requiresMembership: true },
            { name: "과제 피드백", requiresAuth: true, requiresMembership: true },
            { name: "과제 / 일정 관리", requiresAuth: true, requiresMembership: true },
        ];
        
    const handleApplicantClick = async (userId: string) => {
        setIsLoadingMember(true);
        try {
            const token = localStorage.getItem("userToken");

            const response = await axios.get(
                `http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/user/info/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const userData = response.data;

            // ProfileModal에 맞게 변환
            const memberData: StudyMember = {
                nickname: userData.nick,
                githubUrl: userData.gitUrl || "",
                score: userData.userScore,
                interests: (userData.interests || []).map((name: string, idx: number) => ({
                    id: idx,
                    name,
                    category: "",   // 카테고리 정보는 API에 없으므로 빈 문자열
                    difficulty: "",
                })),
                introduction: userData.userRefer || "소개가 없습니다.",
                profileImage: userData.imgUrl || undefined,
            };

            setSelectedMember(memberData);
            setIsProfileModalOpen(true);

        } catch (error) {
            console.error("가입 신청 유저 정보를 불러오는데 실패했습니다:", error);
            alert("가입 신청 유저 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoadingMember(false);
        }
    };

    // 멤버 클릭 시 상세 정보 API 호출
    const handleMemberClick = async (memberId: number) => {
        if (!studyProjectId) {
            console.error("studyProjectId가 없습니다.");
            alert("스터디 정보를 불러올 수 없습니다.");
            return;
        }

        setIsLoadingMember(true);
        try {
            // 토큰을 localStorage에서 가져오기
            const token = localStorage.getItem("userToken");

            const response = await axios.get<MemberDetailResponse>(
                `http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/api/study/members/${studyProjectId}/${memberId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const memberData = response.data;

            // API 응답을 ProfileModal에 필요한 형식으로 변환
            const studyMember: StudyMember = {
                nickname: memberData.nick,
                githubUrl: memberData.gitUrl || "",
                score: memberData.userScore,
                interests: (memberData.interests || []).map((interest, idx) => ({
                    id: idx, // 배열 index로 임시 id
                    name: interest, // 문자열 그대로 name에 매핑
                    category: "",
                    difficulty: "",
                })),
                introduction: memberData.userRefer || "소개가 없습니다.",
                profileImage: memberData.imgUrl || undefined,
            };

            setSelectedMember(studyMember);
            setIsProfileModalOpen(true);
        } catch (error) {
            console.error("멤버 상세 정보를 불러오는데 실패했습니다:", error);

            // 더 자세한 에러 정보 출력
            if (axios.isAxiosError(error)) {
                console.error("Status:", error.response?.status);
                console.error("Status Text:", error.response?.statusText);
                console.error("Response Data:", error.response?.data);
                console.error("Request URL:", error.config?.url);
                console.error("Request Headers:", error.config?.headers);
            }

            // 토큰 확인
            const token = localStorage.getItem("userToken");
            console.log("Token exists:", !!token);
            console.log(
                "Token preview:",
                token ? token.substring(0, 20) + "..." : "No token"
            );

            alert("멤버 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsLoadingMember(false);
        }
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedMember(null);
    };

    const handleProcessApplication = async (userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        if (onProcessApplication) {
            onProcessApplication(userId, status, reason);
        }
    };

    return (
        <>
            {/* 스터디 상세 메뉴 섹션 */}
            <div className="bg-white rounded-xl p-3 sm:p-4">
                <div className="space-y-2">
                    {sideMenuItems.map((item) => {
                        // 권한 체크 - leader 또는 member는 모든 메뉴에 접근 가능
                        const hasAuth = !item.requiresAuth || isLoggedIn;
                        const hasMembership = !item.requiresMembership || (userMemberType === 'leader' || userMemberType === 'member');
                        const canAccess = hasAuth && hasMembership;

                        // 클릭 핸들러 함수
                        const handleClick = () => {
                            if (item.requiresAuth && !isLoggedIn) {
                                alert('로그인 후 이용해주세요.');
                                return;
                            }
                            if (item.requiresMembership && !(userMemberType === 'leader' || userMemberType === 'member')) {
                                alert('스터디원만 확인할 수 있습니다.');
                                return;
                            }
                            onTabChange(item.name);
                        };

                        return (
                            <React.Fragment key={item.name}>
                                <button
                                    onClick={handleClick}
                                    className={`w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-sm sm:text-base hover:scale-105 hover:text-[#8B85E9] hover:font-bold ${activeTab === item.name
                                        ? "font-bold text-[#8B85E9]"
                                        : "text-black"
                                        }`}
                                >
                                    {item.icon && (
                                        <item.icon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                                    )}
                                    <span className="truncate">{item.name}</span>
                                </button>
                                <hr className="mb-3" style={{color:"gray"}} />
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* 가입 신청 목록 (리더만 볼 수 있음) */}
            {userMemberType === 'leader' && applications.length > 0 && (
                <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3
                            className="font-bold text-sm sm:text-base"
                            style={{ color: "#8B85E9" }}
                        >
                            가입 신청
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {applications.length}건
                        </span>
                    </div>
                    <hr className="mb-3 border-gray-200" />
                    <div className=" rounded-lg p-3 space-y-3">
                        {applications.map((application, index) => (
                            <div
                                key={index}
                                className="rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleApplicantClick(application.userId)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800">
                                        {application.nick}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // 클릭 이벤트 전파 방지
                                                onProcessApplication?.(application.userId, 'APPROVED');
                                            }}
                                            className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                        >
                                            V
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const reason = prompt('거절 사유를 입력하세요 (선택사항):');
                                                onProcessApplication?.(application.userId, 'REJECTED', reason || undefined);
                                            }}
                                            className="flex-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 스터디/프로젝트 멤버 섹션 */}
            <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm sm:text-base" style={{ color: "#8B85E9" }}>
                        {isProject ? "프로젝트 멤버" : "스터디 멤버"}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {members.length}/{maxMembers}
                    </span>
                </div>
                <hr className="mb-3 border-gray-200" />
                
                {/* 멤버 목록 */}
                <div className="bg-gray-50 rounded-lg p-3 pl-6 space-y-3">
                    {members.map((member, index) => (
                        <button
                            key={index}
                            onClick={() => handleMemberClick(member.memberId)}
                            disabled={isLoadingMember}
                            className={`w-full text-left text-sm text-gray-700 hover:text-[#8B85E9] hover:font-medium transition-all duration-200 cursor-pointer ${
                                isLoadingMember ? 'opacity-50 cursor-wait' : ''
                            }`}
                        >
                            {member.nick || member.userId}
                            {isLoadingMember && <span className="ml-2">로딩중...</span>}
                        </button>
                    ))}
                </div>
                
            </div>

            {/* 프로필 모달 */}
            {selectedMember && (
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={handleCloseProfileModal}
                    memberData={selectedMember}
                />
            )}
        </>
    );
};

export default StudyDetailSideBar;
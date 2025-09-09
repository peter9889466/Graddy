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

interface ProjectDetailSideBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isLoggedIn: boolean;
    isStudyMember: boolean;
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
        studyProjectId: number;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        message: string;
        appliedAt: string;
    }>;
    studyProjectId: number;
    onProcessApplication?: (userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => void;
    onApplyToProject?: () => void;
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

// 프로젝트 멤버 프로필 타입 (스터디와 동일한 모달을 재사용)
interface ProjectMemberProfile {
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

const ProjectDetailSideBar: React.FC<ProjectDetailSideBarProps> = ({
    activeTab,
    onTabChange,
    isLoggedIn,
    isStudyMember,
    maxMembers = 10,
    members = [],
    applications = [],
    onProcessApplication,
}) => {
    const [selectedMember, setSelectedMember] = useState<ProjectMemberProfile | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoadingMember, setIsLoadingMember] = useState(false);

    // 멤버 클릭 시 API 호출하여 상세 데이터 로드
    const handleMemberClick = async (member: { memberId: number; userId: string; nick: string }) => {
        setIsLoadingMember(true);
        try {
            const response = await axios.get<MemberDetailResponse>(
                `http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/members/${member.memberId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                const memberData: ProjectMemberProfile = {
                    nickname: response.data.nick || response.data.userId,
                    githubUrl: response.data.gitUrl || "",
                    score: response.data.userScore || 0,
                    interests: response.data.interests || [],
                    introduction: response.data.userRefer || `${member.nick}님의 프로필입니다.`,
                    profileImage: response.data.imgUrl || undefined,
                };
                setSelectedMember(memberData);
                setIsProfileModalOpen(true);
            }
        } catch (error) {
            console.error('멤버 상세 정보 로드 실패:', error);
            // API 호출 실패 시 기본 데이터로 모달 표시
            const fallbackData: ProjectMemberProfile = {
                nickname: member.nick || member.userId,
                githubUrl: "",
                score: 0,
                interests: [],
                introduction: `${member.nick}님의 프로필입니다.`,
            };
            setSelectedMember(fallbackData);
            setIsProfileModalOpen(true);
        } finally {
            setIsLoadingMember(false);
        }
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedMember(null);
    };
    const sideMenuItems: SideMenuItem[] = [
        { name: "프로젝트 메인" },
        { name: "커뮤니티", requiresAuth: true, requiresMembership: true },
    ];

    return (
        <>
            {/* 프로젝트 상세 메뉴 섹션 */}
            <div
                className="bg-white rounded-xl p-3 sm:p-4"
            >
                <div className="space-y-2">
                    {sideMenuItems.map((item) => {
                        // 권한 체크
                        const hasAuth = !item.requiresAuth || isLoggedIn;
                        const hasMembership = !item.requiresMembership || isStudyMember;
                        const canAccess = hasAuth && hasMembership;

                        // 클릭 핸들러 함수
                        const handleClick = () => {
                            if (item.requiresAuth && !isLoggedIn) {
                                alert('로그인 후 이용해주세요.');
                                return;
                            }
                            if (item.requiresMembership && !isStudyMember) {
                                alert('팀원만 확인할 수 있습니다.');
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
            {applications.length > 0 && (
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
                    <div className="rounded-lg p-3 space-y-3">
                        {applications.map((application, index) => (
                            <div key={index} className="rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-800">
                                    {application.userId}
                                </span>
                                <div className="flex gap-2">
                                <button
                                    onClick={() => onProcessApplication?.(application.userId, 'APPROVED')}
                                    className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                >
                                    V
                                </button>
                                <button
                                    onClick={() => {
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

            {/* 프로젝트 멤버 섹션 */}
            <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3
                        className="font-bold text-sm sm:text-base"
                        style={{ color: "#8B85E9" }}
                    >
                        프로젝트 멤버
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {members.length}/{maxMembers}
                    </span>
                </div>
                <hr className="mb-3 border-gray-200" />
                <div className="bg-gray-50 rounded-lg p-3 pl-6 space-y-3">
                    {members.length > 0 ? (
                        members.map((member, index) => (
                            <button
                                key={index}
                                onClick={() => handleMemberClick(member)}
                                disabled={isLoadingMember}
                                className="w-full text-left text-sm text-gray-700 hover:text-[#8B85E9] hover:font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingMember ? '로딩 중...' : member.nick || member.userId}
                            </button>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500">멤버가 없습니다.</div>
                    )}
                </div>
            </div>

            {/* 프로필 모달 */}
            {selectedMember && (
                <ProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={handleCloseProfileModal}
                    memberData={selectedMember}
                    studyType="project"
                />
            )}
        </>
    );
};

export default ProjectDetailSideBar;



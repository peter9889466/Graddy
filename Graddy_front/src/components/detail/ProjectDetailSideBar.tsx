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

    // 백엔드 멤버 데이터를 모달에 맞는 구조로 변환
    const projectMembers: ProjectMemberProfile[] = members.map((member) => ({
        nickname: member.nick || member.userId,
        githubUrl: "", // TODO: 백엔드에서 GitHub URL 추가 시 매핑
        score: 0, // TODO: 점수 데이터 연동 시 교체
        interests: [], // TODO: 관심사 데이터 연동 시 교체
        introduction: `${member.memberType === 'leader' ? '리더' : '멤버'}입니다.`,
    }));

    const handleMemberClick = (member: ProjectMemberProfile) => {
        setSelectedMember(member);
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedMember(null);
    };
    const sideMenuItems: SideMenuItem[] = [
        { name: "프로젝트 메인" },
        { name: "커뮤니티", requiresAuth: true, requiresMembership: true },
    ];

    const handleApplicantClick = async (userId: string) => {
        setIsLoadingMember(true);
        try {
            const token = localStorage.getItem("userToken");

            const response = await axios.get(
                `/api/user/info/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const userData = response.data;

            // ProfileModal에 맞게 변환
            const memberData: ProjectMemberProfile = {
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
                            <div key={index} className="rounded-lg p-3 bg-gray-50"
                            onClick={() => handleApplicantClick(application.userId)}>
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
                    {projectMembers.length > 0 ? (
                        projectMembers.map((member, index) => (
                            <button
                                key={index}
                                onClick={() => handleMemberClick(member)}
                                className="w-full text-left text-sm text-gray-700 hover:text-[#8B85E9] hover:font-medium transition-all duration-200 cursor-pointer"
                            >
                                {member.nickname}
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
                />
            )}
        </>
    );
};

export default ProjectDetailSideBar;



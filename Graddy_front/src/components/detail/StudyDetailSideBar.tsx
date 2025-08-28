import React, { useState } from "react";
import { User, Settings, Trash2 } from "lucide-react";
import ProfileModal from "../modal/ProfileModal";

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
        studyProjectId: number;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        message: string;
        appliedAt: string;
    }>;
    onProcessApplication?: (userId: string, status: 'PENDING' | 'REJECTED', reason?: string) => void;
}

// 스터디원 데이터 타입 정의
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
}) => {
    const [selectedMember, setSelectedMember] = useState<StudyMember | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

    // 백엔드에서 받아온 멤버 데이터를 사용
    const studyMembers = members.map(member => ({
        nickname: member.nick || member.userId,
        githubUrl: "", // TODO: 백엔드에서 GitHub URL 정보 추가 필요
        score: 0, // TODO: 백엔드에서 점수 정보 추가 필요
        interests: [], // TODO: 백엔드에서 관심사 정보 추가 필요
        introduction: `${member.memberType === 'leader' ? '리더' : '멤버'}입니다.` // TODO: 백엔드에서 소개 정보 추가 필요
    }));

    const handleMemberClick = (member: StudyMember) => {
        setSelectedMember(member);
        setIsProfileModalOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedMember(null);
    };

    return (
        <>
            {/* 스터디 상세 메뉴 섹션 */}
            <div
                className="bg-white rounded-xl p-3 sm:p-4"
            >
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
                            <div key={index} className="rounded-lg p-3 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800">
                                        {application.userId}
                                    </span>
                                    {/* <span className="text-xs text-gray-500">
                                        {new Date(application.appliedAt).toLocaleDateString()}
                                    </span> */}
                                    <div className="flex gap-2">
                                    <button
                                        onClick={() => onProcessApplication?.(application.userId, 'PENDING')}
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
                                {/* <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                    {application.message}
                                </p> */}
                                {/* <div className="flex gap-2">
                                    <button
                                        onClick={() => onProcessApplication?.(application.userId, 'PENDING')}
                                        className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    >
                                        수락
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt('거절 사유를 입력하세요 (선택사항):');
                                            onProcessApplication?.(application.userId, 'REJECTED', reason || undefined);
                                        }}
                                        className="flex-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        거절
                                    </button>
                                </div> */}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 스터디/프로젝트 멤버 섹션 */}
            <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3
                        className="font-bold text-sm sm:text-base"
                        style={{ color: "#8B85E9" }}
                    >
                        {isProject ? "프로젝트 멤버" : "스터디 멤버"}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {members.length}/{maxMembers}
                    </span>
                </div>
                <hr className="mb-3 border-gray-200" />
                <div className="bg-gray-50 rounded-lg p-3 pl-6 space-y-3">
                    {studyMembers.map((member, index) => (
                        <button
                            key={index}
                            onClick={() => handleMemberClick(member)}
                            className="w-full text-left text-sm text-gray-700 hover:text-[#8B85E9] hover:font-medium transition-all duration-200 cursor-pointer"
                        >
                            {member.nickname}
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

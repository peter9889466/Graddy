import React from "react";
import { User, Settings, Trash2 } from "lucide-react";

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
    onProcessApplication?: (userId: string, status: 'PENDING' | 'REJECTED', reason?: string) => void;
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
                    <div className="bg-yellow-50 rounded-lg p-3 space-y-3">
                        {applications.map((application, index) => (
                            <div key={index} className="border border-yellow-200 rounded-lg p-3 bg-white">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        {application.userId}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(application.appliedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                    {application.message}
                                </p>
                                <div className="flex gap-2">
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
                            <div key={index} className="text-sm text-gray-700">
                                {member.nick || member.userId}
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-gray-500">멤버가 없습니다.</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProjectDetailSideBar;



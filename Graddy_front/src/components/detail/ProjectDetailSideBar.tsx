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
}

const ProjectDetailSideBar: React.FC<ProjectDetailSideBarProps> = ({
    activeTab,
    onTabChange,
    isLoggedIn,
    isStudyMember,
}) => {
    const sideMenuItems: SideMenuItem[] = [
        { name: "프로젝트 메인" },
        { name: "커리큘럼" },
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
                                alert('프로젝트 멤버만 확인할 수 있습니다.');
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

            {/* 프로젝트 멤버 섹션 */}
            <div className="p-3 sm:p-4">
                <h3
                    className="font-bold mb-3 text-sm sm:text-base"
                    style={{ color: "#8B85E9" }}
                >
                    프로젝트 멤버
                </h3>
                <hr className="mb-3 border-gray-200" />
                <div className="bg-gray-50 rounded-lg p-3 pl-6 space-y-3">
                    <div className="text-sm text-gray-700">김개발</div>
                    <div className="text-sm text-gray-700">이코딩</div>
                    <div className="text-sm text-gray-700">박스터디</div>
                    <div className="text-sm text-gray-700">정알고</div>
                </div>
            </div>
        </>
    );
};

export default ProjectDetailSideBar;


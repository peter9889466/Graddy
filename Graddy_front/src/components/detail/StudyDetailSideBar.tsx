import React from "react";
import { User, Settings, Trash2 } from "lucide-react";

interface SideMenuItem {
    name: string;
    icon?: React.ComponentType<any>;
    onClick?: () => void;
}

interface StudyDetailSideBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const StudyDetailSideBar: React.FC<StudyDetailSideBarProps> = ({
    activeTab,
    onTabChange,
}) => {
    const sideMenuItems: SideMenuItem[] = [
        { name: "스터디 메인" },
        { name: "커리큘럼" },
        { name: "커뮤니티" },
        { name: "과제 제출" },
        { name: "과제 피드백" },
        { name: "과제 / 일정 관리" },
    ];

    return (
        <>
            {/* 스터디 상세 메뉴 섹션 */}
            <div
                className="bg-white rounded-xl shadow-sm border-2 p-3 sm:p-4"
            >
                <div className="space-y-2">
                    {sideMenuItems.slice(0, 6).map((item) => (
                        <button
                            key={item.name}
                            onClick={() => onTabChange(item.name)}
                            className={`w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-sm sm:text-base ${activeTab === item.name
                                ? "font-medium"
                                : "text-black"
                                }`}
                            style={
                                activeTab === item.name
                                    ? {
                                        backgroundColor: "#E8E6FF",
                                        color: "#8B85E9",
                                    }
                                    : {
                                        color:
                                            activeTab !== item.name
                                                ? "#000000"
                                                : "#8B85E9",
                                    }
                            }
                            onMouseEnter={(e) => {
                                if (activeTab !== item.name) {
                                    e.currentTarget.style.color = "#8B85E9";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== item.name) {
                                    e.currentTarget.style.color = "#000000";
                                }
                            }}
                        >
                            {item.icon && (
                                <item.icon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="truncate">{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 스터디 멤버 섹션 */}
            <div
                className="bg-white rounded-xl shadow-sm border-2 p-3 sm:p-4"
            >
                <h3
                    className="font-bold mb-3 text-sm sm:text-base"
                    style={{ color: "#8B85E9" }}
                >
                    스터디 멤버
                </h3>
                <div className="text-gray-500 text-xs sm:text-sm">
                    {/* 가입된 스터디 멤버*/}
                    스터디 멤버 목록을 불러오는 중...
                </div>
            </div>
        </>
    );
};

export default StudyDetailSideBar;

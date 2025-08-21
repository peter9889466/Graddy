import React from "react";
import { User, Settings, Trash2, BookOpen } from "lucide-react";

interface SideMenuItem {
    name: string;
    icon: React.ComponentType<any>;
    onClick?: () => void;
}

interface MyPageSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onDeleteAccount: () => void;
}

const MyPageSidebar: React.FC<MyPageSidebarProps> = ({
    activeTab,
    onTabChange,
    onDeleteAccount,
}) => {
    const sideMenuItems: SideMenuItem[] = [
        { name: "마이페이지", icon: User },
        { name: "내 스터디 목록", icon: BookOpen },
        { name: "회원정보 수정", icon: Settings },
        { name: "회원탈퇴", icon: Trash2, onClick: onDeleteAccount },
    ];

    return (
        <>
            {/* 마이페이지 섹션 */}
            <div
                className="bg-white rounded-xl shadow-sm border-2 p-3 sm:p-4"
            >
                <div className="space-y-2">
                    {sideMenuItems.slice(0, 3).map((item) => (
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
                            <span className="truncate">{item.name}</span>
                        </button>
                    ))}
                    <button
                        onClick={onDeleteAccount}
                        className="w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-red-600 hover:bg-red-50 text-sm sm:text-base"
                    >
                        <span className="truncate">회원탈퇴</span>
                    </button>
                </div>
            </div>


        </>
    );
};

export default MyPageSidebar;
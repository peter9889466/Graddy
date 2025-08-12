import React from "react";
import { User, Settings, Trash2 } from "lucide-react";

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
        { name: "회원정보 수정", icon: Settings },
        { name: "회원탈퇴", icon: Trash2, onClick: onDeleteAccount },
    ];

    return (
        <>
            {/* 마이페이지 섹션 */}
            <div
                className="bg-white rounded-xl shadow-sm border p-3 sm:p-4"
                style={{ borderColor: "#777777" }}
            >
                <h3
                    className="font-bold mb-3 text-sm sm:text-base"
                    style={{ color: "#8B85E9" }}
                >
                    마이페이지
                </h3>
                <div className="space-y-2">
                    {sideMenuItems.slice(0, 2).map((item) => (
                        <button
                            key={item.name}
                            onClick={() => onTabChange(item.name)}
                            className={`w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-sm sm:text-base ${
                                activeTab === item.name
                                    ? "font-medium"
                                    : "text-gray-600 hover:bg-purple-50"
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
                                                  ? "#6B7280"
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
                                    e.currentTarget.style.color = "#6B7280";
                                }
                            }}
                        >
                            <item.icon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                            <span className="truncate">{item.name}</span>
                        </button>
                    ))}
                    <button
                        onClick={onDeleteAccount}
                        className="w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-red-600 hover:bg-red-50 text-sm sm:text-base"
                    >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                        <span className="truncate">회원탈퇴</span>
                    </button>
                </div>
            </div>

            {/* 내 스터디 목록 */}
            <div
                className="bg-white rounded-xl shadow-sm border p-3 sm:p-4"
                style={{ borderColor: "#777777" }}
            >
                <h3
                    className="font-bold mb-3 text-sm sm:text-base"
                    style={{ color: "#8B85E9" }}
                >
                    내 스터디 목록
                </h3>
                <div className="text-gray-500 text-xs sm:text-sm">
                    {/* DB에서 스터디 목록을 받아올 예정 */}
                    스터디 목록을 불러오는 중...
                </div>
            </div>
        </>
    );
};

export default MyPageSidebar;

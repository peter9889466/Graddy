import React from "react";
import { User, Settings, Trash2, BookOpen } from "lucide-react";

interface SideMenuItem {
    name: string;
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
        { name: "마이페이지" },
        { name: "내 스터디 목록" },
        { name: "회원정보 수정" },
        { name: "회원탈퇴", onClick: onDeleteAccount },
    ];

    return (
        <>
            {/* 마이페이지 섹션 */}
            <div
                className="bg-white rounded-xl p-3 sm:p-4"
            >
                <div className="space-y-2">
                    {sideMenuItems.slice(0, 3).map((item) => (
                        <>
                            <button
                                key={item.name}
                                onClick={() => onTabChange(item.name)}
                                className={`w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-sm sm:text-base hover:scale-105 hover:text-[#8B85E9] hover:font-bold ${activeTab === item.name
                                    ? "font-bold text-[#8B85E9]"
                                    : "text-black"
                                    }`}
                            >
                                <span className="truncate">{item.name}</span>
                            </button>
                            <hr className="mb-3 border-gray-500" />
                        </>
                    ))}
                    <button
                        onClick={onDeleteAccount}
                        className={`w-full text-left px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group text-sm sm:text-base hover:scale-105 text-red-400  hover:text-rose-500 hover:font-bold ${activeTab === "회원탈퇴"
                                ? "font-bold text-rose-500"
                                : "text-red-400"
                            }`}
                    >
                        <span className="truncate">회원탈퇴</span>
                    </button>
                </div>
            </div>


        </>
    );
};

export default MyPageSidebar;
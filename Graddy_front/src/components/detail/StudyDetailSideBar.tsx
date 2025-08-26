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

    // 스터디원 데이터 (실제로는 API에서 가져올 예정)
    const studyMembers: StudyMember[] = [
        {
            nickname: "김개발",
            githubUrl: "github.com/kimdev",
            score: 1250,
            interests: [
                { id: 15, name: "React", category: "framework", difficulty: "중급" },
                { id: 2, name: "JavaScript", category: "language", difficulty: "중급" },
                { id: 16, name: "Node.js", category: "framework", difficulty: "초급" },
            ],
            introduction: "안녕하세요! 프론트엔드 개발에 열정을 가진 개발자입니다. React와 JavaScript를 주로 사용하며, 새로운 기술을 배우는 것을 좋아합니다."
        },
        {
            nickname: "이코딩",
            githubUrl: "github.com/leecoding",
            score: 980,
            interests: [
                { id: 1, name: "Python", category: "language", difficulty: "고급" },
                { id: 8, name: "Django", category: "framework", difficulty: "중급" },
                { id: 12, name: "MySQL", category: "database", difficulty: "중급" },
            ],
            introduction: "백엔드 개발을 전공하고 있습니다. Python과 Django를 주로 사용하며, 데이터베이스 설계에도 관심이 많습니다."
        },
        {
            nickname: "박스터디",
            githubUrl: "github.com/parkstudy",
            score: 750,
            interests: [
                { id: 3, name: "Java", category: "language", difficulty: "중급" },
                { id: 9, name: "Spring", category: "framework", difficulty: "초급" },
                { id: 4, name: "C++", category: "language", difficulty: "중급" },
            ],
            introduction: "Java와 Spring을 공부하고 있는 개발자입니다. 알고리즘 문제 풀이도 즐기며, 체계적인 학습을 추구합니다."
        },
        {
            nickname: "정알고",
            githubUrl: "github.com/jungalgo",
            score: 2100,
            interests: [
                { id: 4, name: "C++", category: "language", difficulty: "고급" },
                { id: 5, name: "Python", category: "language", difficulty: "고급" },
                { id: 6, name: "Algorithm", category: "cs", difficulty: "고급" },
            ],
            introduction: "알고리즘과 자료구조에 특화된 개발자입니다. 백준 플래티넘 등급이며, 코딩 테스트 준비를 도와드릴 수 있습니다."
        }
    ];

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

            {/* 스터디/프로젝트 멤버 섹션 */}
            <div className="p-3 sm:p-4">
                <h3
                    className="font-bold mb-3 text-sm sm:text-base"
                    style={{ color: "#8B85E9" }}
                >
                    {isProject ? "프로젝트 멤버" : "스터디 멤버"}
                </h3>
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

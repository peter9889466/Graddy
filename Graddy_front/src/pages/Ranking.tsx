import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import ResponsiveMainContent from "../components/layout/ResponsiveMainContent";

// 유저 타입 정의
interface User {
    id: number;
    nickname: string;
    email: string;
    score: number;
    profileImage: string;
    interests: string[];
    rank: number;
    studyCount: number;
}

export const Ranking = () => {
    // 현재 사용자 정보 (임시 데이터)
    const [currentUser] = useState<User>({
        id: 1,
        nickname: "사용자",
        email: "graddy@gmail.com",
        score: 1000,
        profileImage: "/android-icon-72x72.png",
        interests: ["React", "JavaScript", "Node.js"],
        rank: 15,
        studyCount: 5,
    });

    // 임시 랭킹 데이터
    const [rankingData] = useState<User[]>([
        {
            id: 2,
            nickname: "개발왕",
            email: "dev@example.com",
            score: 2850,
            profileImage: "/android-icon-72x72.png",
            interests: ["React", "TypeScript", "Next.js"],
            rank: 1,
            studyCount: 12,
        },
        {
            id: 3,
            nickname: "코딩마스터",
            email: "master@example.com",
            score: 2650,
            profileImage: "/android-icon-72x72.png",
            interests: ["Java", "Spring", "MySQL"],
            rank: 2,
            studyCount: 10,
        },
        {
            id: 4,
            nickname: "풀스택개발자",
            email: "fullstack@example.com",
            score: 2400,
            profileImage: "/android-icon-72x72.png",
            interests: ["Vue.js", "Python", "Django"],
            rank: 3,
            studyCount: 9,
        },
        {
            id: 5,
            nickname: "알고리즘킹",
            email: "algo@example.com",
            score: 2200,
            profileImage: "/android-icon-72x72.png",
            interests: ["C++", "알고리즘", "자료구조"],
            rank: 4,
            studyCount: 8,
        },
        {
            id: 6,
            nickname: "데이터분석가",
            email: "data@example.com",
            score: 2100,
            profileImage: "/android-icon-72x72.png",
            interests: ["Python", "Pandas", "Machine Learning"],
            rank: 5,
            studyCount: 7,
        },
    ]);

    // 모달 상태 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // 랭킹 메달 아이콘 반환
    const getRankIcon = (rank: number) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return `#${rank}`;
    };

    // 랭킹 배지 색상 반환
    const getRankBadgeColor = (rank: number) => {
        if (rank === 1) return "bg-yellow-500";
        if (rank === 2) return "bg-gray-400";
        if (rank === 3) return "bg-amber-600";
        if (rank <= 10) return "bg-blue-500";
        return "bg-gray-500";
    };

    // 사용자 클릭 핸들러
    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // 랭킹 리스트 컴포넌트
    const RankingList = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    전체 랭킹
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    스터디 참여와 완료에 따른 점수 기준 순위입니다.
                </p>
            </div>

            <div className="divide-y divide-gray-200">
                {rankingData.map((user) => (
                    <div
                        key={user.id}
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleUserClick(user)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`w-10 h-10 ${getRankBadgeColor(
                                        user.rank
                                    )} rounded-full flex items-center justify-center text-white font-bold`}
                                >
                                    {user.rank <= 3
                                        ? getRankIcon(user.rank)
                                        : user.rank}
                                </div>
                                <img
                                    src={user.profileImage}
                                    alt={user.nickname}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {user.nickname}
                                    </h3>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                    {user.score.toLocaleString()}점
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* 내 랭킹 정보 추가 */}
                <div
                    className="p-6 bg-blue-50 border-t-2 border-blue-200 shadow-inner cursor-pointer"
                    onClick={() => handleUserClick(currentUser)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div
                                className={`w-10 h-10 ${getRankBadgeColor(
                                    currentUser.rank
                                )} rounded-full flex items-center justify-center text-white font-bold`}
                            >
                                {currentUser.rank <= 3
                                    ? getRankIcon(currentUser.rank)
                                    : currentUser.rank}
                            </div>
                            <img
                                src={currentUser.profileImage}
                                alt={currentUser.nickname}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {currentUser.nickname} (나)
                                </h3>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">
                                {currentUser.score.toLocaleString()}점
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // 사용자 정보 모달 컴포넌트
    const UserInfoModal = () => {
        if (!isModalOpen || !selectedUser) return null;

        return (
            <div
                className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-[200] p-4"
                onClick={() => setIsModalOpen(false)}
            >
                <div
                    className="relative bg-white p-8 rounded-lg shadow-xl m-4 max-w-lg w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                        onClick={() => setIsModalOpen(false)}
                    >
                        X
                    </button>
                    <h3 className="text-2xl font-bold mb-4">
                        {selectedUser.nickname}님의 랭킹 정보
                    </h3>

                    <div className="flex items-center space-x-4 mb-6">
                        <img
                            src={selectedUser.profileImage}
                            alt="프로필"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                            <div className="text-xl font-semibold text-gray-900">
                                {selectedUser.nickname}
                            </div>
                            <div className="text-sm text-gray-600">
                                {selectedUser.email}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                🏆
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                현재 순위
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                                {selectedUser.rank}위
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-600">
                                ⭐
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                총 점수
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                                {selectedUser.score.toLocaleString()}점
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                📖
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                                참여한 스터디
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                                {selectedUser.studyCount}개
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">
                            관심분야
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedUser.interests.map((interest, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageLayout>
            <ResponsiveContainer>
                {/* 메인 콘텐츠만 렌더링하도록 변경 */}
                <ResponsiveMainContent padding="md">
                    <RankingList />
                </ResponsiveMainContent>
            </ResponsiveContainer>
            {isModalOpen && <UserInfoModal />}
        </PageLayout>
    );
};

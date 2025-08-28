import React, { useState, useEffect, useContext } from "react";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import ResponsiveMainContent from "../components/layout/ResponsiveMainContent";
import { myStudyList } from "../data/myStudyData";
import { AuthContext } from "@/contexts/AuthContext";

// API 응답 타입 정의
interface RankingItem {
    scoreId: number;
    userId: string;
    userScore: number;
    rank: number;
    totalUsers: number;
    lastUpdated: string;
}

interface RankingResponse {
    status: number;
    message: string;
    data: {
        rankings: RankingItem[];
        totalUsers: number;
        rankingCount: number;
        criteria: string;
    };
}

export const Ranking = () => {
    // 상태 관리
    const [rankingData, setRankingData] = useState<RankingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<RankingItem | null>(null);

    // 현재 사용자 정보 (임시 - 실제로는 로그인 정보에서 가져와야 함)
    const auth = useContext(AuthContext);
    const currentUserId = auth?.user?.nickname || null; 
    const currentUserRanking = rankingData.find(
        (user) => user.userId === currentUserId
    );
    // 현재 사용자 랭킹 정보 찾기
    const currentUser = rankingData.find(user => user.userId === currentUserId);

    // API 호출 함수
    const fetchRankingData = async (): Promise<RankingResponse> => {
        try {
            const response = await fetch('http://localhost:8080/api/scores/ranking/top100');
            if (!response.ok) {
                throw new Error('Failed to fetch ranking data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching ranking data:', error);
            throw error;
        }
    };

    // 데이터 로드
    useEffect(() => {
        const loadRankingData = async () => {
            try {
                setLoading(true);
                const response = await fetchRankingData();
                setRankingData(response.data.rankings);
                setTotalUsers(response.data.totalUsers);
                setError(null);
            } catch (err) {
                setError('랭킹 데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadRankingData();
    }, []);

    

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
    const handleUserClick = (user: RankingItem) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // 프로필 이미지 생성 (userId 첫 글자 기반)
    const getProfileImage = (userId: string) => (
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {userId.charAt(0).toUpperCase()}
        </div>
    );

    // 로딩 상태
    if (loading) {
        return (
            <PageLayout>
                <ResponsiveContainer>
                    <ResponsiveMainContent padding="md">
                        <div className="flex justify-center items-center h-64">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <div className="text-gray-500">랭킹 데이터를 불러오는 중...</div>
                            </div>
                        </div>
                    </ResponsiveMainContent>
                </ResponsiveContainer>
            </PageLayout>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <PageLayout>
                <ResponsiveContainer>
                    <ResponsiveMainContent padding="md">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <div className="text-red-500 mr-3">⚠️</div>
                                <div>
                                    <h3 className="text-red-800 font-semibold">오류가 발생했습니다</h3>
                                    <p className="text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                다시 시도
                            </button>
                        </div>
                    </ResponsiveMainContent>
                </ResponsiveContainer>
            </PageLayout>
        );
    }

    // 랭킹 리스트 컴포넌트
    const RankingList = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    전체 랭킹
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    스터디 참여와 완료에 따른 점수 기준 순위입니다. (총 {totalUsers}명)
                </p>
            </div>

            <div className="divide-y divide-gray-200">
                {rankingData.map((user) => (
                    <div
                        key={user.scoreId}
                        className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                            user.userId === currentUserId ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleUserClick(user)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`w-10 h-10 ${getRankBadgeColor(
                                        user.rank
                                    )} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                                >
                                    {user.rank <= 3
                                        ? getRankIcon(user.rank)
                                        : user.rank}
                                </div>
                                {getProfileImage(user.userId)}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {user.userId}
                                        {user.userId === currentUserId && (
                                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                나
                                            </span>
                                        )}
                                    </h3>
                                    <div className="text-xs text-gray-500">
                                        최근 업데이트: {new Date(user.lastUpdated).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                    {user.userScore.toLocaleString()}점
                                </div>
                                <div className="text-sm text-gray-500">
                                    #{user.rank} / {user.totalUsers}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {rankingData.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <div className="text-4xl mb-4">🏆</div>
                        <div>아직 랭킹 데이터가 없습니다.</div>
                    </div>
                )}

                {currentUserRanking && (
                    <div className="p-6 bg-white">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                            내 랭킹
                        </h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`w-10 h-10 ${getRankBadgeColor(currentUserRanking.rank)} 
                                            rounded-full flex items-center justify-center text-white font-bold text-sm`}
                                >
                                    {currentUserRanking.rank <= 3
                                        ? getRankIcon(currentUserRanking.rank)
                                        : currentUserRanking.rank}
                                </div>
                                {getProfileImage(currentUserRanking.userId)}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {currentUserRanking.userId}
                                    </h3>
                                    <div className="text-xs text-gray-500">
                                        최근 업데이트: {new Date(currentUserRanking.lastUpdated).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">
                                    {currentUserRanking.userScore.toLocaleString()}점
                                </div>
                                <div className="text-sm text-gray-500">
                                    #{currentUserRanking.rank} / {currentUserRanking.totalUsers}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                    className="relative bg-white p-8 rounded-lg shadow-xl m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
                        onClick={() => setIsModalOpen(false)}
                    >
                        ✕
                    </button>
                    
                    <h3 className="text-2xl font-bold mb-4">
                        {selectedUser.userId}님의 랭킹 정보
                    </h3>

                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            {selectedUser.userId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="text-xl font-semibold text-gray-900">
                                {selectedUser.userId}
                                {selectedUser.userId === currentUserId && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                        본인
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-600">
                                Score ID: {selectedUser.scoreId}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
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
                                {selectedUser.userScore.toLocaleString()}점
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="text-sm text-gray-600 mb-2">
                            상세 정보
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">전체 사용자 수:</span>
                                <span className="font-medium">{selectedUser.totalUsers}명</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">최근 업데이트:</span>
                                <span className="font-medium">
                                    {new Date(selectedUser.lastUpdated).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 참여 중인 스터디/프로젝트 리스트 (현재 사용자인 경우만) */}
                    {selectedUser.userId === currentUserId && (
                        <div className="mt-6">
                            <div className="text-sm text-gray-600 mb-3">
                                참여 중인 스터디/프로젝트
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {myStudyList
                                    .filter((study) => study.status === "active")
                                    .slice(0, 3)
                                    .map((study) => (
                                        <div
                                            key={study.id}
                                            className="bg-gray-50 p-3 rounded-lg border"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900 text-sm">
                                                    {study.title}
                                                </h4>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        study.type === "study"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-green-100 text-green-800"
                                                    }`}
                                                >
                                                    {study.type === "study"
                                                        ? "스터디"
                                                        : "프로젝트"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-2">
                                                {study.description}
                                            </p>
                                        </div>
                                    ))}
                                {myStudyList.filter(
                                    (study) => study.status === "active"
                                ).length === 0 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        참여 중인 스터디/프로젝트가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <PageLayout>
            <ResponsiveContainer>
                <ResponsiveMainContent padding="md">
                    <RankingList />
                </ResponsiveMainContent>
            </ResponsiveContainer>
            {isModalOpen && <UserInfoModal />}
        </PageLayout>
    );
};
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { myStudyList, MyStudyData } from "../../data/myStudyData";

interface MyStudyListProps {
    userNickname: string;
}

export const MyStudyList: React.FC<MyStudyListProps> = ({ userNickname }) => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<
        "all" | "active" | "completed" | "recruiting"
    >("all");

    // 필터링된 스터디 목록
    const getFilteredStudies = () => {
        switch (activeFilter) {
            case "active":
                return myStudyList.filter((study) => study.status === "active");
            case "completed":
                return myStudyList.filter(
                    (study) => study.status === "completed"
                );
            case "recruiting":
                return myStudyList.filter(
                    (study) => study.status === "recruiting"
                );
            default:
                return myStudyList;
        }
    };

    const userStudies = getFilteredStudies();

    const handleStudyClick = (study: MyStudyData) => {
        navigate(`/study/${study.id}`, {
            state: {
                title: study.title,
                description: study.description,
                leader: study.leader,
                period: `${study.startDate}~${study.endDate}`,
                tags: study.tags,
                type: study.type,
                status: study.status,
                role: study.role,
            },
        });
    };

    const getStatusBadge = (status: string, role: string) => {
        const statusConfig = {
            active: {
                bg: "bg-green-50",
                text: "text-green-700",
                label: "진행중",
            },
            completed: {
                bg: "bg-gray-50",
                text: "text-gray-700",
                label: "완료",
            },
            recruiting: {
                bg: "bg-blue-50",
                text: "text-blue-700",
                label: "모집중",
            },
        };

        const roleConfig = {
            leader: {
                bg: "bg-purple-50",
                text: "text-purple-700",
                label: "리더",
            },
            member: {
                bg: "bg-orange-50",
                text: "text-orange-700",
                label: "멤버",
            },
        };

        return {
            status: statusConfig[status as keyof typeof statusConfig],
            role: roleConfig[role as keyof typeof roleConfig],
        };
    };

    if (userStudies.length === 0) {
        return (
            <div className="space-y-6 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold">
                        스터디/프로젝트
                    </h2>

                    {/* 필터 버튼들 */}
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { key: "all", label: "전체" },
                            { key: "active", label: "진행중" },
                            { key: "completed", label: "완료" },
                            { key: "recruiting", label: "모집중" },
                        ].map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() =>
                                    setActiveFilter(filter.key as any)
                                }
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    activeFilter === filter.key
                                        ? "bg-[#8B85E9] text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg
                                className="w-16 h-16 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {activeFilter === "all"
                                ? "참여한 스터디가 없습니다"
                                : activeFilter === "active"
                                ? "진행중인 스터디가 없습니다"
                                : activeFilter === "completed"
                                ? "완료된 스터디가 없습니다"
                                : "모집중인 스터디가 없습니다"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            새로운 스터디에 참여해보세요!
                        </p>
                        <button
                            onClick={() => navigate("/study/create")}
                            className="px-6 py-3 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200 font-medium"
                        >
                            스터디 생성하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                    스터디/프로젝트
                </h2>
                <button
                    onClick={() => navigate("/study/create")}
                    className="px-6 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200 font-medium"
                >
                    생성
                </button>
            </div>
            {/* 필터 버튼들 */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: "all", label: "전체" },
                    { key: "applied", label: "승인 대기" },
                    { key: "participating", label: "참여 중" },
                    { key: "end", label: "스터디 종료" },
                ].map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key as any)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            activeFilter === filter.key
                                ? "bg-[#8B85E9] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
            <div className="space-y-4">
                {userStudies.map((study) => {
                    const badges = getStatusBadge(study.status, study.role);
                    return (
                        <div
                            key={study.id}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                            onClick={() => handleStudyClick(study)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {study.title}
                                        </h3>

                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                study.type === "study"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-green-50 text-green-700"
                                            }`}
                                        >
                                            {study.type === "study"
                                                ? "스터디"
                                                : "프로젝트"}
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${badges.status.bg} ${badges.status.text}`}
                                        >
                                            {badges.status.label}
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${badges.role.bg} ${badges.role.text}`}
                                        >
                                            {badges.role.label}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                        {study.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                                        <span>리더: {study.leader}</span>
                                        <span>
                                            기간: {study.startDate} ~{" "}
                                            {study.endDate}
                                        </span>
                                        <span>
                                            인원: {study.currentMembers}/
                                            {study.maxMembers}
                                        </span>
                                    </div>

                                    {study.meetingDays && study.meetingTime && (
                                        <div className="text-sm text-gray-500 mb-3">
                                            <span>
                                                모임:{" "}
                                                {study.meetingDays.join(", ")}{" "}
                                                {study.meetingTime}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex gap-2 flex-wrap">
                                        {study.tags.map(
                                            (tag: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs"
                                                >
                                                    #{tag}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

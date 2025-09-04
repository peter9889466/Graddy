import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    getUserStudyProjects,
    StudyProjectListItem,
} from "../../services/userService";

interface MyStudyListProps {
    userNickname: string;
}

interface Member {
    memberId: number;
    userId: string;
    nick: string;
    memberType: "leader" | "member";
    memberStatus: "approved" | "pending" | "rejected";
    joinedAt: string;
}

interface StudyProject {
    studyProjectId: number;
    studyProjectName: string;
    studyProjectTitle: string;
    studyProjectDesc: string;
    studyLevel: number;
    typeCheck: "STUDY" | "PROJECT";
    userId: string;
    isRecruiting: "RECRUITING" | "COMPLETE" | "END";
    studyProjectStart: string;
    studyProjectEnd: string;
    studyProjectTotal: number;
    currentMembers: number;
    tagNames: string[];
    members: Member[];
}

export const MyStudyList: React.FC<MyStudyListProps> = ({ userNickname }) => {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<
        "ALL" | "RECRUITING" | "COMPLETE" | "END"
    >("ALL");
    const [studyList, setStudyList] = useState<StudyProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 스터디 목록 조회
    useEffect(() => {
        const fetchStudyList = async () => {
            try {
                setIsLoading(true);
                const response = await getUserStudyProjects(activeFilter);
                const mappedList: StudyProject[] = response.map((item: any) => ({
                    ...item,
                    currentMembers: item.currentMembers ?? (item.members ? item.members.length : 0),
                    tagNames: item.tagNames ?? [],
                }));
                setStudyList(mappedList);
            } catch (error) {
                console.error("스터디 목록 조회 실패:", error);
                setStudyList([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudyList();
    }, [activeFilter]);

    const handleStudyClick = (study: StudyProject) => {
        navigate(`/study/${study.studyProjectId}`, {
            state: {
                title: study.studyProjectTitle,
                description: study.studyProjectDesc,
                leader: study.userId,
                period: `${study.studyProjectStart.split("T")[0]} ~ ${
                    study.studyProjectEnd.split("T")[0]
                }`,
                tags: study.tagNames,
                type: study.typeCheck,
                status: study.isRecruiting,
            },
        });
    };

    // API 응답의 isRecruiting 값을 한국어로 매핑
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "recruitment":
                return "모집중";
            case "complete":
                return "모집완료";
            case "end":
                return "종료";
            default:
                return status;
        }
    };

    // API 응답의 typeCheck 값을 한국어로 매핑
    const getTypeLabel = (type: string) => {
        return type === "study" ? "스터디" : "프로젝트";
    };

    // 리더의 닉네임 추출
    const getLeaderNickname = (study: StudyProject) => {
        if (study.members && study.members.length > 0) {
            const leader = study.members.find(
                (member) => member.memberType === "leader"
            );
            if (leader && leader.nick && leader.nick.trim() !== "") {
                return leader.nick;
            }
        }
        // 닉네임이 없거나 비어있으면 userId 반환
        return study.userId;
    };

    if (studyList.length === 0 && !isLoading) {
        return (
            <div className="space-y-6 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold">
                        스터디/프로젝트
                    </h2>

                    {/* 필터 버튼들 */}
                    <div className="flex gap-2 flex-wrap">
                        {[
                            { key: "ALL", label: "전체" },
                            { key: "RECRUITING", label: "모집중" },
                            { key: "COMPLETE", label: "진행중" },
                            { key: "END", label: "완료" },
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
                            {activeFilter === "ALL"
                                ? "참여한 스터디가 없습니다"
                                : activeFilter === "RECRUITING"
                                ? "모집중인 스터디가 없습니다"
                                : activeFilter === "COMPLETE"
                                ? "진행중인 스터디가 없습니다"
                                : "완료된 스터디가 없습니다"}
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
                    { key: "ALL", label: "전체" },
                    { key: "RECRUITING", label: "모집중" },
                    { key: "COMPLETE", label: "진행중" },
                    { key: "END", label: "완료" },
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

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85E9]"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {studyList.map((study) => (
                        <div
                            key={study.studyProjectId}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                            onClick={() => handleStudyClick(study)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {study.studyProjectTitle}
                                        </h3>

                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                study.typeCheck === "STUDY"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-green-50 text-green-700"
                                            }`}
                                        >
                                            {getTypeLabel(study.typeCheck)}
                                        </span>

                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                study.isRecruiting ===
                                                "RECRUITING"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : study.isRecruiting ===
                                                      "COMPLETE"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-50 text-gray-700"
                                            }`}
                                        >
                                            {getStatusLabel(study.isRecruiting)}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                        {study.studyProjectDesc}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                                        <span>리더: {getLeaderNickname(study)}</span>
                                        <span>
                                            기간:{" "}
                                            {
                                                study.studyProjectStart.split(
                                                    "T"
                                                )[0]
                                            }{" "}
                                            ~{" "}
                                            {
                                                study.studyProjectEnd.split(
                                                    "T"
                                                )[0]
                                            }
                                        </span>
                                        <span>
                                            인원: {study.currentMembers}/
                                            {study.studyProjectTotal}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        {(study.tagNames || []).map(
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
                    ))}
                </div>
            )}
        </div>
    );
};

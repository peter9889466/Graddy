import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import PageLayout from "../components/layout/PageLayout";
import BannerCarousel from "./BannerCarousel";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Plus, Clock, Calendar } from "lucide-react";
import "./MainPage.css";

const MainPage = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    // authContext가 null인 경우를 대비한 안전 장치
    if (!authContext) {
        throw new Error(
            "MainPage 컴포넌트는 AuthProvider 내에서 사용되어야 합니다."
        );
    }

    const { isLoggedIn, token } = authContext;

    const handleJoinClick = () => {
        navigate("/search");
    };

    // 선택된 날짜 상태
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // 편집 중인 일정 상태
    const [editingSchedule, setEditingSchedule] = useState<string | null>(null);

    // 스터디 일정 및 과제 데이터 상태
    const [studySchedules, setStudySchedules] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);

    // 개인 일정 데이터
    const [personalSchedules, setPersonalSchedules] = useState([
        {
            id: "p1",
            title: "개인 공부",
            startTime: "14:00",
            date: "2025-08-21",
        },
        {
            id: "p2",
            title: "운동",
            startTime: "07:00",
            date: "2025-08-22",
        },
        {
            id: "p3",
            title: "독서",
            startTime: "20:00",
            date: "2025-08-21",
        },
        {
            id: "p4",
            title: "영화 감상",
            startTime: "21:00",
            date: "2025-08-21",
        },
        {
            id: "p5",
            title: "쇼핑",
            startTime: "10:00",
            date: "2025-08-22",
        },
    ]);

    // 캘린더 이벤트 데이터 (표시용)
    const events = [
        // 스터디 일정
        ...studySchedules.map((schedule) => ({
            id: `study-${schedule.schId}`,
            title: "",
            date: new Date(schedule.schTime).toISOString().split("T")[0],
            backgroundColor: "#EF4444", // 스터디: 빨간색
            borderColor: "#EF4444",
            extendedProps: {
                type: "study",
                studyName: schedule.studyProjectName || "스터디",
                content: schedule.content,
                startTime: new Date(schedule.schTime).toLocaleTimeString(
                    "ko-KR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }
                ),
            },
        })),
        // 과제 일정
        ...assignments.map((assignment) => ({
            id: `assignment-${assignment.assignmentId}`,
            title: "",
            date: new Date(assignment.deadline).toISOString().split("T")[0],
            backgroundColor: "#3B82F6", // 과제: 파란색
            borderColor: "#3B82F6",
            extendedProps: {
                type: "assignment",
                studyName: "스터디", // 스터디명은 별도 조회 필요
                assignmentName: assignment.title,
                dueTime: new Date(assignment.deadline).toLocaleTimeString(
                    "ko-KR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }
                ),
            },
        })),
        // 개인 일정
        ...personalSchedules.map((schedule) => ({
            id: `personal-${schedule.id}`,
            title: "",
            date: schedule.date,
            backgroundColor: "#8B5CF6", // 개인일정: 보라색
            borderColor: "#8B5CF6",
            extendedProps: {
                type: "personal",
                title: schedule.title,
                startTime: schedule.startTime,
            },
        })),
    ];

    // 추천 스터디 데이터 상태 - 백엔드 DTO 구조에 맞게 타입 정의
    interface RecommendedStudy {
        studyProjectId: number;
        studyProjectName: string;
        studyProjectTitle: string;
        studyProjectDesc: string;
        studyLevel: number;
        typeCheck: string;
        userId: string;
        isRecruiting: string;
        studyProjectStart: string;
        studyProjectEnd: string;
        studyProjectTotal: number;
        tags: string[];
        currentMemberCount: number;
        finalScore: number;
    }

    const [recommendedStudies, setRecommendedStudies] = useState<
        RecommendedStudy[]
    >([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [recommendationError, setRecommendationError] = useState<
        string | null
    >(null);

    // 추천 스터디 API 호출 - 백엔드 서버 연결 확인 및 에러 처리 개선
    const fetchRecommendedStudies = async () => {
        if (!isLoggedIn || !token) {
            console.warn("로그인되지 않았거나 토큰이 없습니다.");
            return;
        }

        setLoadingRecommendations(true);
        setRecommendationError(null);

        try {
            console.log("추천 스터디 API 호출 시작");

            // 백엔드 서버 연결 확인
            const response = await fetch(
                "http://localhost:8080/api/recommendation/studies?limit=3",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("응답 상태:", response.status);

            if (!response.ok) {
                if (response.status === 0 || !response.status) {
                    throw new Error(
                        "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요."
                    );
                }

                const errorText = await response.text();
                console.error("API 에러 응답:", errorText);
                throw new Error(
                    `서버 오류 (${response.status}): ${
                        errorText || "알 수 없는 오류"
                    }`
                );
            }

            const data = await response.json();
            console.log("추천 스터디 API 응답:", data);

            // 백엔드 ApiResponse 구조에 맞게 처리
            if (data.status == 200 && data.data && Array.isArray(data.data)) {
                console.log("추천 스터디 데이터 설정:", data.data);
                setRecommendedStudies(data.data);
            } else {
                console.warn("API 응답 구조가 예상과 다름:", data);
                throw new Error(
                    data.message || "추천 스터디를 불러오는데 실패했습니다."
                );
            }
        } catch (error) {
            console.error("추천 스터디 조회 실패:", error);

            let errorMessage = "추천 스터디를 불러오는데 실패했습니다.";

            if (
                error instanceof TypeError &&
                error.message === "Failed to fetch"
            ) {
                errorMessage =
                    "백엔드 서버에 연결할 수 없습니다. 서버가 http://localhost:8080에서 실행 중인지 확인해주세요.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            setRecommendationError(errorMessage);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    // 스터디 일정 조회 API
    const fetchStudySchedules = async () => {
        if (!isLoggedIn || !token) return;

        setLoadingSchedules(true);
        try {
            console.log("스터디 일정 조회 시작");

            const response = await fetch(
                "http://localhost:8080/api/schedules/my/study",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log("스터디 일정 응답:", data);
                setStudySchedules(data || []);
            } else {
                console.error("스터디 일정 조회 실패:", response.status);
            }
        } catch (error) {
            console.error("스터디 일정 조회 에러:", error);
        } finally {
            setLoadingSchedules(false);
        }
    };

    // 과제 조회 API (사용자가 참여한 모든 스터디의 과제)
    const fetchAssignments = async () => {
        if (!isLoggedIn || !token) return;

        try {
            console.log("과제 조회 시작");

            // 먼저 사용자가 참여한 스터디 목록을 가져와야 함
            // 여기서는 임시로 빈 배열로 설정
            setAssignments([]);
        } catch (error) {
            console.error("과제 조회 에러:", error);
        }
    };

    // 개인 일정 조회 API
    const fetchPersonalSchedules = async () => {
        if (!isLoggedIn || !token) return;

        try {
            console.log("개인 일정 조회 시작");

            const response = await fetch(
                "http://localhost:8080/api/schedules/my",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log("전체 일정 응답:", data);

                // 개인 일정만 필터링
                const personalData = data.filter(
                    (schedule: any) => schedule.scheduleType === "personal"
                );

                // 백엔드 데이터를 프론트엔드 형식으로 변환
                const convertedPersonalSchedules = personalData.map(
                    (schedule: any) => ({
                        id: schedule.schId.toString(),
                        title: schedule.content,
                        startTime: new Date(
                            schedule.schTime
                        ).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }),
                        date: new Date(schedule.schTime)
                            .toISOString()
                            .split("T")[0],
                    })
                );

                setPersonalSchedules(convertedPersonalSchedules);
            } else {
                console.error("개인 일정 조회 실패:", response.status);
            }
        } catch (error) {
            console.error("개인 일정 조회 에러:", error);
        }
    };

    // 로그인 상태와 토큰이 변경될 때 데이터 조회
    useEffect(() => {
        if (isLoggedIn && token) {
            fetchRecommendedStudies();
            fetchStudySchedules();
            fetchAssignments();
            fetchPersonalSchedules();
        }
    }, [isLoggedIn, token]);

    // 날짜 클릭 핸들러
    const handleDateClick = (dateInfo: any) => {
        setSelectedDate(dateInfo.dateStr);
    };

    // 선택된 날짜의 일정 가져오기
    const getSchedulesForDate = (date: string) => {
        // 스터디 일정
        const studyItems = studySchedules
            .filter(
                (schedule) =>
                    new Date(schedule.schTime).toISOString().split("T")[0] ===
                    date
            )
            .map((schedule) => ({
                id: `study-${schedule.schId}`,
                type: "study",
                studyName: schedule.studyProjectName || "스터디",
                content: schedule.content,
                startTime: new Date(schedule.schTime).toLocaleTimeString(
                    "ko-KR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }
                ),
            }));

        // 과제 일정
        const assignmentItems = assignments
            .filter(
                (assignment) =>
                    new Date(assignment.deadline)
                        .toISOString()
                        .split("T")[0] === date
            )
            .map((assignment) => ({
                id: `assignment-${assignment.assignmentId}`,
                type: "assignment",
                studyName: "스터디", // 스터디명은 별도 조회 필요
                assignmentName: assignment.title,
                dueTime: new Date(assignment.deadline).toLocaleTimeString(
                    "ko-KR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }
                ),
            }));

        // 개인 일정
        const personalItems = personalSchedules.filter(
            (schedule) => schedule.date === date
        );

        // 스터디 일정과 과제 일정을 합쳐서 반환
        const allStudyItems = [...studyItems, ...assignmentItems];

        return { studyItems: allStudyItems, personalItems };
    };

    // 개인 일정 추가 API
    const addPersonalSchedule = async () => {
        if (!selectedDate || !isLoggedIn || !token) return;

        try {
            const scheduleDateTime = new Date(`${selectedDate}T09:00:00`);

            const response = await fetch(
                "http://localhost:8080/api/schedules/personal",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: "새 일정",
                        schTime: scheduleDateTime.toISOString(),
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log("개인 일정 생성 성공:", data);

                // 새로 생성된 일정을 로컬 상태에 추가
                const newSchedule = {
                    id: data.schId.toString(),
                    title: data.content,
                    startTime: new Date(data.schTime).toLocaleTimeString(
                        "ko-KR",
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }
                    ),
                    date: selectedDate,
                };

                setPersonalSchedules((prev) => [...prev, newSchedule]);
            } else {
                console.error("개인 일정 생성 실패:", response.status);
                alert("일정 추가에 실패했습니다.");
            }
        } catch (error) {
            console.error("개인 일정 생성 에러:", error);
            alert("일정 추가 중 오류가 발생했습니다.");
        }
    };

    // 개인 일정 삭제 API
    const deletePersonalSchedule = async (id: string) => {
        if (!isLoggedIn || !token) return;

        try {
            const response = await fetch(
                `http://localhost:8080/api/schedules/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                console.log("개인 일정 삭제 성공");
                setPersonalSchedules((prev) =>
                    prev.filter((schedule) => schedule.id !== id)
                );
            } else {
                console.error("개인 일정 삭제 실패:", response.status);
                alert("일정 삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("개인 일정 삭제 에러:", error);
            alert("일정 삭제 중 오류가 발생했습니다.");
        }
    };

    // 개인 일정 수정 API
    const updatePersonalSchedule = async (
        id: string,
        title: string,
        startTime: string
    ) => {
        if (!isLoggedIn || !token) return;

        try {
            // 현재 일정의 날짜를 찾아서 새로운 시간과 결합
            const currentSchedule = personalSchedules.find((s) => s.id === id);
            if (!currentSchedule) return;

            const scheduleDateTime = new Date(
                `${currentSchedule.date}T${startTime}:00`
            );

            const response = await fetch(
                `http://localhostapi/schedules/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: title,
                        schTime: scheduleDateTime.toISOString(),
                    }),
                }
            );

            if (response.ok) {
                console.log("개인 일정 수정 성공");
                setPersonalSchedules((prev) =>
                    prev.map((schedule) =>
                        schedule.id === id
                            ? { ...schedule, title, startTime }
                            : schedule
                    )
                );
            } else {
                console.error("개인 일정 수정 실패:", response.status);
                alert("일정 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("개인 일정 수정 에러:", error);
            alert("일정 수정 중 오류가 발생했습니다.");
        }
    };

    return (
        <PageLayout>
            {isLoggedIn ? (
                // ========== 로그인 시 보이는 메인페이지 영역 ==========
                <div className="max-w-7xl mx-auto p-6 space-y-8">
                    {/* 캘린더와 스터디 일정 섹션 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 캘린더 */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                weekends={true}
                                events={events}
                                dateClick={handleDateClick}
                                height="auto"
                                headerToolbar={{
                                    left: "title",
                                    right: "prev next",
                                }}
                                eventDisplay="block"
                                dayMaxEvents={3}
                                moreLinkText={(count) => `+${count}`}
                                eventTextColor="white"
                                dayCellClassNames="hover:bg-gray-50 cursor-pointer"
                                eventClassNames="pointer-events-none"
                            />
                        </div>

                        {/* 스터디 일정 카드 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-[#8B85E9]" />
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedDate
                                        ? `${selectedDate} 일정`
                                        : "날짜를 선택해주세요"}
                                </h3>
                            </div>

                            {selectedDate ? (
                                <div className="space-y-4 max-h-146 overflow-y-auto schedule-list">
                                    {(() => {
                                        const { studyItems, personalItems } =
                                            getSchedulesForDate(selectedDate);

                                        return (
                                            <>
                                                {/* 스터디 일정 */}
                                                {studyItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className={`schedule-card border-l-4 p-3 rounded-r-lg ${
                                                            item.type ===
                                                            "assignment"
                                                                ? "border-blue-500 bg-blue-50"
                                                                : "border-red-500 bg-red-50"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`font-medium mb-1 ${
                                                                item.type ===
                                                                "assignment"
                                                                    ? "text-blue-600"
                                                                    : "text-red-600"
                                                            }`}
                                                        >
                                                            {item.studyName}
                                                        </div>
                                                        {item.type ===
                                                        "assignment" ? (
                                                            <>
                                                                <div className="text-sm text-gray-700 mb-1">
                                                                    과제:{" "}
                                                                    {
                                                                        item.assignmentName
                                                                    }
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <Clock className="w-3 h-3" />
                                                                    제출 마감:{" "}
                                                                    {
                                                                        item.dueTime
                                                                    }
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-sm text-gray-700 mb-1">
                                                                    {
                                                                        item.content
                                                                    }
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <Clock className="w-3 h-3" />
                                                                    시작:{" "}
                                                                    {
                                                                        item.startTime
                                                                    }
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* 개인 일정 */}
                                                {personalItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="schedule-card border-l-4 border-purple-500 bg-purple-50 p-3 rounded-r-lg"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                {editingSchedule ===
                                                                item.id ? (
                                                                    <div className="space-y-2">
                                                                        <input
                                                                            type="text"
                                                                            defaultValue={
                                                                                item.title
                                                                            }
                                                                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-purple-500"
                                                                            onBlur={(
                                                                                e
                                                                            ) => {
                                                                                updatePersonalSchedule(
                                                                                    item.id,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                    item.startTime
                                                                                );
                                                                                setEditingSchedule(
                                                                                    null
                                                                                );
                                                                            }}
                                                                            onKeyDown={(
                                                                                e
                                                                            ) => {
                                                                                if (
                                                                                    e.key ===
                                                                                    "Enter"
                                                                                ) {
                                                                                    updatePersonalSchedule(
                                                                                        item.id,
                                                                                        e
                                                                                            .currentTarget
                                                                                            .value,
                                                                                        item.startTime
                                                                                    );
                                                                                    setEditingSchedule(
                                                                                        null
                                                                                    );
                                                                                }
                                                                            }}
                                                                            autoFocus
                                                                        />
                                                                        <input
                                                                            type="time"
                                                                            defaultValue={
                                                                                item.startTime
                                                                            }
                                                                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-purple-500"
                                                                            onBlur={(
                                                                                e
                                                                            ) => {
                                                                                updatePersonalSchedule(
                                                                                    item.id,
                                                                                    item.title,
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                );
                                                                                setEditingSchedule(
                                                                                    null
                                                                                );
                                                                            }}
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                updatePersonalSchedule(
                                                                                    item.id,
                                                                                    item.title,
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        onClick={() =>
                                                                            setEditingSchedule(
                                                                                item.id
                                                                            )
                                                                        }
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <div className="font-medium text-purple-600 mb-1">
                                                                            {
                                                                                item.title
                                                                            }
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                            <Clock className="w-3 h-3" />
                                                                            시작:{" "}
                                                                            {
                                                                                item.startTime
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-1 ml-2">
                                                                {editingSchedule !==
                                                                    item.id && (
                                                                    <button
                                                                        onClick={() =>
                                                                            setEditingSchedule(
                                                                                item.id
                                                                            )
                                                                        }
                                                                        className="text-blue-500 hover:text-blue-700 text-xs"
                                                                    >
                                                                        수정
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() =>
                                                                        deletePersonalSchedule(
                                                                            item.id
                                                                        )
                                                                    }
                                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* 일정 추가 버튼 */}
                                                <button
                                                    onClick={
                                                        addPersonalSchedule
                                                    }
                                                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:bg-purple-50 transition-colors group"
                                                >
                                                    <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-purple-600">
                                                        <Plus className="w-6 h-6" />
                                                        <span className="text-base font-medium">
                                                            개인 일정 추가
                                                        </span>
                                                    </div>
                                                </button>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>캘린더에서 날짜를 클릭하면</p>
                                    <p>
                                        해당 날짜의 일정을 확인할 수 있습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 추천 스터디 섹션 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3
                            className="text-xl font-bold mb-6"
                            style={{ color: "#8B85E9" }}
                        >
                            추천 스터디
                        </h3>

                        {loadingRecommendations ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85E9]"></div>
                                <span className="ml-2 text-gray-600">
                                    추천 스터디를 불러오는 중...
                                </span>
                            </div>
                        ) : recommendedStudies.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>추천할 스터디가 없습니다.</p>
                                {recommendationError && (
                                    <div className="mt-4">
                                        <p className="text-red-600 mb-2">
                                            API 호출 실패: {recommendationError}
                                        </p>
                                        <button
                                            onClick={fetchRecommendedStudies}
                                            className="px-4 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors"
                                        >
                                            다시 시도
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                {recommendedStudies.map((study, index) => {
                                    // 날짜 포맷팅 함수 - LocalDateTime 형식 처리
                                    const formatDate = (
                                        dateString: string
                                    ): string => {
                                        try {
                                            const date = new Date(dateString);
                                            const year = date.getFullYear();
                                            const month = String(
                                                date.getMonth() + 1
                                            ).padStart(2, "0");
                                            const day = String(
                                                date.getDate()
                                            ).padStart(2, "0");
                                            return `${year}-${month}-${day}`;
                                        } catch (error) {
                                            return dateString;
                                        }
                                    };

                                    // 모집 상태 변환
                                    const getRecruitmentStatus = (
                                        isRecruiting: string
                                    ) => {
                                        switch (isRecruiting) {
                                            case "recruitment":
                                                return "모집중";
                                            case "complete":
                                                return "모집완료";
                                            case "end":
                                                return "종료됨";
                                            default:
                                                return "모집중";
                                        }
                                    };

                                    // 타입 변환
                                    const getTypeLabel = (
                                        typeCheck: string
                                    ) => {
                                        return typeCheck === "study"
                                            ? "스터디"
                                            : "프로젝트";
                                    };

                                    return (
                                        <div
                                            key={study.studyProjectId || index}
                                            className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => {
                                                const isProject =
                                                    study.typeCheck ===
                                                    "project";
                                                const route = isProject
                                                    ? `/project/${study.studyProjectId}`
                                                    : `/study/${study.studyProjectId}`;
                                                navigate(route);
                                            }}
                                        >
                                            <div className="mb-3">
                                                <div className="text-lg font-bold text-gray-800 mb-1">
                                                    {study.studyProjectName}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2">
                                                    {study.studyProjectTitle}
                                                </div>
                                                <div className="text-xs text-gray-500 mb-3">
                                                    기간:{" "}
                                                    {formatDate(
                                                        study.studyProjectStart
                                                    )}{" "}
                                                    ~{" "}
                                                    {formatDate(
                                                        study.studyProjectEnd
                                                    )}{" "}
                                                    / 리더: {study.userId}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 flex-wrap mb-3">
                                                {/* 스터디 레벨 (스터디인 경우만) */}
                                                {study.typeCheck === "study" &&
                                                    study.studyLevel && (
                                                        <span
                                                            className={`px-2 py-0.5 rounded-xl text-xs font-medium ${
                                                                study.studyLevel ===
                                                                1
                                                                    ? "bg-green-100 text-green-700"
                                                                    : study.studyLevel ===
                                                                      2
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                            레벨{" "}
                                                            {study.studyLevel}
                                                        </span>
                                                    )}
                                                {/* 태그 표시 - 백엔드에서 제공하는 tags 배열 사용 */}
                                                {study.tags &&
                                                    Array.isArray(study.tags) &&
                                                    study.tags
                                                        .slice(0, 2)
                                                        .map(
                                                            (
                                                                tag: string,
                                                                tagIndex: number
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        tagIndex
                                                                    }
                                                                    className="px-2 py-0.5 rounded-xl text-xs bg-gray-100 text-gray-600"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            )
                                                        )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    {/* 타입 뱃지 */}
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                            study.typeCheck ===
                                                            "study"
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-orange-50 text-orange-700"
                                                        }`}
                                                    >
                                                        {getTypeLabel(
                                                            study.typeCheck
                                                        )}
                                                    </span>
                                                    {/* 모집 상태 뱃지 */}
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                            study.isRecruiting ===
                                                            "recruitment"
                                                                ? "bg-blue-50 text-blue-700"
                                                                : study.isRecruiting ===
                                                                  "complete"
                                                                ? "bg-purple-50 text-purple-700"
                                                                : "bg-gray-50 text-gray-700"
                                                        }`}
                                                    >
                                                        {getRecruitmentStatus(
                                                            study.isRecruiting
                                                        )}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    (
                                                    {study.currentMemberCount ||
                                                        0}
                                                    /{study.studyProjectTotal}
                                                    명)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // ========== 비로그인 시 보이는 메인페이지 영역 ==========
                <>
                    <section className="flex flex-col items-center text-center bg-white pt-32 pb-12">
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
                            style={{ color: "#8B85E9" }}
                        >
                            Graddy에 오신 것을 환영합니다!
                        </h1>
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl px-4 mb-16">
                            함께 성장하는 스터디 플랫폼에서 새로운 학습 경험을
                            시작해보세요.
                        </p>
                        <button
                            onClick={handleJoinClick}
                            className="bg-[#8B85E9] text-white font-bold py-3 px-8 rounded-full text-lg transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95"
                        >
                            지금 시작하기
                        </button>
                    </section>

                    <section className="bg-white py-16 flex justify-center">
                        <BannerCarousel />
                    </section>
                </>
            )}
        </PageLayout>
    );
};

export default MainPage;

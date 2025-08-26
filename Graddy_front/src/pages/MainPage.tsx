import React, { useState, useContext } from "react";
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

    const { isLoggedIn } = authContext;

    const handleJoinClick = () => {
        navigate("/search");
    };

    // 선택된 날짜 상태
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // 편집 중인 일정 상태
    const [editingSchedule, setEditingSchedule] = useState<string | null>(null);

    // 스터디 일정 데이터 (과제 및 스터디 일정)
    const studySchedules = [
        {
            id: "1",
            type: "assignment", // 과제
            studyName: "React 스터디",
            assignmentName: "컴포넌트 설계 과제",
            dueTime: "23:59",
            date: "2025-08-21",
        },
        {
            id: "2",
            type: "study", // 스터디 일정
            studyName: "알고리즘 스터디",
            startTime: "20:00",
            date: "2025-08-21",
        },
        {
            id: "3",
            type: "assignment",
            studyName: "영어회화 스터디",
            assignmentName: "발표 준비",
            dueTime: "18:00",
            date: "2025-08-22",
        },
        {
            id: "4",
            type: "study",
            studyName: "React 스터디",
            startTime: "19:00",
            date: "2025-08-22",
        },
        {
            id: "5",
            type: "assignment",
            studyName: "Java 스터디",
            assignmentName: "Spring Boot 과제",
            dueTime: "17:00",
            date: "2025-08-21",
        },
        {
            id: "6",
            type: "study",
            studyName: "Python 스터디",
            startTime: "14:00",
            date: "2025-08-21",
        },
        {
            id: "7",
            type: "assignment",
            studyName: "데이터베이스 스터디",
            assignmentName: "SQL 쿼리 과제",
            dueTime: "16:00",
            date: "2025-08-22",
        },
        {
            id: "8",
            type: "study",
            studyName: "웹 개발 스터디",
            startTime: "15:00",
            date: "2025-08-22",
        },
    ];

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
        ...studySchedules.map((schedule) => ({
            id: schedule.id,
            title: "",
            date: schedule.date,
            backgroundColor:
                schedule.type === "assignment" ? "#3B82F6" : "#EF4444", // 과제: 파란색, 스터디: 빨간색
            borderColor: schedule.type === "assignment" ? "#3B82F6" : "#EF4444",
            extendedProps: {
                type: schedule.type,
                studyName: schedule.studyName,
                assignmentName: schedule.assignmentName,
                dueTime: schedule.dueTime,
                startTime: schedule.startTime,
            },
        })),
        ...personalSchedules.map((schedule) => ({
            id: schedule.id,
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

    // 추천 스터디 데이터
    const recommendedStudies = [
        { id: 1, name: "스터디 추천 1" },
        { id: 2, name: "스터디 추천 2" },
        { id: 3, name: "스터디 추천 3" },
    ];

    // 날짜 클릭 핸들러
    const handleDateClick = (dateInfo: any) => {
        setSelectedDate(dateInfo.dateStr);
    };

    // 선택된 날짜의 일정 가져오기
    const getSchedulesForDate = (date: string) => {
        const studyItems = studySchedules.filter(
            (schedule) => schedule.date === date
        );
        const personalItems = personalSchedules.filter(
            (schedule) => schedule.date === date
        );
        return { studyItems, personalItems };
    };

    // 개인 일정 추가
    const addPersonalSchedule = () => {
        if (!selectedDate) return;

        const newSchedule = {
            id: `p${Date.now()}`,
            title: "새 일정",
            startTime: "09:00",
            date: selectedDate,
        };

        setPersonalSchedules((prev) => [...prev, newSchedule]);
    };

    // 개인 일정 삭제
    const deletePersonalSchedule = (id: string) => {
        setPersonalSchedules((prev) =>
            prev.filter((schedule) => schedule.id !== id)
        );
    };

    // 개인 일정 수정
    const updatePersonalSchedule = (
        id: string,
        title: string,
        startTime: string
    ) => {
        setPersonalSchedules((prev) =>
            prev.map((schedule) =>
                schedule.id === id
                    ? { ...schedule, title, startTime }
                    : schedule
            )
        );
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
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <Clock className="w-3 h-3" />
                                                                스터디 시작:{" "}
                                                                {item.startTime}
                                                            </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                            {recommendedStudies.map((study) => (
                                <div
                                    key={study.id}
                                    className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="font-medium">
                                        {study.name}
                                    </div>
                                </div>
                            ))}
                        </div>
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

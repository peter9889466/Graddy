import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import React from "react";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import BannerCarousel from "./BannerCarousel"; // 앞에서 만든 캐러셀
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 import
import bannerImage from "../images/Banner.png";
import banner2Image from "../images/Banner2.png"; // 새 이미지 import
import banner3Image from "../images/Banner3.png"; // 새 이미지 import
import "./MainPage.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ScheduleModal from "../components/modal/ScheduleModal";
import { useModal } from "../hooks/useModal";

const banners = [
    {
        id: "banner1",
        title: "함께 성장하는 스터디 플랫폼",
        subtitle: "Graddy",
        description:
            "원하는 스터디를 찾고, 새로운 사람들과 함께 학습하며 성장하세요.",
        image: bannerImage,
    },
    {
        id: "banner2",
        title: "실시간 소통과 피드백",
        subtitle: "온라인 스터디",
        description:
            "화상 회의와 채팅으로 팀원들과 자유롭게 소통하며 목표를 달성하세요.",
        image: banner2Image, // 이미지 변경
    },
    {
        id: "banner3",
        title: "성장하는 당신을 위한",
        subtitle: "다양한 스터디",
        description:
            "코딩, 디자인, 언어 등 다양한 분야의 스터디에 참여해 보세요.",
        image: banner3Image, // 이미지 변경
    },
];

const MainPage = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleJoinClick = () => {
        navigate('/join'); // 회원가입 페이지로 이동
    const authContext = useContext(AuthContext);

    // authContext가 null인 경우를 대비한 안전 장치
    if (!authContext) {
        throw new Error(
            "MainPage 컴포넌트는 AuthProvider 내에서 사용되어야 합니다."
        );
    }

    const { isLoggedIn } = authContext;
    const [visibleBanners, setVisibleBanners] = useState<
        Record<string, boolean>
    >({});

    const bannerRefs = useRef<Array<HTMLDivElement | null>>([]);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleBanners((prev) => ({
                            ...prev,
                            [entry.target.id]: true,
                        }));
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        bannerRefs.current.forEach((ref) => {
            if (ref) {
                observer.observe(ref);
            }
        });

        return () => {
            bannerRefs.current.forEach((ref) => {
                if (ref) {
                    observer.unobserve(ref);
                }
            });
        };
    }, []);

    const scrollToNextBanner = () => {
        if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            const yOffset = rect.bottom + window.scrollY;

            window.scrollTo({ top: yOffset, behavior: "smooth" });
        }
    };
    // 캘린더 이벤트 데이터
    const events = [
        {
            id: "1",
            title: "React 스터디",
            date: "2025-08-20",
            description: "React 기초부터 심화까지 함께 공부하는 스터디입니다.",
            time: "19:00 - 21:00",
            location: "온라인",
        },
        {
            id: "2",
            title: "알고리즘 스터디",
            date: "2025-08-22",
            description: "코딩테스트 대비 알고리즘 문제 풀이 스터디입니다.",
            time: "20:00 - 22:00",
            location: "강남역 스터디카페",
        },
        {
            id: "3",
            title: "영어회화 스터디",
            date: "2025-08-25",
            description: "원어민과 함께하는 영어회화 연습 시간입니다.",
            time: "18:00 - 19:30",
            location: "홍대 카페",
        },
    ];

    // 참여 중인 스터디 일정 데이터
    const myStudySchedules = [
        {
            id: 1,
            studyName: "React 스터디",
            studyInfo: "프론트엔드 개발",
            nextMeeting: "과제 마감시간",
            dueDate: "과제 마감시간",
            studyGoal: "스터디 목표",
            studyTime: "스터디 시간",
        },
        {
            id: 2,
            studyName: "알고리즘 스터디",
            studyInfo: "코딩테스트 대비",
            nextMeeting: "다음 모임",
            dueDate: "2025.08.22",
            studyGoal: "백준 골드",
            studyTime: "주 2회",
        },
        {
            id: 3,
            studyName: "영어회화 스터디",
            studyInfo: "토익스피킹 대비",
            nextMeeting: "다음 모임",
            dueDate: "2025.08.25",
            studyGoal: "레벨 6 달성",
            studyTime: "주 1회",
        },
    ];

    // 추천 스터디 데이터
    const recommendedStudies = [
        { id: 1, name: "스터디 추천 1" },
        { id: 2, name: "스터디 추천 2" },
        { id: 3, name: "스터디 추천 3" },
        { id: 4, name: "스터디 추천 4" },
        { id: 5, name: "스터디 추천 5" },
    ];

    // 모달 상태
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const {
        isOpen: isModalOpen,
        openModal,
        closeModal,
    } = useModal({
        onClose: () => setSelectedEvent(null),
    });

    // 캐러셀 상태
    const [currentSlide, setCurrentSlide] = useState(0);

    // 이벤트 클릭 핸들러
    const handleEventClick = (clickInfo: any) => {
        const eventData = events.find(
            (event) => event.id === clickInfo.event.id
        );
        setSelectedEvent(eventData);
        openModal();
    };

    // 캐러셀 네비게이션
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % myStudySchedules.length);
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) =>
                (prev - 1 + myStudySchedules.length) % myStudySchedules.length
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
                                plugins={[dayGridPlugin]}
                                initialView="dayGridMonth"
                                weekends={true}
                                events={events}
                                eventClick={handleEventClick}
                                height="auto"
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "",
                                }}
                                eventDisplay="block"
                                eventBackgroundColor="#8B85E9"
                                eventBorderColor="#8B85E9"
                                eventTextColor="white"
                                dayCellClassNames="hover:bg-gray-50 cursor-pointer"
                            />
                        </div>

                        {/* 스터디 일정 카드 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3
                                className="text-xl font-bold mb-4"
                                style={{ color: "#8B85E9" }}
                            >
                                스터디 명
                            </h3>
                            <div className="space-y-2 mb-4 text-sm text-gray-600">
                                <div>스터디 정보</div>
                                <div>스터디 기간</div>
                            </div>

                            {/* 캐러셀 */}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={prevSlide}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        style={{ color: "#8B85E9" }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={nextSlide}
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        style={{ color: "#8B85E9" }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                                    {myStudySchedules[currentSlide] && (
                                        <div className="space-y-3">
                                            <div className="font-semibold text-lg">
                                                {
                                                    myStudySchedules[
                                                        currentSlide
                                                    ].studyName
                                                }
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {
                                                    myStudySchedules[
                                                        currentSlide
                                                    ].studyInfo
                                                }
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>일정</span>
                                                    <span>
                                                        {
                                                            myStudySchedules[
                                                                currentSlide
                                                            ].nextMeeting
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>과제 마감시간</span>
                                                    <span>
                                                        {
                                                            myStudySchedules[
                                                                currentSlide
                                                            ].dueDate
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>스터디 목표</span>
                                                    <span>
                                                        {
                                                            myStudySchedules[
                                                                currentSlide
                                                            ].studyGoal
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>스터디 시간</span>
                                                    <span>
                                                        {
                                                            myStudySchedules[
                                                                currentSlide
                                                            ].studyTime
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

                    {/* 이벤트 상세 모달 */}
                    <ScheduleModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        event={selectedEvent}
                    />
                </div>
            ) : (
                // ========== 비로그인 시 보이는 메인페이지 영역 ==========
                <div className="flex flex-col items-center justify-center mx-auto max-w-screen-xl min-h-[calc(100vh-64px)]">
                    {banners.map((banner, index) => (
                        <ResponsiveContainer
                            key={banner.id}
                            variant="default"
                            className={"py-10 sm:py-12 lg:py-16"}
                        >
                            <div
                                ref={(el) => {
                                    bannerRefs.current[index] = el;
                                }}
                                id={banner.id}
                                className={`relative flex flex-col items-center text-center mx-auto transition-opacity duration-1000 transform ${
                                    visibleBanners[banner.id]
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-8"
                                }`}
                            >
                                <div className="max-w-3xl">
                                    <h1
                                        className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                                        style={{ color: "#8B85E9" }}
                                    >
                                        {banner.title} <br />
                                        <span className="text-4xl sm:text-5xl lg:text-7xl">
                                            {banner.subtitle}
                                        </span>
                                    </h1>
                                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-0">
                                        {banner.description}
                                    </p>
                                </div>
                                <div className="mt-4 flex justify-center relative">
                                    <img
                                        src={banner.image}
                                        alt={banner.title}
                                        className="w-full max-w-[800px] lg:max-w-[1000px]"
                                        ref={index === 0 ? imageRef : null}
                                    />
                                    {index === 0 && (
                                        <button
                                            onClick={scrollToNextBanner}
                                            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 p-4 rounded-full bg-white text-gray-600 shadow-md transition-transform duration-300 hover:scale-110 focus:outline-none"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-6 w-6"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </ResponsiveContainer>
                    ))}
                </div>
                // ========== 비로그인 시 보이는 메인페이지 영역 끝 ==========
            )}
            <section className="flex flex-col items-center text-center bg-white pt-32 pb-12">
                <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
                    style={{ color: "#8B85E9" }}
                >
                    Graddy에 오신 것을 환영합니다!
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl px-4 mb-16">
                    함께 성장하는 스터디 플랫폼에서 새로운 학습 경험을 시작해보세요.
                </p>
                <button
                    onClick={handleJoinClick}
                    className="bg-[#8B85E9] text-white font-bold py-3 px-8 rounded-full text-lg transform hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 relative overflow-hidden group text-sm lg:text-base"
                >
                    지금 시작하기
                </button>
            </section>

            <section className="bg-white py-16 flex justify-center">
                <BannerCarousel />
            </section>
        </PageLayout>
    );
};

export default MainPage;

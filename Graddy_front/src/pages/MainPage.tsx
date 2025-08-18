import React, { useState, useEffect, useRef } from "react";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import bannerImage from "../images/Banner.png";
import banner2Image from "../images/Banner2.png"; // 새 이미지 import
import banner3Image from "../images/Banner3.png"; // 새 이미지 import
import './MainPage.css';

const banners = [
    {
        id: 'banner1',
        title: '함께 성장하는 스터디 플랫폼',
        subtitle: 'Graddy',
        description: '원하는 스터디를 찾고, 새로운 사람들과 함께 학습하며 성장하세요.',
        image: bannerImage,
    },
    {
        id: 'banner2',
        title: '실시간 소통과 피드백',
        subtitle: '온라인 스터디',
        description: '화상 회의와 채팅으로 팀원들과 자유롭게 소통하며 목표를 달성하세요.',
        image: banner2Image, // 이미지 변경
    },
    {
        id: 'banner3',
        title: '성장하는 당신을 위한',
        subtitle: '다양한 스터디',
        description: '코딩, 디자인, 언어 등 다양한 분야의 스터디에 참여해 보세요.',
        image: banner3Image, // 이미지 변경
    },
];

const MainPage = () => {
    const [visibleBanners, setVisibleBanners] = useState<Record<string, boolean>>({});
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
            window.scrollTo({ top: yOffset, behavior: 'smooth' });
        }
    };

    return (
        <PageLayout>
            <div className="flex flex-col items-center justify-center mx-auto max-w-screen-xl min-h-[calc(100vh-64px)]">
                {banners.map((banner, index) => (
                    <ResponsiveContainer
                        key={banner.id}
                        variant="default"
                        className={"py-10 sm:py-12 lg:py-16"}
                    >
                        <div
                            ref={(el) => bannerRefs.current[index] = el}
                            id={banner.id}
                            className={`relative flex flex-col items-center text-center mx-auto transition-opacity duration-1000 transform ${visibleBanners[banner.id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                        >
                            <div className="max-w-3xl">
                                <h1
                                    className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                                    style={{ color: "#8B85E9" }}
                                >
                                    {banner.title} <br/> <span className="text-4xl sm:text-5xl lg:text-7xl">{banner.subtitle}</span>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </ResponsiveContainer>
                ))}
            </div>
        </PageLayout>
    );
};

export default MainPage;
import React, { useState } from "react";

import banner1 from "../images/Banner.png";
import banner2 from "../images/Banner2.png";
import banner3 from "../images/Banner3.png";

import { ChevronLeft, ChevronRight } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const banners = [
    {
        id: 1,
        img: banner1,
        title: "함께 성장하는 스터디",
        desc: "원하는 스터디를 찾고, 새로운 사람들과 함께 학습하며 성장하세요.",
    },
    {
        id: 2,
        img: banner2,
        title: "실시간 소통과 피드백",
        desc: "화상 회의와 채팅으로 팀원들과 자유롭게 소통하며 목표를 달성하세요.",
    },
    {
        id: 3,
        img: banner3,
        title: "성장하는 당신을 위한",
        desc: "코딩, 디자인, 언어 등 다양한 분야의 스터디에 참여해 보세요.",
    },
];

const BannerCarousel: React.FC = () => {
    // State to keep track of the current banner ID
    const [current, setCurrent] = useState<number>(1);
    const currentBanner = banners.find((b) => b.id === current);

    // Function to move to the previous banner
    const handlePrev = () => {
        setCurrent((prev) => (prev === 1 ? banners.length : prev - 1));
    };

    // Function to move to the next banner
    const handleNext = () => {
        setCurrent((prev) => (prev === banners.length ? 1 : prev + 1));
    };

    return (
        <PageLayout>
            <section className="py-16">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    {/* Title and Subtitle */}
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#8B85E9]">
                        간편소개
                    </h2>
                    <p className="text-gray-600 mb-10">
                        원하는 주제를 학습하고 싶은 취준생 및 직장인에게 추천해요.
                    </p>

                    {/* Carousel Container */}
                    <div className="relative w-full max-w-5xl mx-auto bg-gray-50 rounded-xl p-8">
                        {/* Banner Content */}
                        <div className="relative">
                            {currentBanner && (
                                <img
                                    src={currentBanner.img}
                                    alt={currentBanner.title}
                                    // 여기서 이미지 크기를 줄이는 max-w-2xl 클래스를 추가했습니다.
                                    className="mx-auto rounded-xl shadow-lg w-full h-auto object-cover max-w-2xl"
                                />
                            )}
                        </div>
                        
                        {/* Navigation Arrows */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-70 text-gray-800 rounded-full shadow-lg transition hover:bg-opacity-90 hover:scale-110"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-70 text-gray-800 rounded-full shadow-lg transition hover:bg-opacity-90 hover:scale-110"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Selected Banner Text */}
                    <div className="mt-6">
                        <h3 className="text-xl sm:text-2xl font-semibold text-[#8B85E9]">{currentBanner?.title}</h3>
                        <p className="text-gray-500 mt-2">{currentBanner?.desc}</p>
                    </div>

                    {/* Dots for navigation */}
                    <div className="flex justify-center space-x-2 mt-8">
                        {banners.map((b) => (
                            <button
                                key={b.id}
                                onClick={() => setCurrent(b.id)}
                                className={`w-3 h-3 rounded-full transition-colors duration-300
                                ${
                                    current === b.id
                                        ? "bg-[#8B85E9] scale-125"
                                        : "bg-gray-300"
                                }`}
                                aria-label={`Go to slide ${b.id}`}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </PageLayout>
    );
};

export default BannerCarousel;
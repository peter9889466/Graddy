import React from "react";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";
import BannerCarousel from "./BannerCarousel"; // 앞에서 만든 캐러셀
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 import

const MainPage = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용

    const handleJoinClick = () => {
        navigate('/join'); // 회원가입 페이지로 이동
    };

    return (
        <PageLayout>
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
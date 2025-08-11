import React from "react";
import PageLayout from "../components/layout/PageLayout";
import ResponsiveContainer from "../components/layout/ResponsiveContainer";

const MainPage = () => {
    return (
        <PageLayout>
            <ResponsiveContainer variant="default">
                <div className="text-center py-12 sm:py-16 lg:py-20">
                    <h1
                        className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6"
                        style={{ color: "#8B85E9" }}
                    >
                        Graddy에 오신 것을 환영합니다!
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        함께 성장하는 스터디 플랫폼에서 새로운 학습 경험을
                        시작해보세요.
                    </p>
                </div>
            </ResponsiveContainer>
        </PageLayout>
    );
};

export default MainPage;

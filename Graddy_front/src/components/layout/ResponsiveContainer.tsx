import React from "react";

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "sidebar" | "card" | "full";
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
    children,
    className = "",
    variant = "default",
}) => {
    const variantClasses = {
        // 기본 컨테이너 (대부분의 페이지용)
        default: "flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8",

        // 사이드바가 있는 레이아웃 (마이페이지 등)
        sidebar: "flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8",

        // 카드 형태의 레이아웃
        card: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",

        // 전체 너비 사용
        full: "w-full",
    };

    return (
        <div className={`${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
};

export default ResponsiveContainer;

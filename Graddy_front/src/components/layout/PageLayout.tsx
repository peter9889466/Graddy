import React from "react";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    padding?: "none" | "sm" | "md" | "lg";
}

const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    className = "",
    maxWidth = "7xl",
    padding = "md",
}) => {
    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        full: "max-w-full",
    };

    const paddingClasses = {
        none: "",
        sm: "px-2 sm:px-4 py-4",
        md: "px-4 sm:px-6 lg:px-8 py-6 sm:py-8",
        lg: "px-6 sm:px-8 lg:px-12 py-8 sm:py-12",
    };

    return (
        <div
            className={`flex-1 ${className}`}
            style={{ backgroundColor: "#FFFBEF" }}
        >
            <div
                className={`max-w-7xl mx-auto ${paddingClasses[padding]} min-h-full`}
            >
                {children}
            </div>
        </div>
    );
};

export default PageLayout;

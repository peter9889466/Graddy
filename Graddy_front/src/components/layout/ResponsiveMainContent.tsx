import React from "react";

interface ResponsiveMainContentProps {
    children: React.ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    borderColor?: string;
}

const ResponsiveMainContent: React.FC<ResponsiveMainContentProps> = ({
    children,
    className = "",
    padding = "md",
    borderColor = "#8B85E9",
}) => {
    const paddingClasses = {
        none: "p-0",
        sm: "p-4 sm:p-6",
        md: "p-6 sm:p-8",
        lg: "p-8 sm:p-10",
    };

    return (
        <div className="flex-1 min-w-0">
            <div
                className={`bg-white rounded-xl shadow-sm border-2 ${paddingClasses[padding]} ${className}`}
                style={{ borderColor }}
            >
                {children}
            </div>
        </div>
    );
};

export default ResponsiveMainContent;

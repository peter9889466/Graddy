import React from "react";

interface ResponsiveSidebarProps {
    children: React.ReactNode;
    className?: string;
    isCollapsible?: boolean;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
    children,
    className = "",
    isCollapsible = true,
}) => {
    return (
        <div
            className={`
            ${
                isCollapsible
                    ? "w-full lg:w-64 lg:flex-shrink-0"
                    : "w-full lg:w-80"
            }
            ${className}
        `}
        >
            <div className="space-y-4">{children}</div>
        </div>
    );
};

export default ResponsiveSidebar;

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import JoinProfile from "@/components/join/joinProfile";

const Join: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div>
        {/* 회원가입 폼 전체 */}
        <JoinProfile navigate={navigate} location={location} />
        </div>
    );
};

export default Join;

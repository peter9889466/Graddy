// 아이디, 비밀번호 찾기 페이지
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Phone, Lock, AlertCircle, Check, ArrowLeft } from "lucide-react";
import AccountCard from "@/components/find/AccountCard"; 

const FindAccount: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <AccountCard />
            </div>
        </div>
    );
};

export default FindAccount;
// 아이디, 비밀번호 찾기 페이지 (수정됨)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountCard from "@/components/find/AccountCard"; 
import ResetPassword from "@/components/find/ResetPassword";

type Step = 'account' | 'resetPassword';

interface UserInfo {
    userId: string;
    phone: string;
}

const FindAccount: React.FC = () => {
    const [currentStep, setCurrentStep] = useState<Step>('account');
    const [userInfo, setUserInfo] = useState<UserInfo>({ userId: '', phone: '' });
    const navigate = useNavigate();

    const handleVerificationSuccess = (userId: string, phone: string) => {
        setUserInfo({ userId, phone });
        setCurrentStep('resetPassword');
    };

    const handleBackToAccount = () => {
        setCurrentStep('account');
        setUserInfo({ userId: '', phone: '' });
    };

    const handlePasswordResetComplete = () => {
        // 비밀번호 변경 완료 후 로그인 페이지로 이동
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {currentStep === 'account' && (
                    <AccountCard onVerificationSuccess={handleVerificationSuccess} />
                )}
                {currentStep === 'resetPassword' && (
                    <ResetPassword 
                        userId={userInfo.userId}
                        phone={userInfo.phone}
                        onBack={handleBackToAccount}
                        onComplete={handlePasswordResetComplete}
                    />
                )}
            </div>
        </div>
    );
};

export default FindAccount;
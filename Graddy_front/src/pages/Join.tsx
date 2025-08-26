import JoinProfile from "@/components/join/JoinProfile";
import JoinInterest from "@/components/join/JoinInterest";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import JoinTime from "@/components/join/JoinTime";

const Join: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 현재 단계 관리 (1=프로필, 2=관심분야)
    const [step, setStep] = useState(1);

    // 이전 단계에서 넘어온 formData 보관
    const [formData, setFormData] = useState<any>(location.state?.formData || {});

    const [interestData, setInterestData] = useState<any>({}); // 관심분야 데이터 추가

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">회원가입</h2>
        
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-6">

            {step === 1 && (
                <JoinProfile
                navigate={navigate}
                location={location}
                onNext={(data: any) => {
                    setFormData(data);   // 입력 데이터 저장
                    setStep(2);          // 2단계(관심사 선택)로 이동
                }}
                />
            )}

            {step === 2 && (
                <JoinInterest
                    navigate={navigate}
                    location={location}
                    formData={formData}  // JoinProfile에서 받은 데이터 전달
                    onPrevious={() => setStep(1)} // 이전 버튼 → 다시 프로필로
                    onNext={(data: any) => {
                        setInterestData(data);
                        setStep(3);
                    }}
                />
            )}

            {step === 3 && (
                <JoinTime
                    navigate={navigate}
                    location={location}
                    formData={formData}
                    interestData={interestData}
                    onPrevious={() => setStep(2)}
                />
            )}
            </div>
        </div>
    );
};


export default Join;

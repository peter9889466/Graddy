// 아이디, 비밀번호 찾기 컴포넌트
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Phone, Lock, AlertCircle, Check, ArrowLeft } from "lucide-react";

const AccountCard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'id' | 'password'>('id');
    
    // 아이디 찾기 상태
    const [idName, setIdName] = useState("");
    const [idPhone, setIdPhone] = useState("");
    
    // 비밀번호 찾기 상태
    const [pwUserId, setPwUserId] = useState("");
    const [pwPhone, setPwPhone] = useState("");
    
    // 비밀번호 찾기 인증 관련 상태
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [verificationTimer, setVerificationTimer] = useState(0);
    
    // 공통 상태
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [hintMessage, setHintMessage] = useState("");
    const [showHint, setShowHint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // 힌트 메시지 애니메이션
    useEffect(() => {
        if (hintMessage) {
            setShowHint(true);
            const timer = setTimeout(() => {
                setShowHint(false);
                setTimeout(() => setHintMessage(""), 300);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [hintMessage]);

    // 인증 타이머 관리
    useEffect(() => {
        if (verificationTimer > 0) {
            const timer = setTimeout(() => {
                setVerificationTimer(verificationTimer - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (verificationTimer === 0 && isVerificationSent) {
            setHintMessage("인증 시간이 만료되었습니다. 다시 시도해주세요.");
            setIsVerificationSent(false);
            setVerificationCode("");
        }
    }, [verificationTimer, isVerificationSent]);

    const clearErrors = () => {
        setErrors({});
    };

    const validatePhone = (phone: string) => {
        return /^[0-9]{10,11}$/.test(phone.replace(/-/g, ''));
    };

    const handleFindId = async () => {
        clearErrors();
        const newErrors: {[key: string]: string} = {};

        if (!idName.trim()) {
            newErrors.idName = "이름을 입력하세요.";
        }

        if (!idPhone.trim()) {
            newErrors.idPhone = "전화번호를 입력하세요.";
        } else if (!validatePhone(idPhone)) {
            newErrors.idPhone = "올바른 전화번호 형식이 아닙니다.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setHintMessage("입력하신 정보를 다시 확인해주세요.");
            return;
        }

        setIsLoading(true);
        
        try {
            const requestData = {
                name: idName.trim(),
                tel: idPhone.trim()
            };
            
            console.log('전송할 데이터:', requestData); // 디버깅용
            
            const response = await fetch('http://localhost:8080/api/find-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();
            console.log('서버 응답:', result); // 디버깅용

            if (result.status === 200) {
                // 성공 시 - 아이디 정보를 포함한 메시지 표시
                setHintMessage(`찾으신 아이디는 "${result.data.userId}" 입니다. 📱`);
            } else {
                // 실패 시 - 서버에서 온 에러 메시지 표시
                console.log('실패 상황 - 상태:', result.status, '메시지:', result.message);
                setHintMessage(result.message || "아이디 찾기에 실패했습니다. 입력하신 정보를 확인해주세요.");
            }
        } catch (error) {
            console.error('아이디 찾기 API 호출 오류:', error);
            setHintMessage("서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendVerification = async () => {
        clearErrors();
        const newErrors: {[key: string]: string} = {};

        if (!pwUserId.trim()) {
            newErrors.pwUserId = "아이디를 입력하세요.";
        }

        if (!pwPhone.trim()) {
            newErrors.pwPhone = "전화번호를 입력하세요.";
        } else if (!validatePhone(pwPhone)) {
            newErrors.pwPhone = "올바른 전화번호 형식이 아닙니다.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setHintMessage("입력하신 정보를 다시 확인해주세요.");
            return;
        }

        setIsLoading(true);
        
        try {
            // 실제 API 호출 로직을 여기에 구현하세요
            await new Promise(resolve => setTimeout(resolve, 2000)); // 임시 로딩
            
            // 성공 시 인증번호 발송 단계로 전환
            setIsVerificationSent(true);
            setVerificationTimer(300); // 5분 타이머
            setHintMessage("인증번호를 발송했습니다. 6자리 숫자를 입력해주세요. 📱");
        } catch (error) {
            setHintMessage("인증번호 발송에 실패했습니다. 입력하신 정보를 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        clearErrors();
        const newErrors: {[key: string]: string} = {};

        if (!verificationCode.trim()) {
            newErrors.verificationCode = "인증번호를 입력하세요.";
        } else if (verificationCode.length !== 6) {
            newErrors.verificationCode = "6자리 인증번호를 입력하세요.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setHintMessage("6자리 인증번호를 정확히 입력해주세요.");
            return;
        }

        setIsLoading(true);
        
        try {
            // 실제 인증번호 확인 API 호출 로직을 여기에 구현하세요
            await new Promise(resolve => setTimeout(resolve, 2000)); // 임시 로딩
            
            setHintMessage("휴대폰으로 임시 비밀번호를 발송했습니다. 📱");
            // 성공 시 초기화
            setIsVerificationSent(false);
            setVerificationCode("");
            setVerificationTimer(0);
        } catch (error) {
            setHintMessage("인증번호가 일치하지 않습니다. 다시 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        // 해당 필드의 에러 제거
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }

        // 상태 업데이트
        switch (field) {
            case 'idName':
                setIdName(value);
                break;
            case 'idPhone':
                setIdPhone(value);
                break;
            case 'pwUserId':
                setPwUserId(value);
                break;
            case 'pwPhone':
                setPwPhone(value);
                break;
            case 'verificationCode':
                setVerificationCode(value.replace(/\D/g, '').slice(0, 6)); // 숫자만, 최대 6자리
                break;
        }
    };

    const handleIdFormKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFindId();
        }
    };

    const handlePasswordFormKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (!isVerificationSent) {
                handleSendVerification();
            } else {
                handleVerifyCode();
            }
        }
    };

    const handleVerificationKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleVerifyCode();
        }
    };

    return (

            <div className="max-w-3xl mx-auto">
                {/* 카드 */}
                <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
                    {/* 헤더 */}
                    <div
                        className="px-6 py-8 text-white"
                        style={{
                            background: `linear-gradient(to right, #8B85E9, #8B85E9)`,
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/login" className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h2 className="text-2xl font-bold">계정 찾기</h2>
                        </div>
                        <p className="opacity-90 text-sm">
                            아이디 또는 비밀번호를 찾아보세요
                        </p>
                    </div>

                    {/* 탭 메뉴 */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('id')}
                            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 ${
                                activeTab === 'id'
                                    ? 'text-[#8B85E9] border-b-2 border-[#8B85E9] bg-purple-50/50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            아이디 찾기
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 ${
                                activeTab === 'password'
                                    ? 'text-[#8B85E9] border-b-2 border-[#8B85E9] bg-purple-50/50'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            비밀번호 찾기
                        </button>
                    </div>

                    {/* 컨텐츠 */}
                    <div className="p-8 space-y-6">
                        {/* 힌트 메시지 */}
                        {hintMessage && (
                            <div
                                className={`transition-all duration-300 ${
                                    showHint
                                        ? "opacity-100 translate-y-0 mb-6"
                                        : "opacity-0 -translate-y-2"
                                }`}
                            >
                                <div
                                    className={`flex items-center gap-2 p-4 rounded-xl border ${
                                        hintMessage.includes("발송") || hintMessage.includes("찾으신 아이디")
                                            ? "bg-emerald-50 border-emerald-200"
                                            : "bg-amber-50 border-amber-200"
                                    }`}
                                >
                                    {hintMessage.includes("발송") || hintMessage.includes("찾으신 아이디") ? (
                                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    )}
                                    <span
                                        className={`text-sm font-medium ${
                                            hintMessage.includes("발송") || hintMessage.includes("찾으신 아이디")
                                                ? "text-emerald-800"
                                                : "text-amber-800"
                                        }`}
                                    >
                                        {hintMessage}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 아이디 찾기 탭 */}
                        {activeTab === 'id' && (
                            <>
                                <div className="text-center mb-6">
                                    <p className="text-sm text-gray-600">
                                        이름과 전화번호를 입력하시면 등록된 아이디를 확인하실 수 있습니다.
                                    </p>
                                </div>

                                {/* 이름 입력 */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-800">이름</h3>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={idName}
                                            onChange={(e) => handleInputChange('idName', e.target.value)}
                                            placeholder="이름을 입력하세요"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.idName
                                                    ? "border-red-300 focus:ring-red-200"
                                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onKeyDown={handleIdFormKeyDown}
                                        />
                                    </div>
                                    {errors.idName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.idName}</p>
                                    )}
                                </div>

                                {/* 전화번호 입력 */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-800">전화번호 </h3>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={idPhone}
                                            onChange={(e) => handleInputChange('idPhone', e.target.value)}
                                            placeholder="전화번호를 입력하세요 (예: 01012345678)"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.idPhone
                                                    ? "border-red-300 focus:ring-red-200"
                                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onKeyDown={handleIdFormKeyDown}
                                        />
                                    </div>
                                    {errors.idPhone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.idPhone}</p>
                                    )}
                                </div>

                                {/* 아이디 찾기 버튼 */}
                                <button
                                    onClick={handleFindId}
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                    style={{
                                        backgroundColor: "#8B85E9",
                                        boxShadow: "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                                    }}
                                    onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#7d75e3")}
                                    onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#8B85E9")}
                                >
                                    {isLoading ? "처리 중..." : "아이디 찾기"}
                                </button>
                            </>
                        )}

                        {/* 비밀번호 찾기 탭 */}
                        {activeTab === 'password' && (
                            <>
                                <div className="text-center mb-6">
                                    <p className="text-sm text-gray-600">
                                        {!isVerificationSent 
                                            ? "아이디와 전화번호를 입력하시면 인증번호를 발송해드립니다."
                                            : "발송된 인증번호를 입력하시면 임시 비밀번호를 발송해드립니다."
                                        }
                                    </p>
                                </div>

                                {/* 아이디 입력 */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-800">아이디</h3>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={pwUserId}
                                            onChange={(e) => handleInputChange('pwUserId', e.target.value)}
                                            placeholder="아이디를 입력하세요"
                                            disabled={isVerificationSent}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.pwUserId
                                                    ? "border-red-300 focus:ring-red-200"
                                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                                            } ${isVerificationSent ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            onKeyDown={handlePasswordFormKeyDown}
                                        />
                                    </div>
                                    {errors.pwUserId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.pwUserId}</p>
                                    )}
                                </div>

                                {/* 전화번호 입력 */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-800">전화번호</h3>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={pwPhone}
                                            onChange={(e) => handleInputChange('pwPhone', e.target.value)}
                                            placeholder="전화번호를 입력하세요 (예: 01012345678)"
                                            disabled={isVerificationSent}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.pwPhone
                                                    ? "border-red-300 focus:ring-red-200"
                                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                                            } ${isVerificationSent ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            onKeyDown={handlePasswordFormKeyDown}
                                        />
                                    </div>
                                    {errors.pwPhone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.pwPhone}</p>
                                    )}
                                </div>

                                {/* 인증번호 입력 (인증번호 발송 후에만 표시) */}
                                {isVerificationSent && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                            <h3 className="text-xl font-bold text-gray-800">인증번호</h3>
                                            {verificationTimer > 0 && (
                                                <span className="text-sm text-red-500 font-medium">
                                                    ({Math.floor(verificationTimer / 60)}:{(verificationTimer % 60).toString().padStart(2, '0')})
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                                                placeholder="인증번호 6자리를 입력하세요"
                                                maxLength={6}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                                    errors.verificationCode
                                                        ? "border-red-300 focus:ring-red-200"
                                                        : "border-gray-200 focus:ring-2 focus:border-transparent"
                                                }`}
                                                onKeyDown={handleVerificationKeyDown}
                                            />
                                        </div>
                                        {errors.verificationCode && (
                                            <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>
                                        )}
                                    </div>
                                )}

                                {/* 버튼 */}
                                {!isVerificationSent ? (
                                    <button
                                        onClick={handleSendVerification}
                                        disabled={isLoading}
                                        className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                        style={{
                                            backgroundColor: "#8B85E9",
                                            boxShadow: "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                                        }}
                                        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#7d75e3")}
                                        onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#8B85E9")}
                                    >
                                        {isLoading ? "처리 중..." : "인증번호 발송"}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleVerifyCode}
                                            disabled={isLoading}
                                            className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                            style={{
                                                backgroundColor: "#8B85E9",
                                                boxShadow: "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                                            }}
                                            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#7d75e3")}
                                            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#8B85E9")}
                                        >
                                            {isLoading ? "처리 중..." : "확인"}
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                setIsVerificationSent(false);
                                                setVerificationCode("");
                                                setVerificationTimer(0);
                                                clearErrors();
                                            }}
                                            className="w-full py-3 px-6 rounded-xl font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                        >
                                            다시 입력하기
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* 하단 링크 */}
                        <div className="pt-4 text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                계정 정보가 기억나셨나요?{" "}
                                <Link to="/login" className="text-[#8B85E9] hover:underline">
                                    로그인
                                </Link>
                            </p>
                        </div>

                        <div className="pt-2 text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                아직 회원이 아니신가요?{" "}
                                <Link to="/join" className="text-[#8B85E9] hover:underline">
                                    회원가입
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

    );
};

export default AccountCard;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Check, X, AlertCircle, User, Lock, Mail, Phone, CheckCircle, Clock } from "lucide-react";
import axios from "axios";

interface JoinProfileProps {
    navigate: any;
    location: any;
    onNext?: (data: any) => void; // onNext prop 추가
}

const JoinProfile: React.FC<JoinProfileProps> = ({ navigate, location, onNext }) => {
// 상태 관리
    const [id, setId] = useState("");
    const [idError, setIdError] = useState(""); // 아이디 중복 에러
    const [idChecked, setIdChecked] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [nicknameError, setNicknameError] = useState("");
    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [phonePrefix, setPhonePrefix] = useState("010");
    const [phoneMiddle, setPhoneMiddle] = useState("");
    const [phoneLast, setPhoneLast] = useState("");
    const [telError, setTelError] = useState(""); // 전화번호 중복 에러
    const [notificationPreference, setNotificationPreference] = useState<"email" | "phone" | "">("");
    const [hintMessage, setHintMessage] = useState<string>("");
    const [showHint, setShowHint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // 컴포넌트 내부에 ref 선언
    const phoneMiddleRef = useRef<HTMLInputElement>(null);
    const phoneLastRef = useRef<HTMLInputElement>(null);
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [verificationTimer, setVerificationTimer] = useState(0);

    // 힌트 메시지 자동 숨김
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

    // 인증 타이머용 useEffect 추가
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (verificationTimer > 0) {
            interval = setInterval(() => {
                setVerificationTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [verificationTimer]);

    // 비밀번호 유효성 검사
    const validatePassword = (pwd: string) => {
        const hasLetter = /[a-zA-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        const validLength = pwd.length >= 8 && pwd.length <= 32;
        const validCombo = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length >= 2;
        
        return validLength && validCombo;
    };

    // 전화번호 유효성 검사
    const validatePhoneNumber = (prefix: string, middle: string, last: string) => {
        const middleValid = /^\d{4}$/.test(middle);
        const lastValid = /^\d{4}$/.test(last);
        return middleValid && lastValid && ["010", "011", "012", "017"].includes(prefix);
    };

    // 아이디 중복 확인
    const onCheckId = async () => {
        if (!id) {
            setIdError("아이디를 입력해주세요.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/api/join/check-userId`, {
                params: { userId: id },
                validateStatus: () => true // HTTP 상태와 상관없이 항상 then으로 처리
            });

            if (response.data.status === 200 && response.data.data.isAvailable) {
                setIdError("");
                setIdChecked(true);
                setHintMessage("사용 가능한 아이디입니다!");
            } else if (response.data.status === 409 && !response.data.data.isAvailable) {
                setIdError("이미 사용 중인 아이디입니다.");
                setIdChecked(false);
            } else {
                setIdError("아이디 중복 확인 중 오류가 발생했습니다.");
                setIdChecked(false);
            }
        } catch (error: any) {
            console.error(error);
            setIdError("아이디 중복 확인 중 오류가 발생했습니다.");
            setIdChecked(false);
        }
    };

    const handleIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 기본 submit 방지
            onCheckId();        // 중복확인 함수 실행
        }
    };

    // 닉네임 중복 확인
    const onCheckNickname = async () => {
        if (!nickname.trim()) {
            setNicknameError("닉네임을 입력해주세요.");
            return;
        }

        try {
            const response = await axios.get("http://localhost:8080/api/join/check-nick", {
                params: { nick: nickname },
                validateStatus: () => true // HTTP 상태와 상관없이 then으로 처리
            });

            if (response.data.status === 200 && response.data.data.isAvailable) {
                setNicknameError("");      // 중복 없음
                setNicknameChecked(true);  // 체크 완료
                setHintMessage("사용 가능한 닉네임입니다!");
            } else if (response.data.status === 409 && !response.data.data.isAvailable) {
                setNicknameError("이미 사용 중인 닉네임입니다.");
                setNicknameChecked(false);
            } else {
                setNicknameError("닉네임 중복 확인 중 오류가 발생했습니다.");
                setNicknameChecked(false);
            }
        } catch (error: any) {
            console.error(error);
            setNicknameError("닉네임 중복 확인 중 오류가 발생했습니다.");
            setNicknameChecked(false);
        }
    };

    const handleNicknameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 기본 submit 방지
            onCheckNickname();  // 닉네임 중복 확인 실행
        }
    };

    // 입력값 변경 시 검증 상태 초기화
    const handleIdChange = (value: string) => {
        setId(value);
        setIdChecked(false);
        if (idError) setIdError("");
    };

    const handleNicknameChange = (value: string) => {
        setNickname(value);
        setNicknameChecked(false);
        if (nicknameError) setNicknameError("");
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (passwordError) setPasswordError("");
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (passwordError) setPasswordError("");
    };

    // 전화번호 핸들러들
    const handlePhoneMiddleChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "").slice(0, 4);
        setPhoneMiddle(numericValue);
        
        // 에러 메시지 초기화
        if (telError) setTelError("");
        
        if (numericValue.length === 4 && phoneLastRef.current) {
            phoneLastRef.current.focus();
        }
    };

    const handlePhoneLastChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "").slice(0, 4);
        setPhoneLast(numericValue);
        
        // 에러 메시지 초기화
        if (telError) setTelError("");
    };

    const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast) && !isVerified) {
                handleSendVerification();
            }
        }
    };

    const handleSendVerification = async () => {
        if (isLoading) return; // 이미 처리 중이면 리턴
    
        if (!validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast)) {
            setHintMessage("올바른 전화번호를 입력해주세요!");
            return;
        }
        
        setIsLoading(true);
        
        const phoneNumber = phonePrefix + phoneMiddle + phoneLast;
        
        try {
            // 전화번호 중복 확인 및 인증번호 발송 (통합)
            const unifiedResponse = await axios.post('http://localhost:8080/api/api/phone-verification/unified', {
                tel: phoneNumber,
                purpose: "JOIN"
            }, {
                validateStatus: () => true
            });

            if (unifiedResponse.data.status === 400) {
                // 중복된 전화번호
                setTelError("이미 사용 중인 전화번호입니다.");
                setHintMessage("이미 사용 중인 전화번호입니다.");
                return;
            } else if (unifiedResponse.data.status === 200 && 
                    unifiedResponse.data.data.phoneAvailable && 
                    unifiedResponse.data.data.smsSent) {
                // 새 전화번호이고 인증번호 발송 완료
                setTelError(""); // 기존 에러 메시지 제거
                setShowVerificationInput(true);
                setVerificationTimer(300); // 5분
                setHintMessage("인증번호가 발송되었습니다!");
            } else {
                // 예상치 못한 응답
                setHintMessage("전화번호 확인 중 오류가 발생했습니다.");
            }
            
        } catch (error: any) {
            console.error('전화번호 검증 오류:', error);
            setHintMessage("처리 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (verificationCode.trim() === "") {
            setHintMessage("인증번호를 입력해주세요!");
            return;
        }
        
        const phoneNumber = phonePrefix + phoneMiddle + phoneLast;
        
        try {
            const response = await axios.post('http://localhost:8080/api/auth/verify-code', {
                phoneNumber: phoneNumber,
                code: verificationCode
            }, {
                validateStatus: () => true // HTTP 상태와 상관없이 항상 then으로 처리
            });

            if (response.data.status === 200) {
                setIsVerified(true);
                setVerificationTimer(0); // 타이머 중지
                setHintMessage("전화번호 인증이 완료되었습니다!");
            } else {
                // 인증 실패
                setHintMessage(response.data.message || "인증번호가 올바르지 않거나 만료되었습니다.");
            }
        } catch (error: any) {
            console.error('인증 코드 확인 오류:', error);
            setHintMessage("인증 확인 중 오류가 발생했습니다.");
        }
    };

    const handleVerificationCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (verificationCode.length === 6) {
                handleVerifyCode();
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 알림 방법 토글
    const toggleNotificationPreference = (type: "email" | "phone") => {
        setNotificationPreference(notificationPreference === type ? "" : type);
    };

    // 회원가입 다음 단계
    const nextPage = () => {
        // 유효성 검사
        if (!id || !password || !confirmPassword || !name || !nickname || !phoneMiddle || !phoneLast) {
            setHintMessage("모든 필수 정보를 입력해주세요!");
            return;
        }

        if (!idChecked) {
            setHintMessage("아이디 중복확인을 해주세요!");
            return;
        }

        if (!nicknameChecked) {
            setHintMessage("닉네임 중복확인을 해주세요!");
            return;
        }

        if (!validatePassword(password)) {
            setPasswordError("비밀번호 조건을 확인해주세요.");
            setHintMessage("비밀번호가 조건에 맞지 않습니다!");
            return;
        }

        if (password !== confirmPassword) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
            setHintMessage("비밀번호 확인이 일치하지 않습니다!");
            return;
        }

        if (!validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast)) {
            setHintMessage("전화번호 형식이 올바르지 않습니다!");
            return;
        }   

        if (!isVerified) {
            setHintMessage("전화번호 인증을 완료해주세요!");
            return;
        }

        // 모든 조건 통과 
        setPasswordError("");
        setHintMessage("회원가입이 완료되었습니다!");
        
        // 모든 조건 통과 후
        const formData = {
            userId: id,
            password: password,
            name: name,
            nick: nickname,
            tel: phonePrefix + phoneMiddle + phoneLast,
            alarmType: notificationPreference === "phone" ? true : false
        };
        
        // onNext 콜백만 사용 (navigate 제거)
        if (onNext) {
            onNext(formData);
        }
        // else 부분 완전 삭제
    };

    const isFormValid = id && password && confirmPassword && name && nickname && phoneMiddle && phoneLast && 
                idChecked && nicknameChecked && validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast) && isVerified;

    // Join2에서 돌아올 때 전달된 formData 가져오기
    // const previousFormData = location.state?.formData;

    const steps = ["프로필 설정", "관심사 선택", "시간대 선택"];

    // Enter 키 핸들러 추가
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isFormValid) {
            e.preventDefault(); // 기본 동작 방지
            nextPage();
        }
    };

    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-8 px-4"
            onKeyDown={handleKeyDown} 
            tabIndex={0} 
        >
            <div className="max-w-3xl mx-auto">

                {/* 진행 단계 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                                idx === 0 
                                ? "bg-indigo-600 text-white shadow-lg" 
                                : "bg-gray-200 text-gray-500"
                            }`}
                            >
                                {idx === 0 ? <Clock className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span className="text-xs mt-2 text-gray-600 text-center max-w-20">{step}</span>
                        </div>
                        ))}
                    </div>
                </div>

                {/* 메인 카드 */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* 헤더 */}
                    <div className="px-6 py-8 text-white" style={{ background: `linear-gradient(to right, #8B85E9, #8B85E9)` }}>
                        <h2 className="text-2xl font-bold mb-2 text-left">개인정보를 입력해주세요</h2>
                        <p className="opacity-90 text-sm text-left">
                            새로운 계정을 만들어 다양한 서비스를 이용해보세요
                        </p>
                    </div>

                    <div className="p-8">
                        {/* 힌트 메시지 */}
                        {hintMessage && (
                            <div className={`mb-6 transition-all duration-300 ${showHint ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                                <div className={`flex items-center gap-2 p-4 rounded-xl border ${
                                    hintMessage.includes('가능') || hintMessage.includes('완료') 
                                        ? 'bg-emerald-50 border-emerald-200' 
                                        : 'bg-amber-50 border-amber-200'
                                }`}>
                                    {hintMessage.includes('가능') || hintMessage.includes('완료') ? (
                                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm font-medium ${
                                        hintMessage.includes('가능') || hintMessage.includes('완료') 
                                            ? 'text-emerald-800' 
                                            : 'text-amber-800'
                                    }`}>
                                        {hintMessage}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* 아이디 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">아이디 *</h3>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={id}
                                        onChange={(e) => handleIdChange(e.target.value)}
                                        onKeyDown={handleIdKeyDown} // 기존 handleKeyDown 대신
                                        placeholder="아이디를 입력하세요"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                        idError ? "border-red-300 focus:ring-red-200" : 
                                        idChecked ? "border-green-300 focus:ring-green-200" : 
                                        "border-gray-200 focus:ring-2 focus:border-transparent"
                                        }`}
                                        onFocus={(e) => !idError && !idChecked && ((e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`)}
                                        onBlur={(e) => !idError && !idChecked && ((e.target as HTMLInputElement).style.boxShadow = 'none')}
                                    />
                                    {idChecked && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                    </div>
                                    <button
                                    onClick={onCheckId}
                                    className="px-4 py-3 text-sm text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                                    style={{ backgroundColor: "#8B85E9" }}
                                    >
                                    중복확인
                                    </button>
                                </div>
                            {idError && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                <X className="w-4 h-4" />
                                {idError}
                                </p>
                            )}
                            </div>

                            {/* 비밀번호 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">비밀번호 *</h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="비밀번호를 입력하세요"
                                    className={`w-full pl-10 pr-10 py-3 border rounded-xl transition-all duration-200 ${
                                        passwordError || (!validatePassword(password) && password) 
                                        ? "border-red-300 focus:ring-red-200" 
                                        : validatePassword(password) && password
                                            ? "border-green-300 focus:ring-green-200"
                                            : "border-gray-200 focus:ring-2 focus:border-transparent"
                                    }`}
                                    onFocus={(e) => 
                                        !passwordError && !validatePassword(password) &&
                                        ((e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`)}
                                    onBlur={(e) => !passwordError && ((e.target as HTMLInputElement).style.boxShadow = 'none')}
                                    onKeyDown={handleKeyDown}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${
                                            password.length >= 8 && password.length <= 32 ? 'bg-green-400' : 'bg-gray-300'
                                        }`} />
                                        <span className={password.length >= 8 && password.length <= 32 ? 'text-green-600' : 'text-gray-500'}>
                                            8자 이상 32자 이하
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${
                                            validatePassword(password) && password !== '' ? 'bg-green-400' : 'bg-gray-300'
                                        }`} />
                                        <span className={validatePassword(password) && password !== '' ? 'text-green-600' : 'text-gray-500'}>
                                            영문/숫자/특수문자 중 2가지 이상 포함
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 비밀번호 확인 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">비밀번호 확인 *</h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                    placeholder="비밀번호를 다시 입력하세요"
                                    className={`w-full pl-10 pr-10 py-3 border rounded-xl transition-all duration-200 ${
                                        passwordError || (confirmPassword && password !== confirmPassword) 
                                        ? "border-red-300 focus:ring-red-200" 
                                        : password && confirmPassword && password === confirmPassword 
                                            ? "border-green-300 focus:ring-green-200" 
                                            : "border-gray-200 focus:ring-2 focus:border-transparent"
                                    }`}
                                    onKeyDown={handleKeyDown}
                                    />
                                    <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* 이름 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">이름 *</h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="실명을 입력하세요"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                        onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                            </div>

                            {/* 닉네임 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">닉네임 *</h3>
                                </div>

                                <div className="flex gap-2">
                                    {/* 입력창 */}
                                    <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => handleNicknameChange(e.target.value)}
                                        onKeyDown={handleNicknameKeyDown} // Enter → 중복 확인
                                        placeholder="사용할 닉네임을 입력하세요"
                                        className={`w-full pl-10 pr-10 py-3 border rounded-xl transition-all duration-200 ${
                                        nicknameError
                                            ? "border-red-300 focus:ring-red-200"
                                            : nicknameChecked
                                            ? "border-green-300 focus:ring-green-200"
                                            : "border-gray-200 focus:ring-2 focus:border-transparent"
                                        }`}
                                        onFocus={(e) =>
                                        !nicknameError &&
                                        !nicknameChecked &&
                                        ((e.target as HTMLInputElement).style.boxShadow =
                                            "0 0 0 2px rgba(139, 133, 233, 0.2)")
                                        }
                                        onBlur={(e) =>
                                        !nicknameError &&
                                        !nicknameChecked &&
                                        ((e.target as HTMLInputElement).style.boxShadow = "none")
                                        }
                                    />

                                    {/* 성공 체크 아이콘 */}
                                    {nicknameChecked && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                    </div>

                                    {/* 중복확인 버튼 */}
                                    <button
                                        onClick={onCheckNickname}  // onCheckId -> onCheckNickname 으로 변경
                                        className="px-4 py-3 text-sm text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                                        style={{ backgroundColor: "#8B85E9" }}
                                    >
                                        중복확인
                                    </button>
                                </div>

                                {/* 에러 메시지 */}
                                {nicknameError && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <X className="w-4 h-4" />
                                    {nicknameError}
                                    </p>
                                )}
                            </div>

                            {/* 전화번호 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">전화번호 *</h3>
                                </div>
                                <div className="flex gap-2">
                                    {/* 첫 번째 필드 - 앞자리 (010, 011 등) - 너비 증가 */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            value={phonePrefix}
                                            onChange={(e) => setPhonePrefix(e.target.value)}
                                            className="w-28 pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                                            onFocus={(e) => (e.target as HTMLSelectElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                            onBlur={(e) => (e.target as HTMLSelectElement).style.boxShadow = 'none'}
                                            // disabled={isVerified}
                                        >
                                            <option value="010">010</option>
                                            <option value="011">011</option>
                                            <option value="012">012</option>
                                            <option value="017">017</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    {/* 하이픈 */}
                                    <div className="flex items-center text-gray-400 font-bold text-lg">-</div>
                                    
                                    {/* 두 번째 필드 - 가운데 4자리 */}
                                    <div className="relative flex-1">
                                        <input
                                            ref={phoneMiddleRef}
                                            type="tel"
                                            value={phoneMiddle}
                                            onChange={(e) => handlePhoneMiddleChange(e.target.value)}
                                            onKeyDown={handlePhoneKeyDown}
                                            placeholder="0000"
                                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-center ${
                                                phoneMiddle && phoneMiddle.length === 4 ? 
                                                "border-green-300 focus:ring-green-200" : 
                                                "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                            onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
                                            maxLength={4}
                                        />
                                    </div>
                                    
                                    {/* 하이픈 */}
                                    <div className="flex items-center text-gray-400 font-bold text-lg">-</div>
                                    
                                    {/* 세 번째 필드 - 마지막 4자리 */}
                                    <div className="relative flex-1">
                                        <input
                                            ref={phoneLastRef}
                                            type="tel"
                                            value={phoneLast}
                                            onChange={(e) => handlePhoneLastChange(e.target.value)}
                                            onKeyDown={handlePhoneKeyDown}
                                            placeholder="0000"
                                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-center ${
                                                phoneLast && phoneLast.length === 4 ? 
                                                "border-green-300 focus:ring-green-200" : 
                                                "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                            onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
                                            maxLength={4}
                                        />
                                        {validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast) && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Check className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 전화번호 입력 필드들 다음에 에러 메시지 추가 */}
                                {telError && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <X className="w-4 h-4" />
                                        {telError}
                                    </p>
                                )}
                                
                                {/* 인증 버튼 - 수정된 유효성 검사 함수 사용 */}
                                <div className="mt-3">
                                    <button 
                                        onClick={handleSendVerification}
                                        disabled={!validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast) || isVerified}
                                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                            isVerified 
                                                ? "bg-green-100 text-green-600 cursor-default"
                                                : validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast)
                                                    ? "text-white hover:shadow-lg transform hover:scale-[1.02]"
                                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        }`}
                                        style={validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast) && !isVerified ? { 
                                            backgroundColor: "#8B85E9",
                                            boxShadow: "0 4px 6px -1px rgba(139, 133, 233, 0.1)"
                                        } : {}}
                                    >
                                        {isVerified ? "인증 완료" : showVerificationInput ? "인증번호 재발송" : "인증번호 발송"}
                                    </button>
                                </div>

                                {/* 인증번호 입력 필드 */}
                                {showVerificationInput && !isVerified && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-4 h-4 text-indigo-600" />
                                            <span className="text-sm font-medium text-gray-700">인증번호를 입력해주세요</span>
                                            {verificationTimer > 0 && (
                                                <span className="text-sm text-red-500 ml-auto font-mono">
                                                    {formatTime(verificationTimer)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                                                onKeyDown={handleVerificationCodeKeyDown}
                                                placeholder="6자리 인증번호"
                                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                                onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                                onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
                                                maxLength={6}
                                            />
                                            <button
                                                onClick={handleVerifyCode}
                                                disabled={!validatePhoneNumber(phonePrefix, phoneMiddle, phoneLast) || isVerified || isLoading}
                                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                                    verificationCode.length === 6
                                                        ? "text-white hover:opacity-90"
                                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                }`}
                                                style={verificationCode.length === 6 ? { backgroundColor: "#8B85E9" } : {}}
                                            >
                                                {isLoading ? "처리중..." : isVerified ? "인증 완료" : showVerificationInput ? "인증번호 재발송" : "인증번호 발송"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 알림 설정 - 토글 가능하도록 수정 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">알림받기 (선택)</h3>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => toggleNotificationPreference("phone")}
                                        className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 ${
                                            notificationPreference === "phone"
                                                ? "border-transparent text-white"
                                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                                        }`}
                                        style={notificationPreference === "phone" ? { backgroundColor: "#8B85E9" } : {}}
                                    >
                                        <Phone className="w-5 h-5 mx-auto mb-1" />
                                        SMS
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    알림을 받지 않으려면 버튼을 다시 클릭하여 해제하세요
                                </p>
                            </div>

                            {/* 버튼 */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="flex-1 py-4 px-6 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                                >
                                    로그인으로 돌아가기
                                </button>
                                <button
                                    onClick={nextPage}
                                    className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                        isFormValid
                                            ? "text-white hover:shadow-xl transform hover:scale-105"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                    style={isFormValid ? { 
                                        backgroundColor: "#8B85E9",
                                        boxShadow: "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)"
                                    } : {}}
                                    onMouseEnter={isFormValid ? (e) => {
                                        (e.target as HTMLButtonElement).style.backgroundColor = "#3B82F6";
                                    } : undefined}
                                    onMouseLeave={isFormValid ? (e) => {
                                        (e.target as HTMLButtonElement).style.backgroundColor = "#8B85E9";
                                    } : undefined}
                                    
                                    disabled={!isFormValid}
                                >
                                    다음
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
)};

export default JoinProfile;

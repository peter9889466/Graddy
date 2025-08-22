import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Check, X, AlertCircle, User, Lock, Mail, Phone, CheckCircle, Clock } from "lucide-react";
import axios from "axios";

const Join: React.FC = () => {
    // 상태 관리
    const [id, setId] = useState("");
    const [idError, setIdError] = useState("");
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
    const [email, setEmail] = useState("");
    const [phonePrefix, setPhonePrefix] = useState("010");
    const [phoneBody, setPhoneBody] = useState("");
    const [notificationPreference, setNotificationPreference] = useState<"email" | "phone" | "">("");
    const [hintMessage, setHintMessage] = useState<string>("");
    const [showHint, setShowHint] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
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
    const validatePhoneNumber = (prefix: string, body: string) => {
        const phoneRegex = /^\d{8}$/;
        return phoneRegex.test(body) && ["010", "011", "012", "017"].includes(prefix);
    };

    // 아이디 중복 확인
    const onCheckId = () => {
        if (id.trim() === "") {
            setIdError("아이디를 입력하세요.");
            setHintMessage("아이디를 먼저 입력해주세요!");
            return;
        }
        if (id.length < 4) {
            setIdError("아이디는 4자 이상이어야 합니다.");
            setHintMessage("아이디는 최소 4자 이상 입력해주세요!");
            return;
        }
        
        setIdError("");
        setIdChecked(true);
        setHintMessage("사용 가능한 아이디입니다!");
    };

    // 닉네임 중복 확인
    const onCheckNickname = () => {
        if (nickname.trim() === "") {
            setNicknameError("닉네임을 입력하세요.");
            setHintMessage("닉네임을 먼저 입력해주세요!");
            return;
        }
        if (nickname.length < 2) {
            setNicknameError("닉네임은 2자 이상이어야 합니다.");
            setHintMessage("닉네임은 최소 2자 이상 입력해주세요!");
            return;
        }
        
        setNicknameError("");
        setNicknameChecked(true);
        setHintMessage("사용 가능한 닉네임입니다!");
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

    // 전화번호 핸들러
    const handlePhoneBodyChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "").slice(0, 8);
        setPhoneBody(numericValue);
    };

    const handleSendVerification = () => {
    if (!validatePhoneNumber(phonePrefix, phoneBody)) {
        setHintMessage("올바른 전화번호를 입력해주세요!");
        return;
    }
    
    setShowVerificationInput(true);
    setVerificationTimer(180); // 3분
    setHintMessage("인증번호가 발송되었습니다!");
};

    const handleVerifyCode = () => {
        if (verificationCode.trim() === "") {
            setHintMessage("인증번호를 입력해주세요!");
            return;
        }
        
        // 실제로는 서버에서 확인해야 함
        if (verificationCode === "123456") {
            setIsVerified(true);
            setHintMessage("전화번호 인증이 완료되었습니다!");
        } else {
            setHintMessage("인증번호가 올바르지 않습니다!");
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
        if (!id || !password || !confirmPassword || !name || !nickname || !phoneBody) {
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

        if (!validatePhoneNumber(phonePrefix, phoneBody)) {
            setHintMessage("전화번호 형식이 올바르지 않습니다!");
            return;
        }

        if (!isVerified) {
            setHintMessage("전화번호 인증을 완료해주세요!");
            return;
        }

        // 모든 조건 통과 → Join2 페이지로 이동 (상태 전달)
        setPasswordError("");
        setHintMessage("회원가입이 완료되었습니다!");
        
        // 현재 폼 데이터를 state로 전달
        const formData = {
            userId: id,
            password: password,
            name: name,
            nick: nickname,
            tel: phonePrefix + phoneBody,
            alarmType: notificationPreference === "phone" ? true : false
        };
        
        navigate("/join2", { state: { formData } });
    };

    const isFormValid = id && password && confirmPassword && name && nickname && phoneBody && 
                    idChecked && nicknameChecked && validatePhoneNumber(phonePrefix, phoneBody) && isVerified;

    // Join2에서 돌아올 때 전달된 formData 가져오기
    const previousFormData = location.state?.formData;

    // 📌 Join2 → Join 으로 돌아올 때 값 복원
    useEffect(() => {
        if (previousFormData) {
            setId(previousFormData.id || "");
            setPassword(previousFormData.password || "");
            setConfirmPassword(previousFormData.confirmPassword || "");
            setName(previousFormData.name || "");
            setNickname(previousFormData.nickname || "");
            setEmail(previousFormData.email || "");
            
            // 전화번호 분리해서 복원
            const fullPhoneNumber = previousFormData.phoneNumber || "";
            if (fullPhoneNumber.length >= 3) {
                const prefix = fullPhoneNumber.substring(0, 3);
                const body = fullPhoneNumber.substring(3);
                setPhonePrefix(prefix);
                setPhoneBody(body);
            }
        }
    }, [previousFormData]);

    // "다음 단계로" 버튼 → Join2로 데이터 전달
    const handleNext = () => {
        navigate("/join2", {
            state: {
                formData: {
                    id,
                    password,
                    confirmPassword,
                    name,
                    nickname,
                    email,
                    phoneNumber: phonePrefix + phoneBody,
                },
            },
        });
    };

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
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4"
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
                        <h2 className="text-2xl font-bold mb-2 text-left">회원가입</h2>
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
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={id}
                                        onChange={(e) => handleIdChange(e.target.value)}
                                        placeholder="아이디를 입력하세요"
                                        className={`w-full pl-10 pr-24 py-3 border rounded-xl transition-all duration-200 ${
                                            idError ? "border-red-300 focus:ring-red-200" : 
                                            idChecked ? "border-green-300 focus:ring-green-200" : 
                                            "border-gray-200 focus:ring-2 focus:border-transparent"
                                        }`}
                                        onFocus={(e) => !idError && !idChecked && ((e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`)}
                                        onBlur={(e) => !idError && !idChecked && ((e.target as HTMLInputElement).style.boxShadow = 'none')}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button
                                        onClick={onCheckId}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-sm text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                                        style={{ backgroundColor: "#8B85E9" }}
                                    >
                                        중복확인
                                    </button>
                                    {idChecked && (
                                        <div className="absolute right-20 top-1/2 -translate-y-1/2">
                                            <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
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
                                            passwordError ? "border-red-300 focus:ring-red-200" : 
                                            "border-gray-200 focus:ring-2 focus:border-transparent"
                                        }`}
                                        onFocus={(e) => !passwordError && ((e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`)}
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
                                            passwordError ? "border-red-300 focus:ring-red-200" : 
                                            password && confirmPassword && password === confirmPassword ? "border-green-300 focus:ring-green-200" :
                                            "border-gray-200 focus:ring-2 focus:border-transparent"
                                        }`}
                                        onFocus={(e) => !passwordError && ((e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`)}
                                        onBlur={(e) => !passwordError && ((e.target as HTMLInputElement).style.boxShadow = 'none')}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    {password && confirmPassword && password === confirmPassword && (
                                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                            <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <X className="w-4 h-4" />
                                        {passwordError}
                                    </p>
                                )}
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
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => handleNicknameChange(e.target.value)}
                                        placeholder="사용할 닉네임을 입력하세요"
                                        className={`w-full pl-10 pr-24 py-3 border rounded-xl transition-all duration-200 ${
                                            nicknameError ? "border-red-300 focus:ring-red-200" : 
                                            nicknameChecked ? "border-green-300 focus:ring-green-200" : 
                                            "border-gray-200 focus:ring-2 focus:border-transparent"
                                        }`}
                                        onFocus={(e) => !nicknameError && !nicknameChecked && ((e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`)}
                                        onBlur={(e) => !nicknameError && !nicknameChecked && ((e.target as HTMLInputElement).style.boxShadow = 'none')}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button
                                        onClick={onCheckNickname}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-sm text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90"
                                        style={{ backgroundColor: "#8B85E9" }}
                                    >
                                        중복확인
                                    </button>
                                    {nicknameChecked && (
                                        <div className="absolute right-20 top-1/2 -translate-y-1/2">
                                            <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                </div>
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
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            value={phonePrefix}
                                            onChange={(e) => setPhonePrefix(e.target.value)}
                                            className="w-26 pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                                            onFocus={(e) => (e.target as HTMLSelectElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                            onBlur={(e) => (e.target as HTMLSelectElement).style.boxShadow = 'none'}
                                            disabled={isVerified}
                                        >
                                            <option value="010">010</option>
                                            <option value="011">011</option>
                                            <option value="012">012</option>
                                            <option value="017">017</option>
                                        </select>
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            type="tel"
                                            value={phoneBody}
                                            onChange={(e) => handlePhoneBodyChange(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="1234"
                                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                                phoneBody && validatePhoneNumber(phonePrefix, phoneBody) ? 
                                                "border-green-300 focus:ring-green-200" : 
                                                "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                            onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
                                            disabled={isVerified}
                                        />
                                        {phoneBody && validatePhoneNumber(phonePrefix, phoneBody) && !showVerificationInput && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Check className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                        {isVerified && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            type="tel"
                                            value={phoneBody}
                                            onChange={(e) => handlePhoneBodyChange(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="5678"
                                            className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 ${
                                                phoneBody && validatePhoneNumber(phonePrefix, phoneBody) ? 
                                                "border-green-300 focus:ring-green-200" : 
                                                "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                            onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
                                            disabled={isVerified}
                                        />
                                        {phoneBody && validatePhoneNumber(phonePrefix, phoneBody) && !showVerificationInput && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Check className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                        {isVerified && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    형식: 010-12345678
                                </p>
                                
                                {/* 인증 버튼 */}
                                <div className="mt-3">
                                    <button 
                                        onClick={handleSendVerification}
                                        disabled={!validatePhoneNumber(phonePrefix, phoneBody) || isVerified}
                                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                            isVerified 
                                                ? "bg-green-100 text-green-600 cursor-default"
                                                : validatePhoneNumber(phonePrefix, phoneBody)
                                                    ? "text-white hover:shadow-lg transform hover:scale-[1.02]"
                                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        }`}
                                        style={validatePhoneNumber(phonePrefix, phoneBody) && !isVerified ? { 
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
                                                placeholder="6자리 인증번호"
                                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                                onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                                onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
                                                maxLength={6}
                                            />
                                            <button
                                                onClick={handleVerifyCode}
                                                disabled={verificationCode.length !== 6}
                                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                                    verificationCode.length === 6
                                                        ? "text-white hover:opacity-90"
                                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                }`}
                                                style={verificationCode.length === 6 ? { backgroundColor: "#8B85E9" } : {}}
                                            >
                                                확인
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

export default Join;
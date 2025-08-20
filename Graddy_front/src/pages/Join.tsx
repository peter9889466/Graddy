import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X, AlertCircle, User, Lock, Mail, Phone } from "lucide-react";

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
    const [phoneNumber, setPhoneNumber] = useState("");
    const [notificationPreference, setNotificationPreference] = useState<"email" | "phone">("email");
    const [hintMessage, setHintMessage] = useState<string>("");
    const [showHint, setShowHint] = useState(false);
    const navigate = useNavigate();

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

    // 비밀번호 유효성 검사
    const validatePassword = (pwd: string) => {
        const hasLetter = /[a-zA-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        const validLength = pwd.length >= 8 && pwd.length <= 32;
        const validCombo = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length >= 2;
        
        return validLength && validCombo;
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

// 회원가입 다음 단계
const nextPage = () => {
    // 유효성 검사
    if (!id || !password || !confirmPassword || !name || !nickname) {
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

    // 모든 조건 통과 → 로그인 페이지로 이동
    setPasswordError("");
    setHintMessage("회원가입이 완료되었습니다!");
    navigate("/join2");
};

    const isFormValid = id && password && confirmPassword && name && nickname && idChecked && nicknameChecked;

    return (
<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
  <div className="max-w-3xl mx-auto">
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    아이디 *
                                </label>
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
                                    />
                                    <button
                                        onClick={onCheckId}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90"
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    비밀번호 *
                                </label>
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
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className={`w-2 h-2 rounded-full ${
                                            password.length >= 8 && password.length <= 32 ? 'bg-green-400' : 'bg-gray-300'
                                        }`} />
                                        <span className={password.length >= 8 && password.length <= 32 ? 'text-green-600' : 'text-gray-500'}>
                                            8자 이상 32자 이하
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className={`w-2 h-2 rounded-full ${
                                            validatePassword(password) || password === '' ? 'bg-green-400' : 'bg-gray-300'
                                        }`} />
                                        <span className={validatePassword(password) || password === '' ? 'text-green-600' : 'text-gray-500'}>
                                            영문/숫자/특수문자 중 2가지 이상 포함
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 비밀번호 확인 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    비밀번호 확인 *
                                </label>
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    이름 *
                                </label>
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
                                    />
                                </div>
                            </div>

                            {/* 닉네임 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    닉네임 *
                                </label>
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
                                    />
                                    <button
                                        onClick={onCheckNickname}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs text-white rounded-lg font-medium transition-all duration-200 hover:opacity-90"
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    전화번호 (선택)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="010-1234-5678"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                                        onFocus={(e) => (e.target as HTMLInputElement).style.boxShadow = `0 0 0 2px rgba(139, 133, 233, 0.2)`}
                                        onBlur={(e) => (e.target as HTMLInputElement).style.boxShadow = 'none'}
                                    />
                                </div>
                            </div>

                            {/* 알림 설정 */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    알림 받을 방법
                                </label>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setNotificationPreference("phone")}
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
                                        (e.target as HTMLButtonElement).style.backgroundColor = "#7d75e3";
                                    } : undefined}
                                    onMouseLeave={isFormValid ? (e) => {
                                        (e.target as HTMLButtonElement).style.backgroundColor = "#8B85E9";
                                    } : undefined}
                                    
                                    disabled={!isFormValid}
                                >
                                    다음 단계로
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
)};

export default Join;

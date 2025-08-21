// 아이디, 비밀번호 찾기 페이지
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Phone, Lock, AlertCircle, Check, ArrowLeft } from "lucide-react";

const FindAccount: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'id' | 'password'>('id');
    
    // 아이디 찾기 상태
    const [idName, setIdName] = useState("");
    const [idPhone, setIdPhone] = useState("");
    
    // 비밀번호 찾기 상태
    const [pwUserId, setPwUserId] = useState("");
    const [pwPhone, setPwPhone] = useState("");
    
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
            // 실제 API 호출 로직을 여기에 구현하세요
            await new Promise(resolve => setTimeout(resolve, 2000)); // 임시 로딩
            
            setHintMessage("휴대폰으로 아이디 정보를 발송했습니다. 📱");
        } catch (error) {
            setHintMessage("아이디 찾기에 실패했습니다. 입력하신 정보를 확인해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindPassword = async () => {
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
            
            setHintMessage("휴대폰으로 임시 비밀번호를 발송했습니다. 📱");
        } catch (error) {
            setHintMessage("비밀번호 찾기에 실패했습니다. 입력하신 정보를 확인해주세요.");
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
        }
    };

    const handleIdFormKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFindId();
        }
    };

    const handlePasswordFormKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFindPassword();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* 카드 */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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
                                        hintMessage.includes("발송")
                                            ? "bg-emerald-50 border-emerald-200"
                                            : "bg-amber-50 border-amber-200"
                                    }`}
                                >
                                    {hintMessage.includes("발송") ? (
                                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    )}
                                    <span
                                        className={`text-sm font-medium ${
                                            hintMessage.includes("발송")
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
                                        아이디와 전화번호를 입력하시면 임시 비밀번호를 발송해드립니다.
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
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.pwUserId
                                                    ? "border-red-300 focus:ring-red-200"
                                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onKeyDown={handleIdFormKeyDown}
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
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.pwPhone
                                                    ? "border-red-300 focus:ring-red-200"
                                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onKeyDown={handleIdFormKeyDown}
                                        />
                                    </div>
                                    {errors.pwPhone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.pwPhone}</p>
                                    )}
                                </div>

                                {/* 비밀번호 찾기 버튼 */}
                                <button
                                    onClick={handleFindPassword}
                                    disabled={isLoading}
                                    className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                    style={{
                                        backgroundColor: "#8B85E9",
                                        boxShadow: "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                                    }}
                                    onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#7d75e3")}
                                    onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#8B85E9")}
                                >
                                    {isLoading ? "처리 중..." : "임시 비밀번호 발송"}
                                </button>
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
        </div>
    );
};

export default FindAccount;
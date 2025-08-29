// 아이디, 비밀번호 찾기 컴포넌트
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { User, Phone, Lock, AlertCircle, Check, ArrowLeft } from "lucide-react";

interface AccountCardProps {
    onVerificationSuccess?: (userId: string, phone: string) => void;
}

const AccountCard: React.FC<AccountCardProps> = ({ onVerificationSuccess }) => {
    const [activeTab, setActiveTab] = useState<"id" | "password">("id");

    // 아이디 찾기 상태
    const [idName, setIdName] = useState("");
    const [idPhone, setIdPhone] = useState("");
    // 아이디 찾기용 전화번호 상태
    const [idPhonePrefix, setIdPhonePrefix] = useState("010");
    const [idPhoneMiddle, setIdPhoneMiddle] = useState("");
    const [idPhoneLast, setIdPhoneLast] = useState("");

    // 비밀번호 찾기 상태
    const [pwUserId, setPwUserId] = useState("");
    const [pwPhone, setPwPhone] = useState("");
    // 비밀번호 찾기용 전화번호 상태
    const [pwPhonePrefix, setPwPhonePrefix] = useState("010");
    const [pwPhoneMiddle, setPwPhoneMiddle] = useState("");
    const [pwPhoneLast, setPwPhoneLast] = useState("");

    // ref도 분리
    const idPhoneMiddleRef = useRef<HTMLInputElement>(null);
    const idPhoneLastRef = useRef<HTMLInputElement>(null);
    const pwPhoneMiddleRef = useRef<HTMLInputElement>(null);
    const pwPhoneLastRef = useRef<HTMLInputElement>(null);

    // 비밀번호 찾기 인증 관련 상태
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [verificationTimer, setVerificationTimer] = useState(0);

    // 공통 상태
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

    const handleIdPhoneMiddleChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "").slice(0, 4);
        setIdPhoneMiddle(numericValue);

        if (errors.idPhone) {
            const newErrors = { ...errors };
            delete newErrors.idPhone;
            setErrors(newErrors);
        }

        if (numericValue.length === 4 && idPhoneLastRef.current) {
            idPhoneLastRef.current.focus();
        }
    };

    const handleIdPhoneLastChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "").slice(0, 4);
        setIdPhoneLast(numericValue);

        if (errors.idPhone) {
            const newErrors = { ...errors };
            delete newErrors.idPhone;
            setErrors(newErrors);
        }
    };

    const handlePwPhoneMiddleChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "").slice(0, 4);
        setPwPhoneMiddle(numericValue);

        if (errors.pwPhone) {
            const newErrors = { ...errors };
            delete newErrors.pwPhone;
            setErrors(newErrors);
        }

        if (numericValue.length === 4 && pwPhoneLastRef.current) {
            pwPhoneLastRef.current.focus();
        }
    };

    const handlePwPhoneLastChange = (value: string) => {
        const numericValue = value.replace(/[^\d]/g, "").slice(0, 4);
        setPwPhoneLast(numericValue);

        if (errors.pwPhone) {
            const newErrors = { ...errors };
            delete newErrors.pwPhone;
            setErrors(newErrors);
        }
    };

    const validatePhone = (prefix: string, middle: string, last: string) => {
        const middleValid = /^\d{4}$/.test(middle);
        const lastValid = /^\d{4}$/.test(last);
        return (
            middleValid &&
            lastValid &&
            ["010", "011", "012", "017"].includes(prefix)
        );
    };

    const handleFindId = async () => {
        clearErrors();
        const newErrors: { [key: string]: string } = {};

        if (!idName.trim()) {
            newErrors.idName = "이름을 입력하세요.";
        }

        if (!validatePhone(idPhonePrefix, idPhoneMiddle, idPhoneLast)) {
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
                tel: idPhonePrefix + idPhoneMiddle + idPhoneLast,
            };

            console.log("전송할 데이터:", requestData); // 디버깅용

            const response = await fetch(
                "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/find-id",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                }
            );

            const result = await response.json();
            console.log("서버 응답:", result); // 디버깅용

            if (result.status === 200) {
                // 성공 시 - 아이디 정보를 포함한 메시지 표시
                setHintMessage(
                    `찾으신 아이디는 "${result.data.userId}" 입니다. 📱`
                );
            } else {
                // 실패 시 - 서버에서 온 에러 메시지 표시
                console.log(
                    "실패 상황 - 상태:",
                    result.status,
                    "메시지:",
                    result.message
                );
                setHintMessage(
                    result.message ||
                        "아이디 찾기에 실패했습니다. 입력하신 정보를 확인해주세요."
                );
            }
        } catch (error) {
            console.error("아이디 찾기 API 호출 오류:", error);
            setHintMessage(
                "서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            );
        } finally {
            setIsLoading(false);
        }

        const phoneNumber = idPhonePrefix + idPhoneMiddle + idPhoneLast;
    };

    const handleSendVerification = async () => {
        clearErrors();
        const newErrors: { [key: string]: string } = {};

        if (!pwUserId.trim()) {
            newErrors.pwUserId = "아이디를 입력하세요.";
        }

        if (!validatePhone(pwPhonePrefix, pwPhoneMiddle, pwPhoneLast)) {
            newErrors.pwPhone = "올바른 전화번호 형식이 아닙니다.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setHintMessage("입력하신 정보를 다시 확인해주세요.");
            return;
        }

        setIsLoading(true);

        try {
            // 사용자 존재 여부 확인
            const verifyResponse = await fetch(
                "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/password-find/verify-user",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: pwUserId.trim(),
                        tel: pwPhonePrefix + pwPhoneMiddle + pwPhoneLast,
                    }),
                }
            );

            const verifyResult = await verifyResponse.json();

            if (verifyResult.status === 200 && verifyResult.data === true) {
                // 인증번호 발송
                const sendResponse = await fetch(
                    "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/auth/send-code",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            phoneNumber:
                                pwPhonePrefix + pwPhoneMiddle + pwPhoneLast,
                        }),
                    }
                );

                const sendResult = await sendResponse.json();

                if (sendResult.status === 200) {
                    setIsVerificationSent(true);
                    setVerificationTimer(300); // 5분 타이머
                    setHintMessage(
                        "인증번호를 발송했습니다. 6자리 숫자를 입력해주세요. 📱"
                    );
                } else {
                    setHintMessage(
                        sendResult.message || "인증번호 발송에 실패했습니다."
                    );
                }
            } else {
                setHintMessage(
                    verifyResult.message ||
                        "아이디 또는 전화번호가 일치하지 않습니다."
                );
            }
        } catch (error) {
            console.error("handleSendVerification 오류:", error);
            setHintMessage(
                "서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            );
        } finally {
            setIsLoading(false);
        }

        const phoneNumber = pwPhonePrefix + pwPhoneMiddle + pwPhoneLast;
    };

    // 인증번호 입력
    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            setHintMessage("⚠️ 인증번호를 입력해주세요.");
            return;
        }

        try {
            const response = await fetch(
                "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/auth/verify-code",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phoneNumber:
                            pwPhonePrefix + pwPhoneMiddle + pwPhoneLast,
                        code: verificationCode.trim(),
                    }),
                }
            );

            const result = await response.json();

            if (result.status === 200 && result.data === "인증 성공") {
                setHintMessage("✅ 인증이 완료되었습니다.");
                onVerificationSuccess?.(pwUserId.trim(), pwPhone.trim()); // FindAccount로 전달
            } else {
                setHintMessage(`❌ ${result.message || "인증 실패"}`);
            }
        } catch (error) {
            console.error("인증번호 확인 오류:", error);
            setHintMessage("⚠️ 인증 확인 중 오류가 발생했습니다.");
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
            case "idName":
                setIdName(value);
                break;
            case "pwUserId":
                setPwUserId(value);
                break;
            case "verificationCode":
                setVerificationCode(value.replace(/\D/g, "").slice(0, 6)); // 숫자만, 최대 6자리
                break;
        }
    };

    const handleIdFormKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleFindId();
        }
    };

    const handlePasswordFormKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (!isVerificationSent) {
                handleSendVerification();
            } else {
                handleVerifyCode();
            }
        }
    };

    const handleVerificationKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
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
                        <Link
                            to="/login"
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
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
                        onClick={() => setActiveTab("id")}
                        className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 ${
                            activeTab === "id"
                                ? "text-[#8B85E9] border-b-2 border-[#8B85E9] bg-purple-50/50"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        아이디 찾기
                    </button>
                    <button
                        onClick={() => setActiveTab("password")}
                        className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200 ${
                            activeTab === "password"
                                ? "text-[#8B85E9] border-b-2 border-[#8B85E9] bg-purple-50/50"
                                : "text-gray-600 hover:text-gray-800"
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
                                    hintMessage.includes("발송") ||
                                    hintMessage.includes("찾으신 아이디")
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-amber-50 border-amber-200"
                                }`}
                            >
                                {hintMessage.includes("발송") ||
                                hintMessage.includes("찾으신 아이디") ? (
                                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                )}
                                <span
                                    className={`text-sm font-medium ${
                                        hintMessage.includes("발송") ||
                                        hintMessage.includes("찾으신 아이디")
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
                    {activeTab === "id" && (
                        <>
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600">
                                    이름과 전화번호를 입력하시면 등록된 아이디를
                                    확인하실 수 있습니다.
                                </p>
                            </div>

                            {/* 이름 입력 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        이름
                                    </h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={idName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "idName",
                                                e.target.value
                                            )
                                        }
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
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.idName}
                                    </p>
                                )}
                            </div>

                            {/* 전화번호 입력 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        전화번호
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            value={idPhonePrefix}
                                            onChange={(e) =>
                                                setIdPhonePrefix(e.target.value)
                                            }
                                            className="w-28 pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                                        >
                                            <option value="010">010</option>
                                            <option value="011">011</option>
                                            <option value="012">012</option>
                                            <option value="017">017</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-400 font-bold text-lg">
                                        -
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            ref={idPhoneMiddleRef}
                                            type="tel"
                                            value={idPhoneMiddle}
                                            onChange={(e) =>
                                                handleIdPhoneMiddleChange(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={handleIdFormKeyDown}
                                            placeholder="0000"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 text-center"
                                            maxLength={4}
                                        />
                                    </div>
                                    <div className="flex items-center text-gray-400 font-bold text-lg">
                                        -
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            ref={idPhoneLastRef}
                                            type="tel"
                                            value={idPhoneLast}
                                            onChange={(e) =>
                                                handleIdPhoneLastChange(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={handleIdFormKeyDown}
                                            placeholder="0000"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 text-center"
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                                {errors.idPhone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.idPhone}
                                    </p>
                                )}
                            </div>

                            {/* 아이디 찾기 버튼 */}
                            <button
                                onClick={handleFindId}
                                disabled={isLoading}
                                className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                style={{
                                    backgroundColor: "#8B85E9",
                                    boxShadow:
                                        "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                                }}
                                onMouseEnter={(e) =>
                                    !isLoading &&
                                    (e.currentTarget.style.backgroundColor =
                                        "#7d75e3")
                                }
                                onMouseLeave={(e) =>
                                    !isLoading &&
                                    (e.currentTarget.style.backgroundColor =
                                        "#8B85E9")
                                }
                            >
                                {isLoading ? "처리 중..." : "아이디 찾기"}
                            </button>
                        </>
                    )}

                    {/* 비밀번호 찾기 탭 */}
                    {activeTab === "password" && (
                        <>
                            <div className="text-center mb-6">
                                <p className="text-sm text-gray-600">
                                    {!isVerificationSent
                                        ? "아이디와 전화번호를 입력하시면 인증번호를 발송해드립니다."
                                        : "발송된 인증번호를 입력하시면 임시 비밀번호를 발송해드립니다."}
                                </p>
                            </div>

                            {/* 아이디 입력 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        아이디
                                    </h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={pwUserId}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "pwUserId",
                                                e.target.value
                                            )
                                        }
                                        placeholder="아이디를 입력하세요"
                                        disabled={isVerificationSent}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                            errors.pwUserId
                                                ? "border-red-300 focus:ring-red-200"
                                                : "border-gray-200 focus:ring-2 focus:border-transparent"
                                        } ${
                                            isVerificationSent
                                                ? "bg-gray-100 cursor-not-allowed"
                                                : ""
                                        }`}
                                        onKeyDown={handlePasswordFormKeyDown}
                                    />
                                </div>
                                {errors.pwUserId && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.pwUserId}
                                    </p>
                                )}
                            </div>

                            {/* 전화번호 입력 */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        전화번호
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select
                                            value={idPhonePrefix}
                                            onChange={(e) =>
                                                setIdPhonePrefix(e.target.value)
                                            }
                                            className="w-28 pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                                        >
                                            <option value="010">010</option>
                                            <option value="011">011</option>
                                            <option value="012">012</option>
                                            <option value="017">017</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-400 font-bold text-lg">
                                        -
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            ref={pwPhoneMiddleRef}
                                            type="tel"
                                            value={pwPhoneMiddle}
                                            onChange={(e) =>
                                                handlePwPhoneMiddleChange(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={
                                                handlePasswordFormKeyDown
                                            }
                                            placeholder="0000"
                                            disabled={isVerificationSent}
                                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 text-center ${
                                                isVerificationSent
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            maxLength={4}
                                        />
                                    </div>
                                    <div className="flex items-center text-gray-400 font-bold text-lg">
                                        -
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            ref={pwPhoneLastRef}
                                            type="tel"
                                            value={pwPhoneLast}
                                            onChange={(e) =>
                                                handlePwPhoneLastChange(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={
                                                handlePasswordFormKeyDown
                                            }
                                            placeholder="0000"
                                            disabled={isVerificationSent}
                                            className={`w-full px-4 py-3 border border-gray-200 rounded-xl transition-all duration-200 text-center ${
                                                isVerificationSent
                                                    ? "bg-gray-100 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                                {errors.pwPhone && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.pwPhone}
                                    </p>
                                )}
                            </div>

                            {/* 인증번호 입력 (인증번호 발송 후에만 표시) */}
                            {isVerificationSent && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            인증번호
                                        </h3>
                                        {verificationTimer > 0 && (
                                            <span className="text-sm text-red-500 font-medium">
                                                (
                                                {Math.floor(
                                                    verificationTimer / 60
                                                )}
                                                :
                                                {(verificationTimer % 60)
                                                    .toString()
                                                    .padStart(2, "0")}
                                                )
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
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "verificationCode",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="인증번호 6자리를 입력하세요"
                                            maxLength={6}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                                errors.verificationCode
                                                    ? "border-red-300 focus:ring-red-200"
                                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                                            }`}
                                            onKeyDown={
                                                handleVerificationKeyDown
                                            }
                                        />
                                    </div>
                                    {errors.verificationCode && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.verificationCode}
                                        </p>
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
                                        boxShadow:
                                            "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                                    }}
                                    onMouseEnter={(e) =>
                                        !isLoading &&
                                        (e.currentTarget.style.backgroundColor =
                                            "#7d75e3")
                                    }
                                    onMouseLeave={(e) =>
                                        !isLoading &&
                                        (e.currentTarget.style.backgroundColor =
                                            "#8B85E9")
                                    }
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
                                            boxShadow:
                                                "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                                        }}
                                        onMouseEnter={(e) =>
                                            !isLoading &&
                                            (e.currentTarget.style.backgroundColor =
                                                "#7d75e3")
                                        }
                                        onMouseLeave={(e) =>
                                            !isLoading &&
                                            (e.currentTarget.style.backgroundColor =
                                                "#8B85E9")
                                        }
                                    >
                                        {isLoading ? "처리 중..." : "확인"}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsVerificationSent(false);
                                            setVerificationCode("");
                                            setVerificationTimer(0);
                                            clearErrors();
                                            setPwPhonePrefix("010");
                                            setPwPhoneMiddle("");
                                            setPwPhoneLast("");
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
                            <Link
                                to="/login"
                                className="text-[#8B85E9] hover:underline"
                            >
                                로그인
                            </Link>
                        </p>
                    </div>

                    <div className="pt-2 text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            아직 회원이 아니신가요?{" "}
                            <Link
                                to="/join"
                                className="text-[#8B85E9] hover:underline"
                            >
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

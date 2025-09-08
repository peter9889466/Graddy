// 새 비밀번호 설정 컴포넌트
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Check,
    ArrowLeft,
    Shield,
} from "lucide-react";

interface ResetPasswordProps {
    userId: string;
    phone: string;
    onBack: () => void;
    onComplete: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({
    userId,
    phone,
    onBack,
    onComplete,
}) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [hintMessage, setHintMessage] = useState("");
    const [showHint, setShowHint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // 비밀번호 유효성 검사 규칙
    const [passwordRules, setPasswordRules] = useState({
        length: false, // 8자 이상
        letter: false, // 소문자 포함
        number: false, // 숫자 포함
        special: false, // 특수문자 포함
    });

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

    // 비밀번호 규칙 검사
    useEffect(() => {
        setPasswordRules({
            length: newPassword.length >= 8,
            letter: /[a-zA-Z]/.test(newPassword), // 대문자 또는 소문자 포함
            number: /[0-9]/.test(newPassword),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
        });
    }, [newPassword]);

    const clearErrors = () => {
        setErrors({});
    };

    const validatePassword = (password: string) => {
        if (password.length < 8) return false;
        if (!/[a-zA-Z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
            return false;
        return true;
    };

    const handleResetPassword = async () => {
        clearErrors();
        const newErrors: { [key: string]: string } = {};

        if (!newPassword.trim()) {
            newErrors.newPassword = "새 비밀번호를 입력하세요.";
        } else if (!validatePassword(newPassword)) {
            newErrors.newPassword =
                "비밀번호는 8자 이상, 영문자, 숫자, 특수문자를 포함해야 합니다.";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "비밀번호 확인을 입력하세요.";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setHintMessage("입력하신 정보를 다시 확인해주세요.");
            return;
        }

        setIsLoading(true);

        try {
            // API URL 및 Request Body를 새 요구사항에 맞게 수정
            const response = await fetch(
                "/api/password-find/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: userId,
                        newPassword: newPassword,
                    }),
                }
            );

            const result = await response.json();

            if (result.status === 200) {
                setHintMessage("비밀번호가 성공적으로 변경되었습니다!");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setHintMessage(
                    result.message ||
                        "비밀번호 변경에 실패했습니다. 다시 시도해주세요."
                );
            }
        } catch (error) {
            console.error("비밀번호 변경 API 오류:", error);
            setHintMessage(
                "서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            );
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

        if (field === "newPassword") {
            setNewPassword(value);
        } else if (field === "confirmPassword") {
            setConfirmPassword(value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleResetPassword();
        }
    };

    const getRuleColor = (isValid: boolean) => {
        return isValid ? "text-emerald-600" : "text-gray-400";
    };

    const getRuleIcon = (isValid: boolean) => {
        return isValid ? (
            <Check className="w-4 h-4" />
        ) : (
            <div className="w-4 h-4 rounded-full border-2 border-current"></div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            {/* 헤더 */}
            <div
                className="px-6 py-8 text-white"
                style={{
                    background: `linear-gradient(to right, #8B85E9, #8B85E9)`,
                }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={onBack}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">새 비밀번호 설정</h2>
                </div>
                <p className="opacity-90 text-sm">
                    {userId}님의 새로운 비밀번호를 설정해주세요
                </p>
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
                                hintMessage.includes("성공적으로")
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-amber-50 border-amber-200"
                            }`}
                        >
                            {hintMessage.includes("성공적으로") ? (
                                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            )}
                            <span
                                className={`text-sm font-medium ${
                                    hintMessage.includes("성공적으로")
                                        ? "text-emerald-800"
                                        : "text-amber-800"
                                }`}
                            >
                                {hintMessage}
                            </span>
                        </div>
                    </div>
                )}

                {/* 새 비밀번호 입력 */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-gray-800">
                            새 비밀번호
                        </h3>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) =>
                                handleInputChange("newPassword", e.target.value)
                            }
                            placeholder="새 비밀번호를 입력하세요"
                            className={`w-full pl-10 pr-12 py-3 border rounded-xl transition-all duration-200 ${
                                errors.newPassword
                                    ? "border-red-300 focus:ring-red-200"
                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                            }`}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showNewPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.newPassword}
                        </p>
                    )}
                </div>

                {/* 비밀번호 규칙 표시 */}
                {newPassword && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                                비밀번호 안전도 확인
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div
                                className={`flex items-center gap-2 ${getRuleColor(
                                    passwordRules.length
                                )}`}
                            >
                                {getRuleIcon(passwordRules.length)}
                                <span>8자 이상</span>
                            </div>
                            <div
                                className={`flex items-center gap-2 ${getRuleColor(
                                    passwordRules.letter
                                )}`}
                            >
                                {getRuleIcon(passwordRules.letter)}
                                <span>영문자 포함</span>
                            </div>
                            <div
                                className={`flex items-center gap-2 ${getRuleColor(
                                    passwordRules.number
                                )}`}
                            >
                                {getRuleIcon(passwordRules.number)}
                                <span>숫자 포함</span>
                            </div>
                            <div
                                className={`flex items-center gap-2 ${getRuleColor(
                                    passwordRules.special
                                )} sm:col-span-2`}
                            >
                                {getRuleIcon(passwordRules.special)}
                                <span>특수문자 포함 (!@#$%^&* 등)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 비밀번호 확인 입력 */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-gray-800">
                            비밀번호 확인
                        </h3>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) =>
                                handleInputChange(
                                    "confirmPassword",
                                    e.target.value
                                )
                            }
                            placeholder="비밀번호를 다시 입력하세요"
                            className={`w-full pl-10 pr-12 py-3 border rounded-xl transition-all duration-200 ${
                                errors.confirmPassword
                                    ? "border-red-300 focus:ring-red-200"
                                    : "border-gray-200 focus:ring-2 focus:border-transparent"
                            }`}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.confirmPassword}
                        </p>
                    )}
                    {/* 비밀번호 일치 표시 */}
                    {confirmPassword && newPassword && (
                        <div
                            className={`text-sm mt-1 ${
                                newPassword === confirmPassword
                                    ? "text-emerald-600"
                                    : "text-red-500"
                            }`}
                        >
                            {newPassword === confirmPassword ? (
                                <div className="flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    <span>비밀번호가 일치합니다</span>
                                </div>
                            ) : (
                                <span>비밀번호가 일치하지 않습니다</span>
                            )}
                        </div>
                    )}
                </div>

                {/* 변경 버튼 */}
                <button
                    onClick={handleResetPassword}
                    disabled={
                        isLoading ||
                        !newPassword ||
                        !confirmPassword ||
                        newPassword !== confirmPassword ||
                        !validatePassword(newPassword)
                    }
                    className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{
                        backgroundColor: "#8B85E9",
                        boxShadow:
                            "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                    }}
                    onMouseEnter={(e) => {
                        if (
                            !isLoading &&
                            newPassword &&
                            confirmPassword &&
                            newPassword === confirmPassword &&
                            validatePassword(newPassword)
                        ) {
                            e.currentTarget.style.backgroundColor = "#7d75e3";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (
                            !isLoading &&
                            newPassword &&
                            confirmPassword &&
                            newPassword === confirmPassword &&
                            validatePassword(newPassword)
                        ) {
                            e.currentTarget.style.backgroundColor = "#8B85E9";
                        }
                    }}
                >
                    {isLoading ? "처리 중..." : "비밀번호 변경"}
                </button>

                {/* 하단 링크 */}
                <div className="pt-4 text-center">
                    <p className="text-sm text-gray-600">
                        비밀번호 변경을 완료하시면{" "}
                        <Link
                            to="/login"
                            className="text-[#8B85E9] hover:underline"
                        >
                            로그인 페이지
                        </Link>
                        로 이동합니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { User, Lock, AlertCircle, Check } from "lucide-react";
import axios, { AxiosError } from "axios";

const Login: React.FC = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [rememberId, setRememberId] = useState(false);
    const [idError, setIdError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [hintMessage, setHintMessage] = useState("");
    const [showHint, setShowHint] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error(
            "Login 컴포넌트는 AuthProvider 내에서 사용되어야 합니다."
        );
    }
    const { login } = authContext;

    useEffect(() => {
        const savedId = localStorage.getItem("savedId");
        if (savedId) {
            setId(savedId);
            setRememberId(true);
        }
    }, []);

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

    const loginBtn = async () => {
        setIdError("");
        setPasswordError("");
        setHintMessage("");

        if (!id) {
            setIdError("아이디를 입력하세요.");
            setHintMessage("아이디를 입력해주세요!");
            return;
        }
        if (!password) {
            setPasswordError("비밀번호를 입력하세요.");
            setHintMessage("비밀번호를 입력해주세요!");
            return;
        }

        setIsLoading(true);

        try {
            const API_BASE_URL = 'http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api';
                
            const response = await axios.post(
                `${API_BASE_URL}/auth/login`,
                {
                    userId: id,
                    password: password,
                }
            );
            console.log(response);
            // 💡 1. API 응답에서 토큰을 가져옵니다.
            const token = response.data.data.accessToken;

            const userData = {
                nickname: response.data.data.nickname || id,
            };

            // 💡 2. AuthContext의 login 함수에 userData와 함께 token을 전달합니다.
            login(userData, token);

            if (rememberId) {
                localStorage.setItem("savedId", id);
            } else {
                localStorage.removeItem("savedId");
            }

            setHintMessage("로그인 성공! 환영합니다!");
            navigate("/");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Axios 에러인 경우 (서버 응답이 온 경우)
                const serverErrorMessage = error.response?.data?.message;
                let displayMessage =
                    "로그인에 실패했습니다. 아이디 또는 비밀번호를 다시 확인해주세요.";

                // Type definition error가 발생했을 때 특별히 처리합니다.
                if (
                    serverErrorMessage &&
                    serverErrorMessage.includes("Type definition error")
                ) {
                    displayMessage =
                        "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
                } else if (serverErrorMessage) {
                    displayMessage = serverErrorMessage;
                }

                setPasswordError(displayMessage);
                setHintMessage(displayMessage);
            } else {
                // 네트워크 에러 등 알 수 없는 에러인 경우
                const unknownErrorMessage =
                    "네트워크 연결에 실패했거나 서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
                setPasswordError(unknownErrorMessage);
                setHintMessage(unknownErrorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            loginBtn();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div
                        className="px-6 py-8 text-white"
                        style={{
                            background: `linear-gradient(to right, #8B85E9, #8B85E9)`,
                        }}
                    >
                        <h2 className="text-2xl font-bold mb-2 text-left">
                            로그인
                        </h2>
                        <p className="opacity-90 text-sm text-left">
                            계정에 로그인하고 다양한 서비스를 이용해보세요
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
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
                                        hintMessage.includes("성공")
                                            ? "bg-emerald-50 border-emerald-200"
                                            : "bg-amber-50 border-amber-200"
                                    }`}
                                >
                                    {hintMessage.includes("성공") ? (
                                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    )}
                                    <span
                                        className={`text-sm font-medium ${
                                            hintMessage.includes("성공")
                                                ? "text-emerald-800"
                                                : "text-amber-800"
                                        }`}
                                    >
                                        {hintMessage}
                                    </span>
                                </div>
                            </div>
                        )}

                        <form onSubmit={(e) => { e.preventDefault(); loginBtn(); }} className="space-y-6">
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
                                        name="userId"
                                        value={id}
                                        onChange={(e) => {
                                            setId(e.target.value);
                                            setIdError("");
                                        }}
                                        placeholder="아이디를 입력하세요"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                            idError
                                                ? "border-red-300 focus:ring-red-200"
                                                : "border-gray-200 focus:ring-2 focus:border-transparent"
                                        }`}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                {idError && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {idError}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        비밀번호
                                    </h3>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setPasswordError("");
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="비밀번호를 입력하세요"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                                            passwordError
                                                ? "border-red-300 focus:ring-red-200"
                                                : "border-gray-200 focus:ring-2 focus:border-transparent"
                                        }`}
                                    />
                                </div>
                                {passwordError && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {passwordError}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="rememberId"
                                    checked={rememberId}
                                    onChange={(e) =>
                                        setRememberId(e.target.checked)
                                    }
                                    className="w-5 h-5 rounded-md border border-gray-300 text-[#8B85E9] focus:ring-[#8B85E9]"
                                />
                                <label
                                    htmlFor="rememberId"
                                    className="text-gray-600 text-sm"
                                >
                                    아이디 저장
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-xl transform hover:scale-105 ${
                                    isLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-[#8B85E9]"
                                }`}
                                style={{
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
                                {isLoading ? "로그인 중..." : "로그인"}
                            </button>

                            <div className="pt-4 text-center space-y-2">
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

                            <div className="pt-2 text-center space-y-2">
                                <p className="text-sm text-gray-600">
                                    <Link
                                        to="/findAcc"
                                        className="text-[#8B85E9] hover:underline"
                                    >
                                        아이디/비밀번호 찾기
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

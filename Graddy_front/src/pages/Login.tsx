import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { User, Lock, AlertCircle, Check } from "lucide-react";

const Login: React.FC = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [rememberId, setRememberId] = useState(false);
    const [idError, setIdError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [hintMessage, setHintMessage] = useState("");
    const [showHint, setShowHint] = useState(false);

    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error("Login 컴포넌트는 AuthProvider 내에서 사용되어야 합니다.");
    }
    const { login } = authContext;

    useEffect(() => {
        const savedId = localStorage.getItem("savedId");
        if (savedId) {
        setId(savedId);
        setRememberId(true);
        }
    }, []);

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

    const loginBtn = async () => {
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

        try {
        login();

        if (rememberId) {
            localStorage.setItem("savedId", id);
        } else {
            localStorage.removeItem("savedId");
        }

        setHintMessage("로그인 성공! 환영합니다 🎉");
        navigate("/");
        } catch {
        setPasswordError("로그인에 실패했습니다.");
        setHintMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
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
                <h2 className="text-2xl font-bold mb-2 text-left">로그인</h2>
                <p className="opacity-90 text-sm text-left">
                계정에 로그인하고 다양한 서비스를 이용해보세요
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

                {/* 아이디 입력 */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    아이디
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="text"
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
                    />
                </div>
                {idError && (
                    <p className="text-red-500 text-sm mt-1">{idError}</p>
                )}
                </div>

                {/* 비밀번호 입력 */}
                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    비밀번호
                </label>
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
                    placeholder="비밀번호를 입력하세요"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200 ${
                        passwordError
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-200 focus:ring-2 focus:border-transparent"
                    }`}
                    />
                </div>
                {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
                </div>

                {/* 아이디 저장 */}
                <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="rememberId"
                    checked={rememberId}
                    onChange={(e) => setRememberId(e.target.checked)}
                    className="w-5 h-5 rounded-md border border-gray-300 text-[#8B85E9] focus:ring-[#8B85E9]"
                />
                <label htmlFor="rememberId" className="text-gray-600 text-sm">
                    아이디 저장
                </label>
                </div>

                {/* 로그인 버튼 */}
                <button
                onClick={loginBtn}
                className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-xl transform hover:scale-105"
                style={{
                    backgroundColor: "#8B85E9",
                    boxShadow:
                    "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#7d75e3")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#8B85E9")
                }
                >
                로그인
                </button>

                {/* 하단 링크 */}
                <div className="pt-4 text-center space-y-2">
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

export default Login;

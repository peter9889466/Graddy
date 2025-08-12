import React from "react";
import { useNavigate } from "react-router-dom";

interface LoginProps {
    id: string;
    password: string;
    idError: string;
    passwordError: string;
    onId: (value: string) => void;
    onPassword: (value: string) => void;
}

const Login: React.FC<LoginProps> = ({
    id,
    password,
    onId, 
    onPassword,
    idError, 
    passwordError
}) => {
    const navigate = useNavigate();

    const loginBtn = () => {
        navigate("/")
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-1/2">
                {/* 로그인 폼 */}
                <div
                    className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border-2 flex flex-col justify-center items-center h-[75vh]"
                    style={{ borderColor: "#8B85E9" }}
                >
                    <h2
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: "#8B85E9" }}
                    >
                        로그인
                    </h2>

                    <div className="space-y-6 w-3/5 mt-6">
                        {/* 아이디 */}
                        <div>
                            <input
                                type="text"
                                value={id}
                                onChange={(e) => onId(e.target.value)}
                                placeholder="아이디"
                                className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent ${
                                    idError ? "border-red-500" : ""
                                }`}
                                style={{
                                    borderColor: idError
                                        ? "#EF4444"
                                        : "#8B85E9",
                                }}
                                onFocus={(e) => {
                                    e.target.style.boxShadow = idError
                                        ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
                                        : "0 0 0 2px rgba(139, 133, 233, 0.2)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => onPassword(e.target.value)}
                                placeholder="비밀번호"
                                className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent ${
                                    passwordError ? "border-red-500" : ""
                                }`}
                                style={{
                                    borderColor: passwordError ? "#EF4444" : "#8B85E9",
                                }}
                                onFocus={(e) => {
                                    e.target.style.boxShadow = passwordError
                                        ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
                                        : "0 0 0 2px rgba(139, 133, 233, 0.2)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        {/* 아이디 저장 체크박스 */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="rememberId"
                                className="w-5 h-5 rounded-full border border-gray-400 text-[#8B85E9] focus:ring-[#8B85E9]"
                            />
                            <label htmlFor="rememberId" className="text-gray-600 text-sm">
                                아이디 저장
                            </label>
                        </div>

                        {/* 로그인 버튼 */}
                        <div className="pt-4">
                            <button
                                onClick={loginBtn}
                                className="w-full py-3 px-6 text-white rounded-full font-medium transition-all duration-200 hover:opacity-90 transform hover:scale-[1.02]"
                                style={{ backgroundColor: "#8B85E9" }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#7A73E0";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#8B85E9";
                                }}
                            >
                                로그인
                            </button>
                        </div>

                        {/* 하단 링크 */}
                        <div className="mt-4 text-center space-y-2">
                            <p className="text-sm text-gray-600">
                                아직 회원이 아니신가요?{" "}
                                <a href="/join" className="text-[#8B85E9] hover:underline">
                                    회원가입
                                </a>
                            </p>
                            <p className="text-sm">
                                <a href="/find-password" className="text-[#8B85E9] hover:underline">
                                    비밀번호 찾기
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
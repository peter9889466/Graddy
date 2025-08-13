import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [rememberId, setRememberId] = useState(false);
    const [idError, setIdError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();

    // useContext를 사용하여 AuthContext에서 login 함수를 가져옵니다.
    const authContext = useContext(AuthContext);

    // TypeScript 환경에서 authContext가 null일 경우를 대비한 안전 장치입니다.
    if (!authContext) {
        throw new Error('Login 컴포넌트는 AuthProvider 내에서 사용되어야 합니다.');
    }
    const { login } = authContext;

    useEffect(() => {
        const savedId = localStorage.getItem("savedId");
        if (savedId) {
            setId(savedId);
            setRememberId(true);
        }
    }, []);

    const loginBtn = async () => {
        if (!id) {
            setIdError("아이디를 입력하세요.");
            return;
        }
        if (!password) {
            setPasswordError("비밀번호를 입력하세요.");
            return;
        }

        try {
            // 실제 로그인 로직 (예: API 호출)은 여기에 구현하세요.
            // 아래 코드는 로그인에 성공했다고 가정합니다.
            
            // 로그인 성공 시 AuthContext의 login 함수를 호출하여 전역 상태를 업데이트합니다.
            login();

            if (rememberId) {
                localStorage.setItem("savedId", id);
            } else {
                localStorage.removeItem("savedId");
            }
            
            navigate("/");
        } catch {
            setPasswordError("로그인에 실패했습니다.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-1/2">
                <div
                    className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border-2 flex flex-col justify-center items-center h-[75vh]"
                    style={{ borderColor: "#8B85E9" }}
                >
                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: "#8B85E9" }}>
                        로그인
                    </h2>

                    <div className="space-y-6 w-3/5 mt-6">
                        {/* 아이디 */}
                        <div>
                            <input
                                type="text"
                                value={id}
                                onChange={(e) => {
                                    setId(e.target.value);
                                    setIdError("");
                                }}
                                placeholder="아이디"
                                className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent ${
                                    idError ? "border-red-500" : ""
                                }`}
                                style={{
                                    borderColor: idError ? "#EF4444" : "#8B85E9",
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
                            {idError && <p className="text-red-500 text-sm mt-1">{idError}</p>}
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError("");
                                }}
                                placeholder="비밀번호"
                                className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent ${
                                    passwordError ? "border-red-500" : ""
                                }`}
                                style={{
                                    borderColor: passwordError
                                        ? "#EF4444"
                                        : "#8B85E9",
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
                            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                        </div>

                        {/* 아이디 저장 체크박스 */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="rememberId"
                                checked={rememberId}
                                onChange={(e) => setRememberId(e.target.checked)}
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
                                <Link to="/join" className="text-[#8B85E9] hover:underline">
                                    회원가입
                                </Link>
                            </p>
                            <p className="text-sm">
                                <Link to="/find-password" className="text-[#8B85E9] hover:underline">
                                    비밀번호 찾기
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
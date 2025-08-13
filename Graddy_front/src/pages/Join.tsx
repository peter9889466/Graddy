import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Join: React.FC = () => {
    const navigate = useNavigate();

    // 상태 관리
    const [id, setId] = useState("");
    const [idError, setIdError] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [nicknameError, setNicknameError] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [notificationPreference, setNotificationPreference] = useState<"email" | "phone">("email");

    // 아이디 중복 확인 (예시 로직)
    const onCheckId = () => {
        if (id.trim() === "") {
            setIdError("아이디를 입력하세요.");
        } else {
            setIdError(""); // 실제 API 연동 시 결과에 따라 메시지 처리
            alert("사용 가능한 아이디입니다.");
        }
    };

    // 닉네임 중복 확인 (예시 로직)
    const onCheckNickname = () => {
        if (nickname.trim() === "") {
            setNicknameError("닉네임을 입력하세요.");
        } else {
            setNicknameError("");
            alert("사용 가능한 닉네임입니다.");
        }
    };

    // 회원가입 다음 단계
    const nextPage = () => {
        if (!id || !password || !confirmPassword || !name || !nickname) {
            alert("모든 필수 정보를 입력해주세요.");
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
            return;
        }
        setPasswordError("");

        // 회원가입 성공 시 다음 페이지로 이동
        navigate("/join2", {
            state: {
                id,
                password,
                name,
                nickname,
                email,
                phoneNumber,
                notificationPreference
            }
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-1/2">
                <div
                    className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border-2 flex flex-col justify-center items-center h-[80vh]"
                    style={{ borderColor: "#8B85E9" }}
                >
                    <h2
                        className="text-xl sm:text-2xl font-bold"
                        style={{ color: "#8B85E9" }}
                    >
                        회원가입
                    </h2>

                    <div className="space-y-6 w-3/5 mt-6">
                        {/* 아이디 */}
                        <div className="relative">
                            <input
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="아이디"
                                className={`w-full pr-[100px] px-4 py-3 border rounded-full ${
                                    idError ? "border-red-500" : ""
                                }`}
                                style={{ borderColor: idError ? "#EF4444" : "#8B85E9" }}
                            />
                            <button
                                onClick={onCheckId}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-xs text-white rounded-full font-medium"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                중복확인
                            </button>
                            {idError && (
                                <p className="text-red-500 text-xs mt-1">{idError}</p>
                            )}
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호"
                                className={`w-full px-4 py-3 border rounded-full ${
                                    passwordError ? "border-red-500" : ""
                                }`}
                                style={{ borderColor: passwordError ? "#EF4444" : "#8B85E9" }}
                            />
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                                <p>• 영문/숫자/문자 중 2가지 이상 포함</p>
                                <p>• 8자 이상 32자 이하 입력</p>
                            </div>
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="비밀번호 확인"
                                className={`w-full px-4 py-3 border rounded-full ${
                                    passwordError ? "border-red-500" : ""
                                }`}
                                style={{ borderColor: passwordError ? "#EF4444" : "#8B85E9" }}
                            />
                            {passwordError && (
                                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                            )}
                        </div>

                        {/* 이름 */}
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름"
                            className="w-full px-4 py-3 border rounded-full"
                            style={{ borderColor: "#8B85E9" }}
                        />

                        {/* 닉네임 */}
                        <div className="relative">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임"
                                className={`w-full pr-[100px] px-4 py-3 border rounded-full ${
                                    nicknameError ? "border-red-500" : ""
                                }`}
                                style={{ borderColor: nicknameError ? "#EF4444" : "#8B85E9" }}
                            />
                            <button
                                onClick={onCheckNickname}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-xs text-white rounded-full font-medium"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                중복확인
                            </button>
                            {nicknameError && (
                                <p className="text-red-500 text-xs mt-1">{nicknameError}</p>
                            )}
                        </div>

                        {/* 알림 수신 방법 */}
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={notificationPreference === "email"}
                                    onChange={() => setNotificationPreference("email")}
                                />
                                <span>이메일</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    checked={notificationPreference === "phone"}
                                    onChange={() => setNotificationPreference("phone")}
                                />
                                <span>전화번호</span>
                            </label>
                        </div>

                        {/* 이메일/전화번호 입력 */}
                        {notificationPreference === "email" ? (
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일"
                                className="w-full px-4 py-3 border rounded-full"
                                style={{ borderColor: "#8B85E9" }}
                            />
                        ) : (
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="전화번호"
                                className="w-full px-4 py-3 border rounded-full"
                                style={{ borderColor: "#8B85E9" }}
                            />
                        )}

                        {/* 다음 버튼 */}
                        <div className="pt-4 flex justify-center">
                            <button
                                onClick={nextPage}
                                className="w-1/3 py-3 px-6 text-white rounded-full font-medium"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                다음
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Join;

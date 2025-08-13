import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Join2 from "./Join2";

interface JoinProps {
    id?: string;
    idError?: string;
    password?: string;
    confirmPassword?: string;
    passwordError?: string;
    name?: string;
    nickname?: string;
    nicknameError?: string;
    email?: string;
    phoneNumber?: string;
    notificationPreference?: "email" | "phone";
    onId?: (value: string) => void;
    onCheckId?: () => void;
    onPassword?: (value: string) => void;
    onConfirmPassword?: (value: string) => void;
    onName?: (value: string) => void;
    onNickname?: (value: string) => void;
    onCheckNickname?: () => void;
    onEmail?: (value: string) => void;
    onPhoneNumber?: (value: string) => void;
    onNotificationPreference?: (value: "email" | "phone") => void;
}

const Join: React.FC<JoinProps> = ({
    id = "",
    idError = "",
    password = "",
    confirmPassword = "",
    passwordError = "",
    name = "",
    nickname = "",
    nicknameError = "",
    email = "",
    phoneNumber = "",
    notificationPreference = "email",
    onId = () => {},
    onCheckId = () => {},
    onPassword = () => {},
    onConfirmPassword = () => {},
    onName = () => {},
    onNickname = () => {},
    onCheckNickname = () => {},
    onEmail = () => {},
    onPhoneNumber = () => {},
    onNotificationPreference = () => {},
}) => {
    const navigate = useNavigate();

    const nextPage = () => {
        navigate("/join2");
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-1/2">
                {/* 회원가입 폼 */}
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
                        <div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={id}
                                    onChange={(e) => onId(e.target.value)}
                                    placeholder="아이디"
                                    className={`w-full pr-[100px] px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent ${
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
                                <button
                                    onClick={onCheckId}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-xs text-white rounded-full font-medium transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                                    style={{
                                        backgroundColor: "#8B85E9",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#7A73E0";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#8B85E9";
                                    }}
                                >
                                    중복확인
                                </button>
                            </div>
                            {idError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <span className="mr-1">⚠️</span>
                                    {idError}
                                </p>
                            )}
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
                            {/* Password requirements text */}
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                                <p>• 영문/숫자/문자 중 2가지 이상 포함</p>
                                <p>• 8자 이상 32자 이하 입력 (공백 제외)</p>
                            </div>
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    onConfirmPassword(e.target.value)
                                }
                                placeholder="비밀번호 확인"
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
                            {passwordError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <span className="mr-1">⚠️</span>
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* 이름 */}
                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => onName(e.target.value)}
                                placeholder="이름"
                                className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent"
                                style={{
                                    borderColor: "#8B85E9",
                                }}
                                onFocus={(e) => {
                                    e.target.style.boxShadow =
                                        "0 0 0 2px rgba(139, 133, 233, 0.2)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        {/* 닉네임 */}
                        <div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => onNickname(e.target.value)}
                                    placeholder="닉네임"
                                    className={`w-full pr-[100px] px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent ${
                                        nicknameError ? "border-red-500" : ""
                                    }`}
                                    style={{
                                        borderColor: nicknameError
                                            ? "#EF4444"
                                            : "#8B85E9",
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.boxShadow = nicknameError
                                            ? "0 0 0 2px rgba(239, 68, 68, 0.2)"
                                            : "0 0 0 2px rgba(139, 133, 233, 0.2)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                                <button
                                    onClick={onCheckNickname}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-xs text-white rounded-full font-medium transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                                    style={{
                                        backgroundColor: "#8B85E9",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#7A73E0";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            "#8B85E9";
                                    }}
                                >
                                    중복확인
                                </button>
                            </div>
                            {nicknameError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <span className="mr-1">⚠️</span>
                                    {nicknameError}
                                </p>
                            )}
                        </div>

                        {/* 알림 수신 방법 선택 */}
                        <div className="flex flex-col">
                            <span className="text-gray-700 text-sm mb-2 font-medium">
                                알림 수신 방법
                            </span>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="notification"
                                        value="email"
                                        checked={
                                            notificationPreference === "email"
                                        }
                                        onChange={() =>
                                            onNotificationPreference("email")
                                        }
                                        className="form-radio h-4 w-4 text-indigo-500 focus:ring-indigo-500"
                                        style={{ borderColor: "#8B85E9" }}
                                    />
                                    <span className="text-gray-700 text-sm">
                                        이메일
                                    </span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="notification"
                                        value="phone"
                                        checked={
                                            notificationPreference === "phone"
                                        }
                                        onChange={() =>
                                            onNotificationPreference("phone")
                                        }
                                        className="form-radio h-4 w-4 text-indigo-500 focus:ring-indigo-500"
                                        style={{ borderColor: "#8B85E9" }}
                                    />
                                    <span className="text-gray-700 text-sm">
                                        전화번호
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* 이메일 또는 전화번호 입력 (조건부 렌더링) */}
                        {notificationPreference === "email" ? (
                            <div className="transition-all duration-300">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => onEmail(e.target.value)}
                                    placeholder="이메일"
                                    className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent"
                                    style={{
                                        borderColor: "#8B85E9",
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.boxShadow =
                                            "0 0 0 2px rgba(139, 133, 233, 0.2)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="transition-all duration-300">
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        onPhoneNumber(e.target.value)
                                    }
                                    placeholder="전화번호"
                                    className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent"
                                    style={{
                                        borderColor: "#8B85E9",
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.boxShadow =
                                            "0 0 0 2px rgba(139, 133, 233, 0.2)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        )}

                        {/* 저장 버튼 */}
                        <div className="pt-4 flex justify-center">
                            <button
                                onClick={nextPage}
                                className="w-1/3 py-3 px-6 text-white rounded-full font-medium transition-all duration-200 hover:opacity-90 transform hover:scale-[1.02]"
                                style={{
                                    backgroundColor: "#8B85E9",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#7A73E0";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "#8B85E9";
                                }}
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

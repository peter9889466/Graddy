import React from "react";

interface ProfileEditFormProps {
    password: string;
    confirmPassword: string;
    passwordError: string;
    name: string;
    nickname: string;
    email: string;
    onPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onNameChange: (value: string) => void;
    onNicknameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onUpdateProfile: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
    password,
    confirmPassword,
    passwordError,
    name,
    nickname,
    email,
    onPasswordChange,
    onConfirmPasswordChange,
    onNameChange,
    onNicknameChange,
    onEmailChange,
    onUpdateProfile,
}) => {
    return (
        <div className="space-y-6 sm:space-y-8">
            <h2
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "#8B85E9" }}
            >
                회원정보 수정
            </h2>

            {/* 회원정보 수정 폼 */}
            <div
                className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border-2"
                style={{ borderColor: "#8B85E9" }}
            >
                <div className="space-y-6">
                    {/* 아이디 */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#8B85E9" }}
                        >
                            아이디
                        </label>
                        <input
                            type="text"
                            value="user123" // 임시 데이터
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 border rounded-full text-gray-500 cursor-not-allowed"
                            style={{
                                borderColor: "#E5E7EB",
                            }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            아이디는 변경할 수 없습니다.
                        </p>
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#8B85E9" }}
                        >
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            placeholder="새 비밀번호를 입력하세요 (변경 시에만)"
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
                    </div>

                    {/* 비밀번호 확인 */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#8B85E9" }}
                        >
                            비밀번호 확인
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                onConfirmPasswordChange(e.target.value)
                            }
                            placeholder="비밀번호를 다시 입력하세요"
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
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#8B85E9" }}
                        >
                            이름
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
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
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#8B85E9" }}
                        >
                            닉네임
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => onNicknameChange(e.target.value)}
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

                    {/* 이메일 */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#8B85E9" }}
                        >
                            이메일
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
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

                    {/* 저장 버튼 */}
                    <div className="pt-4">
                        <button
                            onClick={onUpdateProfile}
                            className="w-full py-3 px-6 text-white rounded-full font-medium transition-all duration-200 hover:opacity-90 transform hover:scale-[1.02]"
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
                            회원정보 수정
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditForm;

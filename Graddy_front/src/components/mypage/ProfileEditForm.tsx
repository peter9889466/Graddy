import React, { useState, useEffect } from "react";
import {
    getUserProfile,
    updateUserProfile,
    UserProfile,
    UserProfileUpdate,
} from "../../services/userService";

interface ProfileEditFormProps {
    onProfileUpdate: (profile: UserProfile) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
    onProfileUpdate,
}) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 프로필 정보 로드
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userProfile = await getUserProfile();
                setProfile(userProfile);
            } catch (error) {
                console.error("프로필 조회 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // 비밀번호 유효성 검사
    const validatePassword = (pwd: string, confirmPwd: string) => {
        if (pwd && pwd.length < 8) {
            return "비밀번호는 8자 이상이어야 합니다.";
        }
        if (pwd && confirmPwd && pwd !== confirmPwd) {
            return "비밀번호가 일치하지 않습니다.";
        }
        return "";
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setPasswordError(validatePassword(value, confirmPassword));
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        setPasswordError(validatePassword(password, value));
    };

    const handleUpdateProfile = async () => {
        if (!profile) return;

        if (password && passwordError) {
            alert("비밀번호를 확인해주세요.");
            return;
        }

        setIsSaving(true);
        try {
            const updateData: UserProfileUpdate = {
                nickname: profile.nickname,
                phone: profile.phone,
            };

            if (password) {
                updateData.password = password;
            }

            const updatedProfile = await updateUserProfile(updateData);
            onProfileUpdate(updatedProfile);
            alert("프로필이 성공적으로 수정되었습니다.");

            // 비밀번호 필드 초기화
            setPassword("");
            setConfirmPassword("");
            setPasswordError("");
        } catch (error) {
            console.error("프로필 수정 실패:", error);
            alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85E9]"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">
                    프로필 정보를 불러올 수 없습니다.
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold">회원정보 수정</h2>

            {/* 회원정보 수정 폼 */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="space-y-6">
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
                            value={profile.name}
                            disabled
                            className="w-full px-4 py-3 bg-gray-100 border rounded-full text-gray-500 cursor-not-allowed"
                            style={{
                                borderColor: "#E5E7EB",
                            }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            이름은 변경할 수 없습니다.
                        </p>
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
                            value={profile.nickname}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    nickname: e.target.value,
                                })
                            }
                            placeholder="변경할 닉네임을 입력해주세요"
                            className="w-full px-4 py-3 border rounded-full"
                            style={{
                                borderColor: "#777777",
                            }}
                        />
                    </div>

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
                            value={profile.userId}
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
                            onChange={(e) =>
                                handlePasswordChange(e.target.value)
                            }
                            placeholder="변경할 비밀번호를 입력해주세요"
                            className={`w-full px-4 py-3 border rounded-full ${
                                passwordError ? "border-red-500" : ""
                            }`}
                            style={{
                                borderColor: passwordError
                                    ? "#EF4444"
                                    : "#777777",
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
                                handleConfirmPasswordChange(e.target.value)
                            }
                            placeholder="비밀번호를 다시 입력하세요"
                            className={`w-full px-4 py-3 border rounded-full ${
                                passwordError ? "border-red-500" : ""
                            }`}
                            style={{
                                borderColor: passwordError
                                    ? "#EF4444"
                                    : "#777777",
                            }}
                        />
                        {passwordError && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                                <span className="mr-1">⚠️</span>
                                {passwordError}
                            </p>
                        )}
                    </div>

                    {/* 전화번호 */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            style={{ color: "#8B85E9" }}
                        >
                            전화번호
                        </label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    phone: e.target.value,
                                })
                            }
                            placeholder="전화번호를 입력해주세요 (예: 010-1234-5678)"
                            className="w-full px-4 py-3 border rounded-full"
                            style={{
                                borderColor: "#777777",
                            }}
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="pt-4">
                        <button
                            onClick={handleUpdateProfile}
                            disabled={isSaving}
                            className="w-full py-3 px-6 text-white rounded-full font-medium transition-all duration-200 hover:opacity-90 transform hover:scale-[1.02]"
                            style={{
                                backgroundColor: isSaving
                                    ? "#9CA3AF"
                                    : "#8B85E9",
                            }}
                            onMouseEnter={(e) => {
                                if (!isSaving) {
                                    e.currentTarget.style.backgroundColor =
                                        "#7A73E0";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSaving) {
                                    e.currentTarget.style.backgroundColor =
                                        "#8B85E9";
                                }
                            }}
                        >
                            {isSaving ? "수정 중..." : "회원정보 수정"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditForm;

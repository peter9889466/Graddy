import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Eye, EyeOff, Check, X, AlertCircle, User, Lock, Phone } from "lucide-react";

interface ProfileEditFormProps {
    name: string;
    initialNickname: string;
    initialPhone: string;
    initialAvailableDays?: string[];
    initialAvailableTime?: string;
    onUpdateProfile: (data: any) => Promise<void>;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
    name,
    initialNickname,
    initialPhone,
    initialAvailableDays,
    initialAvailableTime,
    onUpdateProfile,
}) => {
    // Input states
    const [nickname, setNickname] = useState(initialNickname);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [phonePrefix, setPhonePrefix] = useState("010");
    const [phoneMiddle, setPhoneMiddle] = useState("");
    const [phoneLast, setPhoneLast] = useState("");

    const [preferredDays, setPreferredDays] = useState<string[]>(initialAvailableDays || []);
    const [preferredStartTime, setPreferredStartTime] = useState<string>(initialAvailableTime ? initialAvailableTime.split('-')[0] : "");
    const [preferredEndTime, setPreferredEndTime] = useState<string>(initialAvailableTime ? initialAvailableTime.split('-')[1] : "");

    // Verification and error states
    const [nicknameError, setNicknameError] = useState("");
    const [nicknameChecked, setNicknameChecked] = useState(true); // Assume initial nickname is valid
    const [passwordError, setPasswordError] = useState("");
    const [telError, setTelError] = useState("");

    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [verificationTimer, setVerificationTimer] = useState(0);

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hintMessage, setHintMessage] = useState<string>("");
    const [showHint, setShowHint] = useState(false);

    const phoneMiddleRef = useRef<HTMLInputElement>(null);
    const phoneLastRef = useRef<HTMLInputElement>(null);

    // Populate phone fields from initial data
    useEffect(() => {
        console.log("useEffect for initialPhone triggered. initialPhone:", initialPhone);
        if (initialPhone) {
            // 하이픈 제거 후 처리
            const cleanPhone = initialPhone.replace(/-/g, '');
            console.log("Cleaned phone:", cleanPhone);


            if (cleanPhone.length === 11) {
                const prefix = cleanPhone.substring(0, 3);
                const middle = cleanPhone.substring(3, 7);
                const last = cleanPhone.substring(7, 11);
                setPhonePrefix(prefix);
                setPhoneMiddle(middle);
                setPhoneLast(last);
                console.log("Phone parts set:", { prefix, middle, last });

                // 초기 전화번호가 있으면 인증된 것으로 간주
                setIsVerified(true);
                console.log("setIsVerified(true) called because initialPhone is valid.");
            } else {
                console.log("Cleaned phone is not 11 digits:", cleanPhone);
                // 길이가 맞지 않으면 인증 상태 false로 설정
                setIsVerified(false);
            }
        } else {
            console.log("initialPhone is empty or undefined");
            // initialPhone이 없으면 인증 상태 false로 설정
            setIsVerified(false);
        }
    }, [initialPhone]);

    const fullPhoneNumber = phonePrefix + phoneMiddle + phoneLast;
    const isPhoneModified = initialPhone ? fullPhoneNumber !== initialPhone : false;

    // Reset verification status if phone number is changed
    useEffect(() => {
        if (isPhoneModified) {
            setIsVerified(false);
        }
    }, [isPhoneModified]);


    // Hint message timer
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

    // Verification code timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (verificationTimer > 0) {
            interval = setInterval(() => {
                setVerificationTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [verificationTimer]);

    // Nickname check
    const onCheckNickname = async () => {
        if (!nickname.trim()) {
            setNicknameError("닉네임을 입력해주세요.");
            return;
        }
        if (nickname === initialNickname) {
            setNicknameChecked(true);
            setHintMessage("현재 닉네임입니다.");
            return;
        }
        try {
            const response = await axios.get("/api/join/check-nick", {
                params: { nick: nickname },
                validateStatus: () => true,
            });
            if (response.data.status === 200 && response.data.data.isAvailable) {
                setNicknameError("");
                setNicknameChecked(true);
                setHintMessage("사용 가능한 닉네임입니다!");
            } else {
                setNicknameError("이미 사용 중인 닉네임입니다.");
                setNicknameChecked(false);
            }
        } catch (error) {
            setNicknameError("닉네임 중복 확인 중 오류가 발생했습니다.");
            setNicknameChecked(false);
        }
    };

    // Phone number verification
    const handleSendVerification = async () => {
        if (isLoading) return;
        const phoneNumber = phonePrefix + phoneMiddle + phoneLast;
        if (phoneNumber.length !== 11) {
            setHintMessage("올바른 전화번호를 입력해주세요!");
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post("/api/api/phone-verification/unified", {
                tel: phoneNumber,
                purpose: "UPDATE", // Changed purpose
            }, {
                validateStatus: () => true,
            });
            if (response.data.status === 200 && response.data.data.smsSent) {
                setTelError("");
                setShowVerificationInput(true);
                setVerificationTimer(300); // 5 minutes
                setHintMessage("인증번호가 발송되었습니다!");
            } else {
                setTelError(response.data.message || "인증번호 발송에 실패했습니다.");
            }
        } catch (error) {
            setTelError("처리 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (verificationCode.trim().length !== 6) {
            setHintMessage("인증번호 6자리를 입력해주세요!");
            return;
        }
        const phoneNumber = phonePrefix + phoneMiddle + phoneLast;
        try {
            const response = await axios.post("/api/auth/verify-code", {
                phoneNumber: phoneNumber,
                code: verificationCode,
            }, {
                validateStatus: () => true,
            });
            if (response.data.status === 200) {
                setIsVerified(true);
                setVerificationTimer(0);
                setHintMessage("전화번호 인증이 완료되었습니다!");
            } else {
                setHintMessage(response.data.message || "인증번호가 올바르지 않거나 만료되었습니다.");
            }
        } catch (error) {
            setHintMessage("인증 확인 중 오류가 발생했습니다.");
        }
    };

    const handleDayToggle = (day: string) => {
        console.log("handleDayToggle called with day:", day);
        setPreferredDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        console.log("formatTime called with seconds:", seconds);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleUpdate = async () => {
        // 비밀번호 확인만 체크 (비밀번호를 입력한 경우에만)
        if (password && password !== confirmPassword) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 전화번호 조합 (빈 값도 허용)
        const fullPhoneNumber = phonePrefix && phoneMiddle && phoneLast
            ? phonePrefix + phoneMiddle + phoneLast
            : "";

        // 시간 검증 (시간을 둘 다 입력한 경우에만)
        if (preferredStartTime && preferredEndTime && parseInt(preferredStartTime) >= parseInt(preferredEndTime)) {
            setHintMessage("종료 시간은 시작 시간보다 나중이어야 합니다.");
            return;
        }

        // 요일을 숫자로 변환하는 함수
        const convertDaysToNumbers = (days: string[]): number[] => {
            const dayMap: { [key: string]: number } = {
                "월": 1, "화": 2, "수": 3, "목": 4, 
                "금": 5, "토": 6, "일": 7
            };
            return days.map(day => dayMap[day]).filter(num => num);
        };

        // 업데이트 데이터 구성 - 백엔드 API 스펙에 맞게 수정
        const updateData: any = {};

        // 닉네임 (변경된 경우만)
        if (nickname && nickname.trim() && nickname.trim() !== initialNickname) {
            updateData.newNickname = nickname.trim();
        }

        // 전화번호 (변경된 경우만)
        if (fullPhoneNumber && fullPhoneNumber !== initialPhone) {
            updateData.newTel = fullPhoneNumber;
        }

        // 선호 요일 (숫자 배열로 변환)
        if (preferredDays && preferredDays.length > 0) {
            updateData.availableDays = convertDaysToNumbers(preferredDays);
        }

        // 시작 시간 (숫자로 변환)
        if (preferredStartTime) {
            updateData.soltStartHour = parseInt(preferredStartTime);
        }

        // 종료 시간 (숫자로 변환)
        if (preferredEndTime) {
            updateData.soltEndHour = parseInt(preferredEndTime);
        }

        // 비밀번호 (입력한 경우만)
        if (password && password.trim()) {
            updateData.newPassword = password.trim();
        }

        console.log("전송할 데이터 (백엔드 스펙 맞춤):", updateData);

        // 최소한 하나의 변경사항이 있는지 확인
        if (Object.keys(updateData).length === 0) {
            setHintMessage("변경할 정보를 입력해주세요.");
            return;
        }

        try {
            await onUpdateProfile(updateData);
        } catch (error) {
            console.error("업데이트 실패:", error);
            setHintMessage("회원정보 수정에 실패했습니다.");
        }
    };

    const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];
    const hours = Array.from({ length: 25 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <div className="space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold">회원정보 수정</h2>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="space-y-6">
                    {/* Name (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8B85E9" }}>이름</label>
                        <input type="text" value={name} disabled className="w-full px-4 py-3 bg-gray-100 border rounded-full text-gray-500 cursor-not-allowed" />
                    </div>

                    {/* Nickname */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8B85E9" }}>닉네임</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => {
                                    setNickname(e.target.value);
                                    setNicknameChecked(false);
                                }}
                                placeholder="변경할 닉네임을 입력해주세요"
                                className="w-full px-4 py-3 border rounded-full"
                            />
                            <button onClick={onCheckNickname} className="px-5 h-12 min-w-[90px] text-sm text-white whitespace-nowrap rounded-lg font-medium" style={{ backgroundColor: "#8B85E9" }}>중복확인</button>
                        </div>
                        {nicknameError && <p className="text-red-500 text-xs mt-1">{nicknameError}</p>}
                        {nicknameChecked && !nicknameError && <p className="text-green-500 text-xs mt-1">사용 가능한 닉네임입니다.</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8B85E9" }}>새 비밀번호</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="변경할 경우에만 입력하세요"
                            className="w-full px-4 py-3 border rounded-full"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8B85E9" }}>새 비밀번호 확인</label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호를 다시 입력하세요"
                            className={`w-full px-4 py-3 border rounded-full ${passwordError ? "border-red-500" : ""}`}
                        />
                        {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8B85E9" }}>전화번호</label>
                        <div className="flex gap-2 items-center">
                            <select value={phonePrefix} onChange={e => setPhonePrefix(e.target.value)} className="w-28 px-4 py-3 border rounded-full bg-white">
                                <option value="010">010</option>
                                <option value="011">011</option>
                            </select>
                            -
                            <input type="tel" ref={phoneMiddleRef} value={phoneMiddle} onChange={e => setPhoneMiddle(e.target.value.replace(/\D/g, ""))} maxLength={4} className="w-full px-4 py-3 border rounded-full text-center" />
                            -
                            <input type="tel" ref={phoneLastRef} value={phoneLast} onChange={e => setPhoneLast(e.target.value.replace(/\D/g, ""))} maxLength={4} className="w-full px-4 py-3 border rounded-full text-center" />
                        </div>
                        {isPhoneModified &&
                            <button onClick={handleSendVerification} disabled={isLoading || isVerified} className="w-full mt-2 py-3 px-6 text-white rounded-full" style={{ backgroundColor: isVerified ? "#4ade80" : "#8B85E9" }}>
                                {isVerified ? "인증 완료" : "인증번호 발송"}
                            </button>
                        }
                        {telError && <p className="text-red-500 text-xs mt-1">{telError}</p>}
                    </div>

                    {/* Verification Code */}
                    {isPhoneModified && showVerificationInput && !isVerified && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">인증번호를 입력해주세요</span>
                                {verificationTimer > 0 && <span className="text-sm text-red-500 font-mono">{formatTime(verificationTimer)}</span>}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                                    maxLength={6}
                                    placeholder="6자리 인증번호"
                                    className="flex-1 px-4 py-3 border rounded-xl"
                                />
                                <button onClick={handleVerifyCode} className="px-6 py-3 text-white rounded-xl" style={{ backgroundColor: "#8B85E9" }}>
                                    인증 확인
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Preferred Days */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8B85E9" }}>선호 요일</label>
                        <div className="flex flex-wrap gap-2">
                            {daysOfWeek.map(day => (
                                <button
                                    key={day}
                                    onClick={() => handleDayToggle(day)}
                                    className={`px-4 py-2 border rounded-full text-sm ${preferredDays.includes(day) ? "bg-indigo-300 text-white" : "bg-white text-gray-700"}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Time */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#8B85E9" }}>선호 시간대</label>
                        <div className="flex items-center gap-2">
                            <select value={preferredStartTime} onChange={e => setPreferredStartTime(e.target.value)} className="w-full px-4 py-3 border rounded-full bg-white">
                                <option value="">시작 시간</option>
                                {hours.map(hour => (
                                    <option key={`start-${hour}`} value={hour}>{hour}:00</option>
                                ))}
                            </select>
                            <span>~</span>
                            <select value={preferredEndTime} onChange={e => setPreferredEndTime(e.target.value)} className="w-full px-4 py-3 border rounded-full bg-white">
                                <option value="">종료 시간</option>
                                {hours.map(hour => (
                                    <option key={`end-${hour}`} value={hour}>{hour}:00</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Hint Message */}
                    {hintMessage && (
                        <div className={`transition-all duration-300 ${showHint ? "opacity-100" : "opacity-0"}`}>
                            <div className="flex items-center gap-2 p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                                <AlertCircle className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-medium text-emerald-800">{hintMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Update Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleUpdate}
                            disabled={isLoading}
                            className="w-full py-3 px-6 text-white rounded-full font-medium"
                            style={{ backgroundColor: isLoading ? "#9CA3AF" : "#8B85E9" }}
                        >
                            {isLoading ? "수정 중..." : "회원정보 수정"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditForm;
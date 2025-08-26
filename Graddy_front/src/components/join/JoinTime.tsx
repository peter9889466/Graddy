// Join의 세 번째 -> 시간대 선택

import React, { useState, useEffect } from "react";
import { Check, AlertCircle, CheckCircle, Clock, Sun, Moon, Sunset, Timer } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

interface DaySelection {
    [key: string]: boolean;
}

interface CustomTimeSlot {
    startTime: number | null;
    endTime: number | null;
}

interface LocationState {
    formData?: any;
    join2Data?: any;
}

interface JoinTimeProps {
    navigate: any;
    location: any;
    formData: any;
    interestData: any;
    onPrevious: () => void;
}

const JoinTime: React.FC<JoinTimeProps> = ({ 
    navigate, 
    location, 
    formData, 
    interestData, 
    onPrevious 
}) => {
    // State to manage day selections
    const [selectedDays, setSelectedDays] = useState<DaySelection>({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    });
    
    // State to manage custom time slot selection
    const [customTimeSlot, setCustomTimeSlot] = useState<CustomTimeSlot>({
        startTime: null,
        endTime: null
    });

    // State for managing hint messages displayed to the user.
    const [hintMessage, setHintMessage] = useState<string>("");
    // State to control hint message visibility.
    const [showHint, setShowHint] = useState(false);
    
    // 📌 수정: useLocation으로 전달받은 데이터 가져오기
    const locationState = location.state as LocationState | null;
    const join2Data = locationState?.join2Data;

    // Hides the hint message automatically after a delay.
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

    // Toggles day selection
    const toggleDay = (day: string) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    // Toggles all days selection
    const toggleAllDays = () => {
        const hasAnyDaySelected = Object.values(selectedDays).some(day => day);
        
        if (hasAnyDaySelected) {
            // If any day is selected, deselect all.
            const resetDays: DaySelection = {};
            Object.keys(selectedDays).forEach(day => {
                resetDays[day] = false;
            });
            setSelectedDays(resetDays);
            setHintMessage("모든 요일이 해제되었습니다!");
        } else {
            // If nothing is selected, select all.
            const allDays: DaySelection = {};
            Object.keys(selectedDays).forEach(day => {
                allDays[day] = true;
            });
            setSelectedDays(allDays);
            setHintMessage("모든 요일이 선택되었습니다!");
        }
    };

    // Sets custom time slot
    const setTimeSlot = (type: 'start' | 'end', hour: number) => {
        setCustomTimeSlot(prev => ({
            ...prev,
            [type === 'start' ? 'startTime' : 'endTime']: hour
        }));
    };

    // Validates time slot selection
    const isTimeSlotValid = () => {
        return customTimeSlot.startTime !== null && 
               customTimeSlot.endTime !== null && 
               customTimeSlot.startTime < customTimeSlot.endTime;
    };

    // Checks if start and end times are the same
    const areTimesSame = () => {
        return customTimeSlot.startTime !== null && 
               customTimeSlot.endTime !== null && 
               customTimeSlot.startTime === customTimeSlot.endTime;
    };

    // Calculates the total number of selected days.
    const getSelectedDayCount = () => {
        return Object.values(selectedDays).filter(day => day).length;
    };

    // Check if both day selection and time slot are complete
    const isFormComplete = () => {
        return getSelectedDayCount() > 0 && isTimeSlotValid();
    };

    // 회원가입 완료
    const completeSignup = async () => {
    const selectedDayCount = getSelectedDayCount();
    
    if (selectedDayCount === 0) {
        setHintMessage("최소 하나의 요일을 선택해주세요!");
        return;
    }

    if (!isTimeSlotValid()) {
        if (customTimeSlot.startTime === null || customTimeSlot.endTime === null) {
            setHintMessage("시작 시간과 마침 시간을 모두 입력해주세요!");
        } else if (areTimesSame()) {
            setHintMessage("시작 시간과 마침 시간이 같습니다!");
        } else {
            setHintMessage("시작 시간은 마침 시간보다 빨라야 합니다!");
        }
        return;
    }

    try {
        // 요일 매핑 (백엔드에서 1: 일요일, 2: 월요일, ..., 7: 토요일로 기대)
        const dayMap: Record<string, number> = {
            sunday: 1,
            monday: 2,
            tuesday: 3,
            wednesday: 4,
            thursday: 5,
            friday: 6,
            saturday: 7,
        };

        const availableDays = Object.entries(selectedDays)
            .filter(([_, selected]) => selected)
            .map(([day]) => dayMap[day]);

        // 📌 수정: 시간대 변환 로직 개선 (백엔드에서 Timestamp 형식 기대)
        const today = new Date();
        const toISOTime = (hour: number | null) => {
            if (hour === null) return null;
            const date = new Date(today);
            date.setHours(hour, 0, 0, 0);
            // 백엔드에서 기대하는 형식: "yyyy-MM-dd'T'HH:mm:ss"
            return date.toISOString().slice(0, 19); // "2024-01-01T10:00:00" 형식
        };

        const soltStart = toISOTime(customTimeSlot.startTime);
        const soltEnd = toISOTime(customTimeSlot.endTime);

        // 📌 수정: Join2에서 전달받은 관심사 데이터 올바르게 처리
        const interestsFromJoin2 = interestData?.selectedInterests || [];
        
        // 난이도 매핑
        const difficultyMapping: { [key: string]: number } = {
            "초급": 1,
            "중급": 2,
            "고급": 3
        };

        const mappedInterests = interestsFromJoin2.map((item: any) => ({
            interestId: item.id, // Long 타입으로 변환 필요
            interestLevel: difficultyMapping[item.difficulty] || 1
        }));

        // 📌 수정: 최종 Request Body 구조 정리 (백엔드 DTO에 맞게 수정)
        const requestBody = {
            // Join 단계 기본 정보
            userId: formData?.userId || formData?.id,
            password: formData?.password,
            name: formData?.name,
            nick: formData?.nickname || formData?.nick,
            tel: formData?.phoneNumber || formData?.tel,
            gitUrl: "", // 백엔드 DTO에 필수 필드로 있음
            userRefer: "", // 백엔드 DTO에 필수 필드로 있음
            alarmType: formData?.alarmType || false,
            
            // Join2 단계 관심사 정보
            interests: mappedInterests,
            
            // Join3 단계 시간대 정보
            availableDays,
            soltStart,
            soltEnd,
        };

        console.log("📤 회원가입 요청 데이터:", requestBody);

        // API 호출
        const response = await axios.post("http://localhost:8080/api/join", requestBody, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 201) {
            console.log("✅ 회원가입 성공:", response.data);
            setHintMessage("회원가입이 완료되었습니다!");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        }
    } catch (error: any) {
        console.error("❌ 회원가입 실패:", error);
        
        // 에러 메시지 상세화
        if (error.response) {
            console.error("서버 응답 에러:", error.response.data);
            const errorMessage = error.response.data.message || error.response.data.error || '서버 오류가 발생했습니다';
            setHintMessage(`회원가입 실패: ${errorMessage}`);
        } else if (error.request) {
            console.error("네트워크 에러:", error.request);
            setHintMessage("네트워크 연결을 확인해주세요.");
        } else {
            console.error("기타 에러:", error.message);
            setHintMessage("회원가입 요청에 실패했습니다. 다시 시도해주세요.");
        }
    }
};

    // Enter 키 핸들러 추가
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isFormComplete()) {
            e.preventDefault();
            completeSignup();
        }
    };

    // 이전 버튼 클릭 시 현재 Join3 데이터와 함께 Join2로 이동
    const handlePrevious = () => {
        if (onPrevious) {
            onPrevious(); // Join 컴포넌트의 setStep(1) 실행 (JoinInterest 단계)
        } else {
            navigate("/join-interest", {  // 경로를 JoinInterest로 변경
                state: {
                    formData: formData,
                    join2Data: interestData
                }
            });
        }
    };

    const selectedDayCount = getSelectedDayCount();
    const steps = ["프로필 설정", "관심사 선택", "시간대 선택"];

    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className="max-w-4xl mx-auto">
                {/* Step indicator UI */}
                <div className="mb-8">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                        {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                            <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                                idx === 2 
                                ? "bg-indigo-600 text-white shadow-lg" 
                                : idx < 2
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}
                            >
                            {idx < 2 ? <CheckCircle className="w-5 h-5" /> : idx === 2 ? <Clock className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span className="text-xs mt-2 text-gray-600 text-center max-w-20">{step}</span>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Main card UI */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header section */}
                    <div className="px-6 py-8 text-white" style={{ background: `linear-gradient(to right, #8B85E9, #8B85E9)` }}>
                        <h2 className="text-2xl font-bold mb-2 text-left">시간대 선택</h2>
                        <p className="opacity-90 text-sm text-left">
                            활동하고 싶은 요일과 시간대를 선택해주세요
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Hint message UI */}
                        {hintMessage && (
                            <div className={`mb-6 transition-all duration-300 ${showHint ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                                <div className={`flex items-center gap-2 p-4 rounded-xl border ${
                                    hintMessage.includes('완료') || hintMessage.includes('선택되었습니다') 
                                        ? 'bg-emerald-50 border-emerald-200' 
                                        : hintMessage.includes('해제되었습니다')
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-amber-50 border-amber-200'
                                }`}>
                                    {hintMessage.includes('완료') || hintMessage.includes('선택되었습니다') ? (
                                        <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                    ) : hintMessage.includes('해제되었습니다') ? (
                                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm font-medium ${
                                        hintMessage.includes('완료') || hintMessage.includes('선택되었습니다') 
                                            ? 'text-emerald-800' 
                                            : hintMessage.includes('해제되었습니다')
                                            ? 'text-blue-800'
                                            : 'text-amber-800'
                                    }`}>
                                        {hintMessage}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Days Selection Section */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-gray-800">요일 선택</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="px-3 py-1 bg-indigo-100 rounded-full">
                                        <span className="text-sm" style={{ color: "#8B85E9" }}>
                                            <span className="font-bold">{selectedDayCount}</span>개 선택됨
                                        </span>
                                    </div>
                                    <button
                                        onClick={toggleAllDays}
                                        className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                                        style={{ backgroundColor: "#8B85E9", color: "white" }}
                                    >
                                        {Object.values(selectedDays).some(day => day) ? '전체 해제' : '전체 선택'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <div className="flex flex-wrap gap-4 justify-center">
                                    {Object.entries(selectedDays).map(([dayKey]) => {
                                        const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
                                        const dayIndex = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(dayKey);
                                        const dayName = dayNames[dayIndex];
                                        
                                        return (
                                            <label key={dayKey} className="cursor-pointer group">
                                                <div className={`relative w-16 h-16 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                                                    selectedDays[dayKey] 
                                                        ? 'border-transparent shadow-lg' 
                                                        : 'border-gray-300 bg-white hover:border-gray-400'
                                                }`}
                                                style={selectedDays[dayKey] ? { backgroundColor: '#8B85E9' } : {}}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDays[dayKey]}
                                                        onChange={() => toggleDay(dayKey)}
                                                        className="absolute opacity-0"
                                                    />
                                                    <div className="flex items-center justify-center h-full">
                                                        {selectedDays[dayKey] ? (
                                                            <Check className="w-6 h-6 text-white" />
                                                        ) : (
                                                            <span className="font-bold text-lg" style={{ color: '#8B85E9' }}>
                                                                {dayName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Time Slot Selection Section */}
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                                <h3 className="text-xl font-bold text-gray-800">시간대 선택</h3>
                            </div>
                            
                            <div className="bg-gray-50 rounded-2xl p-6">
                                <div className="flex items-center justify-center gap-12">
                                    {/* Start Time Input */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sun className="w-5 h-5" style={{ color: '#8B85E9' }} />
                                            <label className="text-lg font-semibold text-gray-800">시작 시간</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={customTimeSlot.startTime || ''}
                                                onChange={(e) => setTimeSlot('start', parseInt(e.target.value))}
                                                className="w-32 px-4 py-3 text-lg font-semibold text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                                                style={{ 
                                                    borderColor: customTimeSlot.startTime !== null ? '#8B85E9' : undefined
                                                }}
                                                onKeyDown={handleKeyDown}
                                            >
                                                <option value="">--</option>
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}시</option>
                                                ))}
                                            </select>
                                            {customTimeSlot.startTime !== null && (
                                                <div className="absolute -top-2 -right-2">
                                                    <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Separator with animation */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, #8B85E9, #A855F7)' }}></div>
                                        <span className="text-2xl font-bold" style={{ color: '#8B85E9' }}>~</span>
                                        <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, #8B85E9, #A855F7)' }}></div>
                                    </div>

                                    {/* End Time Input */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Moon className="w-5 h-5" style={{ color: '#8B85E9' }} />
                                            <label className="text-lg font-semibold text-gray-800">마침 시간</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={customTimeSlot.endTime || ''}
                                                onChange={(e) => setTimeSlot('end', parseInt(e.target.value))}
                                                className="w-32 px-4 py-3 text-lg font-semibold text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:border-transparent bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                                                style={{ 
                                                    borderColor: customTimeSlot.endTime !== null ? '#8B85E9' : undefined
                                                }}
                                                onKeyDown={handleKeyDown}
                                            >
                                                <option value="">--</option>
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>{i.toString().padStart(2, '0')}시</option>
                                                ))}
                                            </select>
                                            {customTimeSlot.endTime !== null && (
                                                <div className="absolute -top-2 -right-2">
                                                    <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Time validation message */}
                                {customTimeSlot.startTime !== null && customTimeSlot.endTime !== null && (
                                    <div className="mt-6 text-center">
                                        {isTimeSlotValid() ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-full">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-800">
                                                    {customTimeSlot.endTime! - customTimeSlot.startTime!}시간 활동 시간
                                                </span>
                                            </div>
                                        ) : areTimesSame() ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 border border-orange-300 rounded-full">
                                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                                <span className="text-sm font-medium text-orange-800">
                                                    시작 시간과 마침 시간이 같습니다
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded-full">
                                                <AlertCircle className="w-4 h-4 text-red-600" />
                                                <span className="text-sm font-medium text-red-800">
                                                    시작 시간이 마침 시간보다 늦습니다
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selection Summary */}
                        <div className="mb-8 p-6 bg-white border-2 rounded-2xl shadow-sm" style={{ borderColor: '#8B85E9' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 133, 233, 0.1)' }}>
                                        <Clock className="w-5 h-5" style={{ color: '#8B85E9' }} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">선택 요약</h4>
                                        <p className="text-sm text-gray-600">최종 확인 후 가입을 완료하세요</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-600 mb-1">
                                        요일: <span className="font-bold" style={{ color: '#8B85E9' }}>{selectedDayCount}개</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        시간: <span className="font-bold" style={{ color: '#8B85E9' }}>
                                            {isTimeSlotValid() ? `${customTimeSlot.startTime}시 - ${customTimeSlot.endTime}시` : '미선택'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Information message UI */}
                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-2xl" style={{ borderColor: 'rgba(139, 133, 233, 0.3)' }}>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(139, 133, 233, 0.1)' }}>
                                    <AlertCircle className="w-5 h-5" style={{ color: '#8B85E9' }} />
                                </div>
                                <div style={{ color: '#8B85E9' }}>
                                    <p className="font-semibold mb-2 text-base">선택 가이드</p>
                                    <div className="space-y-1.5 text-sm opacity-90">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8B85E9' }}></div>
                                            <span>원하는 요일을 여러 개 선택할 수 있어요</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8B85E9' }}></div>
                                            <span>활동 시간을 시간 단위로 설정해주세요</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#8B85E9' }}></div>
                                            <span>최소 하나의 요일과 올바른 시간대가 필요해요</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Button UI */}
                        <div className="flex gap-6 pt-4">
                            <button
                                onClick={handlePrevious}
                                className="flex-1 py-4 px-8 rounded-2xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                            >
                                이전
                            </button>
                            <button
                                onClick={completeSignup}
                                className={`flex-1 py-4 px-8 rounded-2xl font-semibold transition-all duration-300 ${
                                    isFormComplete()
                                        ? "text-white hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                style={isFormComplete() ? { 
                                    background: "linear-gradient(135deg, #8B85E9 0%, #9C92FF 100%)",
                                    boxShadow: "0 20px 25px -5px rgba(139, 133, 233, 0.3), 0 10px 10px -5px rgba(139, 133, 233, 0.1)"
                                } : {}}
                                disabled={!isFormComplete()}
                            >
                                회원가입 완료
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinTime;
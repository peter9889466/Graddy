import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, AlertCircle, CheckCircle, Clock, Sun, Moon, ChevronDown } from "lucide-react";

interface TimeSelection {
    [key: string]: {
        morning: boolean;
        afternoon: boolean;
    };
}

const Join3: React.FC = () => {
    // State to manage time selections for each day.
    const [selectedTimes, setSelectedTimes] = useState<TimeSelection>({
        monday: { morning: false, afternoon: false },
        tuesday: { morning: false, afternoon: false },
        wednesday: { morning: false, afternoon: false },
        thursday: { morning: false, afternoon: false },
        friday: { morning: false, afternoon: false },
        saturday: { morning: false, afternoon: false },
        sunday: { morning: false, afternoon: false }
    });
    
    // State to manage which accordion day is open.
    const [openDay, setOpenDay] = useState<string | null>(null);

    // State for managing hint messages displayed to the user.
    const [hintMessage, setHintMessage] = useState<string>("");
    // State to control hint message visibility.
    const [showHint, setShowHint] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { formData, join2Data } = location.state || {};

    // Defines Korean names for each day key.
    const dayNames = {
        monday: "월요일",
        tuesday: "화요일", 
        wednesday: "수요일",
        thursday: "목요일",
        friday: "금요일",
        saturday: "토요일",
        sunday: "일요일"
    };

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

    // Toggles the morning or afternoon time slot for a specific day.
    const toggleTime = (day: string, period: 'morning' | 'afternoon') => {
        setSelectedTimes(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [period]: !prev[day][period]
            }
        }));
    };

    // Toggles the accordion for a specific day.
    const toggleAccordion = (day: string) => {
        setOpenDay(openDay === day ? null : day);
    };

    // Toggles all time slots for all days.
    const toggleAllTimes = () => {
        const hasAnySelection = Object.values(selectedTimes).some(day => 
            day.morning || day.afternoon
        );
        
        if (hasAnySelection) {
            // If any time is selected, deselect all.
            const resetTimes: TimeSelection = {};
            Object.keys(selectedTimes).forEach(day => {
                resetTimes[day] = { morning: false, afternoon: false };
            });
            setSelectedTimes(resetTimes);
            setHintMessage("모든 시간이 해제되었습니다!");
        } else {
            // If nothing is selected, select all.
            const allTimes: TimeSelection = {};
            Object.keys(selectedTimes).forEach(day => {
                allTimes[day] = { morning: true, afternoon: true };
            });
            setSelectedTimes(allTimes);
            setHintMessage("모든 시간이 선택되었습니다!");
        }
    };

    // Calculates the total number of selected time slots.
    const getSelectedCount = () => {
        let count = 0;
        Object.values(selectedTimes).forEach(day => {
            if (day.morning) count++;
            if (day.afternoon) count++;
        });
        return count;
    };

    // Function to handle the "Complete Signup" button click.
    const completeSignup = () => {
        const selectedCount = getSelectedCount();
        
        if (selectedCount === 0) {
            setHintMessage("최소 하나의 시간대를 선택해주세요!");
            return;
        }

        setHintMessage("회원가입이 완료되었습니다!");
        // In a real application, this would navigate to a completion page.
        setTimeout(() => {
            navigate("/");
        }, 1500);
    };

    // Function to handle the "Previous" button click.
    const handlePrevious = () => {
        navigate("/join2", {
            state: {
                formData,
                join2Data, // Passes the selected interest data as is.
            },
        });
    };

    const selectedCount = getSelectedCount();
    const steps = ["프로필 설정", "관심사 선택", "시간대 선택"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
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

                        {/* Selection status and 'Select All' button UI */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    선택된 시간: <span className="text-indigo-600 font-semibold">{getSelectedCount()}개</span>
                                </span>
                            </div>
                            <button
                                onClick={toggleAllTimes}
                                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90"
                                style={{ backgroundColor: "#8B85E9", color: "white" }}
                            >
                                전체 {Object.values(selectedTimes).some(day => day.morning || day.afternoon) ? '해제' : '선택'}
                            </button>
                        </div>

                        {/* Day-by-day accordion UI */}
                        <div className="space-y-4">
                            {Object.entries(dayNames).map(([dayKey, dayName]) => {
                                const dayData = selectedTimes[dayKey];
                                const isDaySelected = dayData.morning || dayData.afternoon;
                                const isOpen = openDay === dayKey;
                                
                                return (
                                    <div key={dayKey} className={`rounded-xl border-2 transition-all duration-200 ${
                                        isDaySelected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'
                                    }`}>
                                        <button
                                            onClick={() => toggleAccordion(dayKey)}
                                            className="w-full flex items-center justify-between p-4"
                                        >
                                            <div className="flex items-center gap-2">
                                                <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                                                    isDaySelected ? 'text-indigo-700' : 'text-gray-700'
                                                }`}>
                                                    {dayName}
                                                </h3>
                                                {isDaySelected && (
                                                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                                                )}
                                            </div>
                                            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        {isOpen && (
                                            <div className="px-4 pb-4 flex gap-3">
                                                {/* Morning button */}
                                                <button
                                                    onClick={() => toggleTime(dayKey, 'morning')}
                                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                                                        dayData.morning
                                                            ? 'border-transparent text-white'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                    style={dayData.morning ? { backgroundColor: '#8B85E9' } : {}}
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Sun className="w-4 h-4" />
                                                        <span className="font-medium">오전</span>
                                                    </div>
                                                    <div className="text-xs opacity-80 mt-1">
                                                        09:00 - 12:00
                                                    </div>
                                                </button>
                                                
                                                {/* Afternoon button */}
                                                <button
                                                    onClick={() => toggleTime(dayKey, 'afternoon')}
                                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                                                        dayData.afternoon
                                                            ? 'border-transparent text-white'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                    style={dayData.afternoon ? { backgroundColor: '#8B85E9' } : {}}
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Moon className="w-4 h-4" />
                                                        <span className="font-medium">오후</span>
                                                    </div>
                                                    <div className="text-xs opacity-80 mt-1">
                                                        13:00 - 18:00
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Information message UI */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">시간대 선택 안내</p>
                                    <ul className="text-xs space-y-1 opacity-90">
                                        <li>• 요일명을 클릭하여 상세 시간대를 펼치거나 접을 수 있습니다</li>
                                        <li>• 원하는 요일과 시간대를 자유롭게 선택할 수 있습니다</li>
                                        <li>• 최소 하나의 시간대는 선택해야 합니다</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Button UI */}
                        <div className="flex gap-4 pt-6">
                            <button
                                onClick={handlePrevious}
                                className="flex-1 py-4 px-6 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                            >
                                이전으로
                            </button>
                            <button
                                onClick={completeSignup}
                                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                                    selectedCount > 0
                                        ? "text-white hover:shadow-xl transform hover:scale-105"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                                style={selectedCount > 0 ? { 
                                    backgroundColor: "#8B85E9",
                                    boxShadow: "0 10px 15px -3px rgba(139, 133, 233, 0.1), 0 4px 6px -2px rgba(139, 133, 233, 0.05)"
                                } : {}}
                                onMouseEnter={selectedCount > 0 ? (e) => {
                                    (e.target as HTMLButtonElement).style.backgroundColor = "#7d75e3";
                                } : undefined}
                                onMouseLeave={selectedCount > 0 ? (e) => {
                                    (e.target as HTMLButtonElement).style.backgroundColor = "#8B85E9";
                                } : undefined}
                                disabled={selectedCount === 0}
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

export default Join3;
import { X, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "../ui/button";

interface ScheduleEvent {
    id: string;
    title: string;
    date: string;
    description: string;
    time: string;
    location: string;
}

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: ScheduleEvent | null;
}

export default function ScheduleModal({
    isOpen,
    onClose,
    event,
}: ScheduleModalProps) {
    if (!isOpen || !event) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-[200] p-4"
            onClick={handleBackdropClick}
        >
            <div
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Card 시작 */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                    {/* 헤더 */}
                    <div className="flex justify-between items-center mb-6">
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "#8B85E9" }}
                        >
                            {event.title}
                        </h1>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* 이벤트 정보 */}
                    <div className="space-y-4 mb-6">
                        {/* 설명 */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                설명
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {event.description}
                            </p>
                        </div>

                        {/* 날짜 */}
                        <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                                <span className="font-medium text-gray-700">
                                    날짜:{" "}
                                </span>
                                <span className="text-gray-600">
                                    {event.date}
                                </span>
                            </div>
                        </div>

                        {/* 시간 */}
                        <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <div>
                                <span className="font-medium text-gray-700">
                                    시간:{" "}
                                </span>
                                <span className="text-gray-600">
                                    {event.time}
                                </span>
                            </div>
                        </div>

                        {/* 장소 */}
                        <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <div>
                                <span className="font-medium text-gray-700">
                                    장소:{" "}
                                </span>
                                <span className="text-gray-600">
                                    {event.location}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 버튼 그룹 */}
                    <div className="flex gap-3">
                        <Button
                            className="flex-1 py-3 text-white font-semibold"
                            style={{ backgroundColor: "#8B85E9" }}
                            onClick={() => {
                                // 참여하기 로직 추가
                                console.log("스터디 참여하기");
                                onClose();
                            }}
                        >
                            참여하기
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 py-3 border-gray-300 hover:bg-gray-50 bg-transparent"
                            onClick={onClose}
                        >
                            닫기
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Plus, BookOpen, Calendar } from 'lucide-react';

interface ScheduleItem {
    id: string;
    title: string;
    type: 'assignment' | 'schedule';
    date: string;
    time?: string;
    description?: string;
}

const Schedule = () => {
    const [activeTab, setActiveTab] = useState<'assignment' | 'schedule'>('assignment');
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        date: '',
        time: ''
    });

    // 임시 데이터
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
        {
            id: '1',
            title: 'React 프로젝트 제출',
            type: 'assignment',
            date: '2024-01-15',
            description: 'React를 사용한 웹 애플리케이션 개발'
        },
        {
            id: '2',
            title: '스터디 정기 모임',
            type: 'schedule',
            date: '2024-01-20',
            description: '매주 토요일 오후 2시'
        }
    ]);

        const handleAddItem = () => {
        if (newItem.title && newItem.date) {
            const item: ScheduleItem = {
                id: Date.now().toString(),
                title: newItem.title,
                type: activeTab,
                date: newItem.date,
                time: activeTab === 'schedule' ? newItem.time : undefined,
                description: newItem.description
            };
            setScheduleItems([...scheduleItems, item]);
            setNewItem({ title: '', description: '', date: '', time: '' });
            setIsAdding(false);
        }
    };

    const handleDeleteItem = (id: string) => {
        setScheduleItems(scheduleItems.filter(item => item.id !== id));
    };

    const filteredItems = scheduleItems.filter(item => item.type === activeTab);

    return (
        		<div className="space-y-6 p-4 pr-10">
            <div className="relative w-[420px] mx-auto">
              {/* 보라색 바 */}
              <div className="bg-[#8B85E9] rounded-full h-12 shadow-md relative flex items-center px-1">
                {/* 슬라이더 (하얀 버튼) */}
                <div
                  className={`absolute top-1 left-1 h-10 w-[calc(50%-4px)] bg-white rounded-full shadow transition-transform duration-300 ${
                    activeTab === "schedule" ? "translate-x-full" : "translate-x-0"
                  }`}
                />

                {/* 버튼들 */}
                                 <button
                   onClick={() => {
                     if (activeTab === "assignment" && isAdding) {
                       setIsAdding(false);
                     } else {
                       setActiveTab("assignment");
                       setIsAdding(true);
                     }
                   }}
                   className={`flex-1 z-10 text-sm font-medium transition-colors duration-300 ${
                     activeTab === "assignment" ? "text-[#8B85E9]" : "text-white"
                   }`}
                 >
                   + 과제 추가
                 </button>
                 <button
                   onClick={() => {
                     if (activeTab === "schedule" && isAdding) {
                       setIsAdding(false);
                     } else {
                       setActiveTab("schedule");
                       setIsAdding(true);
                     }
                   }}
                   className={`flex-1 z-10 text-sm font-medium transition-colors duration-300 ${
                     activeTab === "schedule" ? "text-[#8B85E9]" : "text-white"
                   }`}
                 >
                   + 스터디 일정 추가
                 </button>
              </div>
            </div>

                {/* 추가 폼 (슬라이드 애니메이션) */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isAdding ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {activeTab === 'assignment' ? '과제 내용' : '일정 내용'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    제목
                                </label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder={activeTab === 'assignment' ? '과제 제목을 입력하세요' : '일정 제목을 입력하세요'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    날짜
                                </label>
                                <input
                                    type="date"
                                    value={newItem.date}
                                    onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                />
                            </div>
                        </div>
                        {activeTab === 'schedule' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    시간
                                </label>
                                <input
                                    type="time"
                                    value={newItem.time}
                                    onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                설명
                            </label>
                            <textarea
                                value={newItem.description}
                                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows={3}
                                placeholder="상세 설명을 입력하세요"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddItem}
                                className="px-4 py-2 text-white rounded-md transition-colors duration-200 hover:cursor-pointer"
                                style={{ 
                                    backgroundColor: "#8B85E9",
                                    filter: "brightness(1)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.filter = "brightness(0.8)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.filter = "brightness(1)";
                                }}
                            >
                                추가
                            </button>
                            <button
                                                                 onClick={() => {
                                     setIsAdding(false);
                                     setNewItem({ title: '', description: '', date: '', time: '' });
                                 }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>

            {/* 일정 목록 */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {activeTab === 'assignment' ? '과제 목록' : '일정 목록'}
                </h3>
                {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {activeTab === 'assignment' ? '등록된 과제가 없습니다.' : '등록된 일정이 없습니다.'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {item.type === 'assignment' ? (
                                                <BookOpen className="w-4 h-4 text-purple-600" />
                                            ) : (
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                            )}
                                            <h4 className="font-medium text-gray-800">{item.title}</h4>
                                        </div>
                                        {item.description && (
                                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                        )}
                                                                                 <p className="text-gray-500 text-sm">
                                             {item.date}
                                             {item.time && ` ${item.time}`}
                                         </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
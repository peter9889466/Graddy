import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar } from 'lucide-react';
import { apiPost, apiGet } from '../../services/api';

interface ScheduleItem {
    id: string;
    title: string;
    type: 'assignment' | 'schedule';
    date: string;
    time?: string;
    description?: string;
    fileUrl?: string;
    createdAt?: string;
    isExpanded?: boolean;
}

interface ScheduleProps {
    isStudyLeader?: boolean;
    studyProjectId?: number;
    userId?: string;
    memberId?: number;
}

const Schedule: React.FC<ScheduleProps> = ({
    isStudyLeader = false,
    studyProjectId = 0,
    userId = '',
    memberId = 0
}) => {
    const [activeTab, setActiveTab] = useState<'assignment' | 'schedule'>('assignment');
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        date: '',
        time: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // 빈 배열로 시작 (백엔드에서 데이터 로드 예정)
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 과제 목록 로드
    useEffect(() => {
        if (studyProjectId > 0) {
            loadAssignments();
        }
    }, [studyProjectId]);

        const loadAssignments = async () => {
        setIsLoading(true);
        try {
            // 백엔드 API가 준비되지 않았으므로 임시로 하드코딩된 데이터 사용
            console.log('과제 목록 로드 시도 - studyProjectId:', studyProjectId);
            
            // 빈 배열로 설정 (백엔드 API 준비 후 실제 데이터 로드)
            setScheduleItems([]);
            
            // 백엔드 API가 준비되면 아래 코드로 교체
            /*
            const response = await apiGet(`/assignments?studyProjectId=${studyProjectId}`);
            console.log('과제 목록 응답:', response);
            
            if (response.data && Array.isArray(response.data)) {
                const assignments = response.data.map((assignment: any) => ({
                    id: assignment.assignmentId.toString(),
                    title: assignment.title,
                    type: 'assignment' as const,
                    date: new Date(assignment.deadline).toISOString().split('T')[0],
                    description: assignment.description,
                    fileUrl: assignment.fileUrl,
                    createdAt: assignment.createdAt,
                    isExpanded: false
                }));
                setScheduleItems(assignments);
            }
            */
        } catch (error) {
            console.error('과제 목록 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (newItem.title && newItem.date) {
            try {
                if (activeTab === 'assignment') {
                    // 과제 마감일 유효성 검사
                    const selectedDate = new Date(newItem.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (selectedDate < today) {
                        alert('과제 마감일은 오늘 이후로 설정해주세요.');
                        return;
                    }

                    // 과제 추가 API 호출
                    const assignmentData = {
                        studyProjectId: studyProjectId,
                        memberId: memberId,
                        title: newItem.title,
                        description: newItem.description || '',
                        deadline: new Date(newItem.date).toISOString(),
                        fileUrl: '' // TODO: 파일 업로드 기능 추가 시 사용
                    };

                    console.log('과제 추가 데이터:', assignmentData);
                    
                    try {
                        const response = await apiPost('/assignments', assignmentData);
                        console.log('과제 추가 응답:', response);

                        if (response.data) {
                            alert('과제가 성공적으로 추가되었습니다.');
                            // 목록 새로고침
                            loadAssignments();
                        }
                    } catch (apiError) {
                        console.log('백엔드 API 호출 실패, 로컬에 추가:', apiError);
                        // 백엔드 API가 준비되지 않았으므로 로컬에 추가
                        const newAssignment: ScheduleItem = {
                            id: Date.now().toString(),
                            title: newItem.title,
                            type: 'assignment',
                            date: newItem.date,
                            description: newItem.description,
                            fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : '',
                            createdAt: new Date().toISOString(),
                            isExpanded: false
                        };
                        setScheduleItems([...scheduleItems, newAssignment]);
                        alert('과제가 성공적으로 추가되었습니다.');
                    }
                } else {
                    // 일정 추가 API 호출
                    const scheduleData = {
                        userId: userId,
                        studyProjectId: studyProjectId,
                        content: newItem.title,
                        schTime: new Date(`${newItem.date}T${newItem.time || '00:00'}`).toISOString()
                    };

                    console.log('일정 추가 데이터:', scheduleData);
                    
                    try {
                        const response = await apiPost('/schedules', scheduleData);
                        console.log('일정 추가 응답:', response);

                        if (response.data) {
                            alert('일정이 성공적으로 추가되었습니다.');
                            // 목록 새로고침 (일정도 과제와 같은 방식으로 처리)
                            loadAssignments();
                        }
                    } catch (apiError) {
                        console.log('백엔드 API 호출 실패, 로컬에 추가:', apiError);
                        // 백엔드 API가 준비되지 않았으므로 로컬에 추가
                        const newSchedule: ScheduleItem = {
                            id: Date.now().toString(),
                            title: newItem.title,
                            type: 'schedule',
                            date: newItem.date,
                            time: newItem.time,
                            description: newItem.description,
                            createdAt: new Date().toISOString(),
                            isExpanded: false
                        };
                        setScheduleItems([...scheduleItems, newSchedule]);
                        alert('일정이 성공적으로 추가되었습니다.');
                    }
                }

                // 폼 초기화
                setNewItem({ title: '', description: '', date: '', time: '' });
                setSelectedFile(null);
                setIsAdding(false);
            } catch (error) {
                console.error('추가 실패:', error);
                alert('추가에 실패했습니다. 다시 시도해주세요.');
            }
        } else {
            alert('제목과 날짜를 입력해주세요.');
        }
    };

    const handleDeleteItem = (id: string) => {
        setScheduleItems(scheduleItems.filter(item => item.id !== id));
    };

    const toggleItemExpansion = (id: string) => {
        setScheduleItems(scheduleItems.map(item =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
        ));
    };

    const filteredItems = scheduleItems.filter(item => item.type === activeTab);

    return (
        <div className="space-y-6 p-4 pr-10">
            {/* 일정 목록 */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    {activeTab === 'assignment' ? '과제 목록' : '일정 목록'}
                </h3>
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                        로딩 중...
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {activeTab === 'assignment' ? '등록된 과제가 없습니다.' : '등록된 일정이 없습니다.'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item) => {
                            // 과제 마감일이 지났는지 확인
                            const isOverdue = item.type === 'assignment' && new Date(item.date) < new Date();

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white border rounded-lg hover:shadow-md transition-shadow duration-200 ${isOverdue
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200'
                                        }`}
                                >
                                    {/* 헤더 (항상 표시) */}
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer"
                                        onClick={() => toggleItemExpansion(item.id)}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            {item.type === 'assignment' ? (
                                                <BookOpen className="w-4 h-4 text-purple-600" />
                                            ) : (
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800">{item.title}</h4>
                                                <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                    {item.type === 'assignment' ? '마감일: ' : ''}{item.date}
                                                    {item.time && ` ${item.time}`}
                                                    {isOverdue && ' (마감됨)'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.type === 'assignment' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // TODO: 수정 기능 구현
                                                        alert('수정 기능은 추후 구현 예정입니다.');
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200 text-sm"
                                                >
                                                    수정
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteItem(item.id);
                                                }}
                                                className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm"
                                            >
                                                삭제
                                            </button>
                                            <div className={`transform transition-transform duration-200 text-gray-400 ${item.isExpanded ? 'rotate-180' : ''}`}>
                                                ▼
                                            </div>
                                        </div>
                                    </div>

                                    {/* 상세 내용 (토글) */}
                                    {item.isExpanded && (
                                        <div className="px-4 pb-4 border-t border-gray-100">
                                            {item.description && (
                                                <div className="mt-3">
                                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{item.description}</p>
                                                </div>
                                            )}
                                            {item.fileUrl && item.fileUrl.trim() !== '' && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-medium">첨부파일:</span>
                                                        {item.fileUrl.startsWith('blob:') || item.fileUrl.startsWith('http') ? (
                                                            <a
                                                                href={item.fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-700 ml-1"
                                                            >
                                                                파일 다운로드
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-400 ml-1">파일 없음</span>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                            {item.createdAt && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-400">
                                                        생성일: {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 추가 버튼들 - 스터디장만 표시 */}
            {isStudyLeader && (
                <div className="relative w-[420px] mx-auto">
                    {/* 보라색 바 */}
                    <div className="bg-[#8B85E9] rounded-full h-12 shadow-md relative flex items-center px-1">
                        {/* 슬라이더 (하얀 버튼) */}
                        <div
                            className={`absolute top-1 left-1 h-10 w-[calc(50%-4px)] bg-white rounded-full shadow transition-transform duration-300 ${activeTab === "schedule" ? "translate-x-full" : "translate-x-0"
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
                            className={`flex-1 z-10 text-sm font-medium transition-colors duration-300 ${activeTab === "assignment" ? "text-[#8B85E9]" : "text-white"
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
                            className={`flex-1 z-10 text-sm font-medium transition-colors duration-300 ${activeTab === "schedule" ? "text-[#8B85E9]" : "text-white"
                                }`}
                        >
                            + 스터디 일정 추가
                        </button>
                    </div>
                </div>
            )}

            {/* 추가 폼 (슬라이드 애니메이션) - 스터디장만 표시 */}
            {isStudyLeader && (
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isAdding ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {activeTab === 'assignment' ? '과제 내용' : '일정 내용'}
                            </h3>
                            {activeTab === 'assignment' && (
                                <button
                                    onClick={() => {
                                        // AI로 과제 추가 기능 구현 예정
                                        alert('AI로 과제 추가 기능이 준비 중입니다.');
                                    }}
                                    className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    AI로 과제 추가
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    제목
                                </label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                    placeholder={activeTab === 'assignment' ? '과제 제목을 입력하세요' : '일정 제목을 입력하세요'}
                                />
                            </div>
                            {activeTab === 'assignment' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        과제 마감일
                                    </label>
                                    <input
                                        type="date"
                                        value={newItem.date}
                                        onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                        placeholder="과제 마감일을 선택하세요"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        날짜 및 시간
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newItem.date && newItem.time ? `${newItem.date}T${newItem.time}` : ''}
                                        onChange={(e) => {
                                            const datetime = e.target.value;
                                            if (datetime) {
                                                const [date, time] = datetime.split('T');
                                                setNewItem({ ...newItem, date: date, time: time });
                                            } else {
                                                setNewItem({ ...newItem, date: '', time: '' });
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                        placeholder="일정 날짜 및 시간을 선택하세요"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                            )}
                        </div>
                        {activeTab === 'assignment' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        과제 설명
                                    </label>
                                    <textarea
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                        rows={3}
                                        placeholder="과제에 대한 설명을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <p className="text-lg font-bold mb-2 text-gray-500">
                                        첨부 파일
                                    </p>
                                    <input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="block w-full text-sm file:mr-4 file:py-2 file:px-4
                                                  file:rounded-lg file:border-0
                                                  file:text-sm file:font-semibold file:text-[#8B85E9]
                                                  file:bg-violet-50 hover:file:bg-violet-100"
                                    />
                                </div>
                            </>
                        )}
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
                                    setSelectedFile(null);
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;
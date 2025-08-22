import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Search, Check, Sun, Moon, CheckCircle, AlertCircle } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { AuthContext } from '../contexts/AuthContext';
import { StudyApiService, CreateStudyRequest, CreateStudyProjectRequest } from '../services/studyApi';

// 슬라이더 스타일을 위한 CSS
const sliderStyles = `
    .slider::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #8B85E9;
        cursor: pointer;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .slider::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: #8B85E9;
        cursor: pointer;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .slider::-webkit-slider-track {
        height: 8px;
        border-radius: 4px;
        background: transparent;
    }
    
    .slider::-moz-range-track {
        height: 8px;
        border-radius: 4px;
        background: transparent;
    }

    /* 모달 활성화 시 스크롤바 유지 */
    body.modal-open {
        overflow: hidden;
    }

    /* 시간 선택 드롭다운 스타일 */
    .time-select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
        background-position: right 0.5rem center;
        background-repeat: no-repeat;
        background-size: 1.5em 1.5em;
        padding-right: 2.5rem;
    }

    .time-select:focus {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B85E9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    }

    .time-select option {
        background-color: white;
        color: #374151;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .time-select option:hover {
        background-color: #f3f4f6;
    }

    .time-select option:checked {
        background-color: #8B85E9;
        color: white;
    }
`;

const StudyCreate: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('StudyCreate 컴포넌트는 AuthProvider 내에서 사용되어야 합니다.');
    }
    const { user } = authContext;
    const [studyType, setStudyType] = useState<'study' | 'project'>('study');
    const [studyData, setStudyData] = useState({
        title: '',
        introduction: '',
        description: '',
        maxMembers: 0,
        tags: [] as Array<{name: string, difficulty?: string}>, // 태그에 난이도 정보 추가
        selectedDays: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
        },
        startTime: null as number | null,
        endTime: null as number | null
    });
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tagSearchValue, setTagSearchValue] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'초급' | '중급' | '고급' | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleRemoveTag = (tagToRemove: {name: string, difficulty?: string}) => {
        setStudyData({
            ...studyData,
            tags: studyData.tags.filter(tag => tag.name !== tagToRemove.name)
        });
    };

    // 난이도별 색상 함수
    const getDifficultyColors = (difficulty: string) => {
        switch (difficulty) {
            case "초급":
                return {
                    bgColor: "bg-emerald-100",
                    textColor: "text-emerald-800",
                    borderColor: "border-emerald-300",
                };
            case "중급":
                return {
                    bgColor: "bg-blue-100",
                    textColor: "text-blue-800",
                    borderColor: "border-blue-300",
                };
            case "고급":
                return {
                    bgColor: "bg-purple-100",
                    textColor: "text-purple-800",
                    borderColor: "border-purple-300",
                };
            default:
                return {
                    bgColor: "bg-[#8B85E9]/10",
                    textColor: "text-[#8B85E9]",
                    borderColor: "border-[#8B85E9]/30",
                };
        }
    };

    // 요일 선택 토글 함수
    const toggleDay = (day: string) => {
        setStudyData(prev => ({
            ...prev,
            selectedDays: {
                ...prev.selectedDays,
                [day]: !prev.selectedDays[day as keyof typeof prev.selectedDays]
            }
        }));
    };

    // 전체 요일 선택/해제 함수
    const toggleAllDays = () => {
        const hasAnyDaySelected = Object.values(studyData.selectedDays).some(day => day);

        if (hasAnyDaySelected) {
            // 모든 요일 해제
            const resetDays = {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false
            };
            setStudyData(prev => ({
                ...prev,
                selectedDays: resetDays
            }));
        } else {
            // 모든 요일 선택
            const allDays = {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: true,
                sunday: true
            };
            setStudyData(prev => ({
                ...prev,
                selectedDays: allDays
            }));
        }
    };

    // 선택된 요일 개수 계산
    const getSelectedDayCount = () => {
        return Object.values(studyData.selectedDays).filter(day => day).length;
    };

    // 시간 설정 함수
    const setTimeSlot = (type: 'start' | 'end', hour: number) => {
        setStudyData(prev => ({
            ...prev,
            [type === 'start' ? 'startTime' : 'endTime']: hour
        }));
    };

    // 시간 유효성 검사
    const isTimeSlotValid = () => {
        return studyData.startTime !== null &&
            studyData.endTime !== null &&
            studyData.startTime < studyData.endTime;
    };

    // 시작과 종료 시간이 같은지 확인
    const areTimesSame = () => {
        return studyData.startTime !== null &&
            studyData.endTime !== null &&
            studyData.startTime === studyData.endTime;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 에러 초기화
        setErrors({});

        // 필수 필드 검증
        const newErrors: { [key: string]: string } = {};

        if (!studyData.title.trim()) {
            newErrors.title = `${studyType === 'study' ? '스터디' : '프로젝트'} 제목을 입력해주세요!`;
        }

        if (!studyData.introduction.trim()) {
            newErrors.introduction = `${studyType === 'study' ? '스터디' : '프로젝트'} 소개를 입력해주세요!`;
        }

        // 요일 선택 검증 - 스터디일 때만
        if (studyType === 'study') {
            const selectedDayCount = Object.values(studyData.selectedDays).filter(day => day).length;
            if (selectedDayCount === 0) {
                newErrors.selectedDays = '스터디 요일을 선택해주세요!';
            }
        }

        // 시간 선택 검증 - 스터디일 때만
        if (studyType === 'study' && !isTimeSlotValid()) {
            if (studyData.startTime === null || studyData.endTime === null) {
                newErrors.timeSlot = '시작 시간과 마침 시간을 모두 입력해주세요!';
            } else if (areTimesSame()) {
                newErrors.timeSlot = '시작 시간과 마침 시간이 같습니다!';
            } else {
                newErrors.timeSlot = '시작 시간이 마침 시간보다 빨라야 합니다!';
            }
        }

        if (!studyData.description.trim()) {
            newErrors.description = `${studyType === 'study' ? '스터디' : '프로젝트'} 설명을 입력해주세요!`;
        }

        // 최대 인원 검증
        if (!studyData.maxMembers || studyData.maxMembers <= 0) {
            newErrors.maxMembers = `${studyType === 'study' ? '스터디' : '프로젝트'} 최대 인원을 입력해주세요!`;
        } else if (studyData.maxMembers > 100) {
            newErrors.maxMembers = '최대 인원은 100명 이하여야 합니다!';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // 백엔드 API로 스터디 프로젝트 생성 요청
            // 백엔드에서 요구하는 형식으로 데이터 변환
            const now = new Date();
            const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            // 시간 형식을 백엔드에서 요구하는 형식으로 변환
            const formatTimeForBackend = (hour: number | null, defaultHour: number) => {
                if (hour !== null) {
                    const date = new Date();
                    date.setHours(hour, 0, 0, 0);
                    return date.toISOString();
                } else {
                    const date = new Date();
                    date.setHours(defaultHour, 0, 0, 0);
                    return date.toISOString();
                }
            };
            
            // 선택된 요일을 dayIds로 변환
            const dayMapping = {
                monday: '1',
                tuesday: '2', 
                wednesday: '3',
                thursday: '4',
                friday: '5',
                saturday: '6',
                sunday: '7'
            };
            
            const selectedDayIds = Object.entries(studyData.selectedDays)
                .filter(([_, isSelected]) => isSelected)
                .map(([dayKey, _]) => dayMapping[dayKey as keyof typeof dayMapping]);
            
            // 태그에서 interestIds 추출 (임시로 1, 2, 3 사용)
            const interestIds = studyData.tags.length > 0 ? [1, 2, 3] : [1];
            
            // 새로운 스터디 프로젝트 생성 요청 데이터
            const createStudyProjectRequest: CreateStudyProjectRequest = {
                studyProjectName: studyData.title,
                studyProjectTitle: studyData.title,
                studyProjectDesc: studyData.description,
                studyLevel: selectedDifficulty === '초급' ? 1 : selectedDifficulty === '중급' ? 2 : 3,
                typeCheck: studyType, // "study" 또는 "project"
                userId: user?.nickname || 'testuser', // JWT 토큰에서 자동 추출되므로 선택적
                studyProjectStart: now.toISOString(), // 현재 날짜를 시작일로 설정
                studyProjectEnd: endDate.toISOString(), // 30일 후를 종료일로 설정
                studyProjectTotal: studyData.maxMembers,
                soltStart: formatTimeForBackend(studyData.startTime, 9), // 시작 시간을 ISO 형식으로
                soltEnd: formatTimeForBackend(studyData.endTime, 18), // 종료 시간을 ISO 형식으로
                interestIds: interestIds,
                dayIds: selectedDayIds
            };

            console.log('백엔드로 전송할 데이터:', createStudyProjectRequest);
            console.log('현재 사용자 정보:', user);
            console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');

            const createdStudyProject = await StudyApiService.createStudyProject(createStudyProjectRequest);
            console.log('생성된 스터디 프로젝트:', createdStudyProject);

            // 성공 시 검색 페이지로 이동
            navigate('/search');
        } catch (error) {
            console.error('스터디 생성 실패:', error);
            console.error('에러 상세 정보:', {
                name: error instanceof Error ? error.name : 'Unknown',
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            
            // 더 자세한 에러 메시지 표시
            let errorMessage = '스터디 생성에 실패했습니다. 다시 시도해주세요.';
            if (error instanceof Error) {
                errorMessage = `스터디 생성 실패: ${error.message}`;
            }
            
            alert(errorMessage);
        }
    };

    // 카테고리별 태그 데이터
    const tagCategories = [
        {
            id: 1,
            name: '프로그래밍 언어',
            tags: ['Python', 'JavaScript', 'HTML/CSS', 'Java', 'C#', 'Swift', 'Kotlin', 'C++', 'TypeScript', 'C', 'assembly', 'go', 'php', 'dart', 'rust', 'Ruby']
        },
        {
            id: 2,
            name: '라이브러리 & 프레임워크',
            tags: ['React', 'Spring Boot', 'Spring', 'Node.js', 'Pandas', 'next.js', 'flutter', 'vue', 'flask', 'Django', 'Unity']
        },
        {
            id: 3,
            name: '데이터베이스',
            tags: ['SQL', 'NOSQL', 'DBMS/RDBMS']
        },
        {
            id: 4,
            name: '플랫폼/환경',
            tags: ['iOS', 'Android', 'AWS', 'Docker', 'Linux', 'cloud', 'IoT', '임베디드']
        },
        {
            id: 5,
            name: 'AI/데이터',
            tags: ['인공지능(AI)', '머신러닝', '딥러닝', '빅데이터', '데이터 리터러시', 'LLM', '프롬프트 엔지니어링', 'ChatGPT', 'AI 활용(AX)']
        },
        {
            id: 6,
            name: '포지션',
            tags: ['Back', 'Front', 'DB', 'UI/UX', '알고리즘', 'AI', 'IoT']
        }
    ];

    // studyType에 따른 태그 데이터
    const getTagData = () => {
        if (studyType === 'project') {
            // 프로젝트용 포지션 태그
            return [{
                id: 1,
                name: '포지션',
                tags: ['Back', 'Front', 'DB', 'UI/UX', '알고리즘', 'AI', 'IoT']
            }];
        } else {
            // 스터디용 기존 태그
            return tagCategories;
        }
    };

    // 검색어와 카테고리 필터에 따른 필터링된 태그들
    const filteredTags = getTagData()
        .filter(category => studyType === 'project' || selectedCategory === null || category.id === selectedCategory)
        .map(category => ({
            ...category,
            tags: category.tags.filter(tag =>
                tag.toLowerCase().includes(tagSearchValue.toLowerCase())
            )
        }))
        .filter(category => category.tags.length > 0);

        const handleTagSelect = (tag: string) => {
        if (studyData.tags.some(t => t.name === tag)) {
            // 이미 선택된 태그라면 제거
            setStudyData({
                ...studyData,
                tags: studyData.tags.filter(t => t.name !== tag)
            });
        } else {
            // 새로운 태그라면 추가
            if (studyType === 'study' && !selectedDifficulty) {
                alert('먼저 난이도를 선택해주세요!');
                return;
            }
            
            if (studyData.tags.length < 5) {
                const newTag = studyType === 'study' 
                    ? { name: tag, difficulty: selectedDifficulty! }
                    : { name: tag };
                setStudyData({
                    ...studyData,
                    tags: [...studyData.tags, newTag]
                });
            } else {
                alert('태그는 5개까지만 선택할 수 있습니다!');
            }
        }
        // 모달창을 닫지 않고 태그만 추가/제거
    };

    const handleComplete = () => {
        setIsTagModalOpen(false);
        setTagSearchValue('');
        setSelectedDifficulty(null); // 모달이 닫힐 때 난이도 초기화
        // 모달이 닫힐 때 body 스크롤 복원
        document.body.classList.remove('modal-open');
    };

    const handleOpenTagModal = () => {
        setIsTagModalOpen(true);
        setTagSearchValue(''); // 모달을 열 때 검색어 초기화
        setSelectedCategory(null); // 모달을 열 때 카테고리 필터 초기화
        setSelectedDifficulty(null); // 모달을 열 때 난이도 초기화
        // 모달이 열릴 때 body에 클래스 추가하여 스크롤바 유지하면서 스크롤 막기
        document.body.classList.add('modal-open');
    };

    // Join2.tsx와 동일한 난이도 버튼 스타일 함수
    const getDifficultyButtonStyle = (level: string) => {
        const isActive = selectedDifficulty === level;
        switch (level) {
            case "초급":
                return `${isActive
                    ? "bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-200"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"} 
            transition-all duration-200 ease-in-out transform ${isActive ? "scale-105" : "hover:scale-105"}`;
            case "중급":
                return `${isActive
                    ? "bg-blue-500 text-white shadow-lg ring-2 ring-blue-200"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"} 
            transition-all duration-200 ease-in-out transform ${isActive ? "scale-105" : "hover:scale-105"}`;
            case "고급":
                return `${isActive
                    ? "bg-purple-500 text-white shadow-lg ring-2 ring-purple-200"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"} 
            transition-all duration-200 ease-in-out transform ${isActive ? "scale-105" : "hover:scale-105"}`;
            default:
                return "";
        }
    };

    return (
        <PageLayout>
            <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
            <div className="max-w-3xl mx-auto p-4">
                {/* 헤더 */}
                <div className="relative mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 top-0 flex items-center space-x-2 text-gray-600 hover:text-[#8B85E9] transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>뒤로가기</span>
                    </button>
                </div>

                {/* 스터디/프로젝트 선택 슬라이더 */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-[360px]">
                        {/* 보라색 바 */}
                        <div className="bg-[#8B85E9] rounded-full h-10 shadow-md relative flex items-center px-1">
                            {/* 슬라이더 (하얀 버튼) */}
                            <div
                                className={`absolute top-1 left-1 h-8 w-[calc(50%-4px)] bg-white rounded-full shadow transition-transform duration-300 ${studyType === "project" ? "translate-x-full" : "translate-x-0"
                                    }`}
                            />

                            {/* 버튼들 */}
                            <button
                                onClick={() => {
                                    setStudyType("study");
                                    // 스터디로 변경할 때 태그 초기화
                                    setStudyData(prev => ({
                                        ...prev,
                                        tags: []
                                    }));
                                }}
                                className={`flex-1 z-10 text-sm font-medium transition-colors duration-300 ${studyType === "study" ? "text-[#8B85E9]" : "text-white"
                                    }`}
                            >
                                스터디 생성
                            </button>
                            <button
                                onClick={() => {
                                    setStudyType("project");
                                    // 프로젝트로 변경할 때 태그 초기화
                                    setStudyData(prev => ({
                                        ...prev,
                                        tags: []
                                    }));
                                }}
                                className={`flex-1 z-10 text-sm font-medium transition-colors duration-300 ${studyType === "project" ? "text-[#8B85E9]" : "text-white"
                                    }`}
                            >
                                프로젝트 생성
                            </button>
                        </div>
                    </div>
                </div>

                {/* 스터디 생성 폼 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 제목 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {studyType === 'study' ? '스터디' : '프로젝트'} 제목 *
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <input
                                type="text"
                                value={studyData.title}
                                onChange={(e) => {
                                    setStudyData({ ...studyData, title: e.target.value });
                                    if (errors.title) {
                                        setErrors(prev => ({ ...prev, title: '' }));
                                    }
                                }}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] ${errors.title ? 'placeholder-red-500' : 'placeholder-gray-500'
                                    }`}
                                placeholder={errors.title || `${studyType === 'study' ? '스터디' : '프로젝트'} 제목을 입력해주세요.`}
                                style={{ color: errors.title ? '#dc2626' : '#1f2937' }}
                            />
                        </div>
                        {errors.title && (
                            <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>

                    {/* 소개 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {studyType === 'study' ? '스터디' : '프로젝트'} 소개 *
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <input
                                type="text"
                                value={studyData.introduction}
                                onChange={(e) => {
                                    setStudyData({ ...studyData, introduction: e.target.value });
                                    if (errors.introduction) {
                                        setErrors(prev => ({ ...prev, introduction: '' }));
                                    }
                                }}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] ${errors.introduction ? 'placeholder-red-500' : 'placeholder-gray-500'
                                    }`}
                                placeholder={errors.introduction || `${studyType === 'study' ? '스터디' : '프로젝트'} 소개를 입력해주세요.`}
                                style={{ color: errors.introduction ? '#dc2626' : '#1f2937' }}
                            />
                        </div>
                        {errors.introduction && (
                            <p className="mt-2 text-sm text-red-500">{errors.introduction}</p>
                        )}
                    </div>

                    {/* 태그 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                태그 <span className="text-gray-500">({studyData.tags.length}/5)</span>
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex flex-wrap gap-2 items-center">
                                {/* 선택된 태그들 */}
                                {studyData.tags.map((tag, index) => {
                                    const colors = tag.difficulty ? getDifficultyColors(tag.difficulty) : getDifficultyColors('');
                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm border-2 ${colors.bgColor} ${colors.textColor} ${colors.borderColor}`}
                                        >
                                            <span>#{tag.name}</span>
                                            {tag.difficulty && (
                                                <span className="ml-1 text-xs opacity-75">({tag.difficulty})</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1 hover:opacity-70 transition-opacity duration-200"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* 태그 찾기 버튼 */}
                                <button
                                    type="button"
                                    onClick={handleOpenTagModal}
                                    className="px-3 py-2 border-2 border-dashed border-[#8B85E9] text-[#8B85E9] rounded-lg hover:bg-[#8B85E9] hover:text-white transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <Search className="w-5 h-5" />
                                    <span>태그 찾기</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 최대 인원 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {studyType === 'study' ? '스터디' : '프로젝트'} 최대 인원 *
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-4">
                                {/* 슬라이더 */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={studyData.maxMembers || 1}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                setStudyData({ ...studyData, maxMembers: value });
                                                if (errors.maxMembers) {
                                                    setErrors(prev => ({ ...prev, maxMembers: '' }));
                                                }
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                            style={{
                                                background: `linear-gradient(to right, #8B85E9 0%, #8B85E9 ${((studyData.maxMembers || 1) - 1) / 99 * 100}%, #e5e7eb ${((studyData.maxMembers || 1) - 1) / 99 * 100}%, #e5e7eb 100%)`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* 숫자 입력 필드 */}
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={studyData.maxMembers || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // 빈 값이거나 숫자만 입력 가능하도록 필터링
                                            if (value === '' || /^\d+$/.test(value)) {
                                                if (value === '') {
                                                    setStudyData({ ...studyData, maxMembers: 0 });
                                                } else {
                                                    const numValue = parseInt(value);
                                                    if (numValue >= 1 && numValue <= 100) {
                                                        setStudyData({ ...studyData, maxMembers: numValue });
                                                    }
                                                }
                                            }
                                            if (errors.maxMembers) {
                                                setErrors(prev => ({ ...prev, maxMembers: '' }));
                                            }
                                        }}
                                        className={`w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] ${errors.maxMembers ? 'border-red-500' : ''}`}
                                        style={{ color: errors.maxMembers ? '#dc2626' : '#1f2937' }}
                                    />
                                    <span className="ml-2 text-gray-700 font-medium">명</span>
                                </div>
                            </div>
                        </div>
                        {errors.maxMembers && (
                            <p className="mt-2 text-sm text-red-500">{errors.maxMembers}</p>
                        )}
                    </div>

                    {/* 요일 선택 - 스터디일 때만 표시 */}
                    {studyType === 'study' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        스터디 요일 선택 *
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    {getSelectedDayCount() > 0 && (
                                        <div className="px-3 py-1 bg-indigo-100 rounded-full">
                                            <span className="text-sm" style={{ color: "#8B85E9" }}>
                                                <span className="font-bold">{getSelectedDayCount()}</span>개 선택됨
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={toggleAllDays}
                                        className="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                                        style={{ backgroundColor: "#8B85E9", color: "white" }}
                                    >
                                        {Object.values(studyData.selectedDays).some(day => day) ? '전체 해제' : '전체 선택'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex flex-wrap gap-4 justify-center">
                                    {Object.entries(studyData.selectedDays).map(([dayKey]) => {
                                        const dayNames = ["월", "화", "수", "목", "금", "토", "일"];
                                        const dayIndex = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(dayKey);
                                        const dayName = dayNames[dayIndex];

                                        return (
                                            <label key={dayKey} className="cursor-pointer group">
                                                <div className={`relative w-16 h-16 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${studyData.selectedDays[dayKey as keyof typeof studyData.selectedDays]
                                                        ? 'border-transparent shadow-lg'
                                                        : 'border-gray-300 bg-white hover:border-gray-400'
                                                    }`}
                                                    style={studyData.selectedDays[dayKey as keyof typeof studyData.selectedDays] ? { backgroundColor: '#8B85E9' } : {}}>
                                                    <input
                                                        type="checkbox"
                                                        checked={studyData.selectedDays[dayKey as keyof typeof studyData.selectedDays]}
                                                        onChange={() => toggleDay(dayKey)}
                                                        className="absolute opacity-0"
                                                    />
                                                    <div className="flex items-center justify-center h-full">
                                                        {studyData.selectedDays[dayKey as keyof typeof studyData.selectedDays] ? (
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
                            {errors.selectedDays && (
                                <p className="mt-2 text-sm text-red-500">{errors.selectedDays}</p>
                            )}
                        </div>
                    )}

                    {/* 시간대 선택 - 스터디일 때만 표시 */}
                    {studyType === 'study' && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    스터디 시간대 선택 *
                                </h3>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center justify-center gap-12">
                                    {/* 시작 시간 입력 */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sun className="w-5 h-5" style={{ color: '#8B85E9' }} />
                                            <label className="text-lg font-semibold text-gray-800">시작 시간</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={studyData.startTime || ''}
                                                onChange={(e) => setTimeSlot('start', parseInt(e.target.value))}
                                                className="time-select w-32 px-4 py-3 text-lg font-semibold text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                                                style={{
                                                    borderColor: studyData.startTime !== null ? '#8B85E9' : undefined
                                                }}
                                            >
                                                <option value="" disabled>시간 선택</option>
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i} className="text-center">
                                                        {i.toString().padStart(2, '0')}시
                                                    </option>
                                                ))}
                                            </select>
                                            {studyData.startTime !== null && (
                                                <div className="absolute -top-2 -right-2">
                                                    <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 구분선 */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, #8B85E9, #A855F7)' }}></div>
                                        <span className="text-2xl font-bold" style={{ color: '#8B85E9' }}>~</span>
                                        <div className="w-12 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, #8B85E9, #A855F7)' }}></div>
                                    </div>

                                    {/* 종료 시간 입력 */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Moon className="w-5 h-5" style={{ color: '#8B85E9' }} />
                                            <label className="text-lg font-semibold text-gray-800">마침 시간</label>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={studyData.endTime || ''}
                                                onChange={(e) => setTimeSlot('end', parseInt(e.target.value))}
                                                className="time-select w-32 px-4 py-3 text-lg font-semibold text-center border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                                                style={{
                                                    borderColor: studyData.endTime !== null ? '#8B85E9' : undefined
                                                }}
                                            >
                                                <option value="" disabled>시간 선택</option>
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i} className="text-center">
                                                        {i.toString().padStart(2, '0')}시
                                                    </option>
                                                ))}
                                            </select>
                                            {studyData.endTime !== null && (
                                                <div className="absolute -top-2 -right-2">
                                                    <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 시간 유효성 메시지 */}
                                {studyData.startTime !== null && studyData.endTime !== null && (
                                    <div className="mt-6 text-center">
                                        {isTimeSlotValid() ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-full">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-800">
                                                    {studyData.endTime! - studyData.startTime!}시간 활동 시간
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
                            {errors.timeSlot && (
                                <p className="mt-2 text-sm text-red-500">{errors.timeSlot}</p>
                            )}
                        </div>
                    )}

                    {/* 설명 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {studyType === 'study' ? '스터디' : '프로젝트'} 설명 *
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <textarea
                                value={studyData.description}
                                onChange={(e) => {
                                    setStudyData({ ...studyData, description: e.target.value });
                                    if (errors.description) {
                                        setErrors(prev => ({ ...prev, description: '' }));
                                    }
                                }}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] resize-none ${errors.description ? 'placeholder-red-500' : 'placeholder-gray-500'
                                    }`}
                                rows={4}
                                placeholder={errors.description || `${studyType === 'study' ? '스터디' : '프로젝트'}에 대한 상세한 설명을 입력해주세요.`}
                                style={{ color: errors.description ? '#dc2626' : '#1f2937' }}
                            />
                        </div>
                        {errors.description && (
                            <p className="mt-2 text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200 font-medium"
                        >
                            {studyType === 'study' ? '스터디 생성' : '프로젝트 생성'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 태그 검색 모달 */}
            {isTagModalOpen && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center z-50" onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        handleComplete();
                    }
                }}>
                    <div className="bg-white rounded-lg p-4 w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">태그 찾기</h3>
                            <span className="ml-2 text-sm text-gray-500">({studyData.tags.length}/5)</span>
                        </div>

                        {/* 검색창을 위로 */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={tagSearchValue}
                                onChange={(e) => setTagSearchValue(e.target.value)}
                                placeholder="태그를 검색해주세요."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                autoFocus
                                disabled={studyType === 'study' && !selectedDifficulty}
                            />
                        </div>

                        {/* 카테고리 필터 버튼들을 아래로 - 스터디일 때만 표시 */}
                        {studyType === 'study' && (
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory(null)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 whitespace-nowrap ${selectedCategory === null
                                                ? 'bg-[#8B85E9] text-white border-[#8B85E9]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        전체
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory(1)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 whitespace-nowrap ${selectedCategory === 1
                                                ? 'bg-[#8B85E9] text-white border-[#8B85E9]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        프로그래밍 언어
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory(2)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 whitespace-nowrap ${selectedCategory === 2
                                                ? 'bg-[#8B85E9] text-white border-[#8B85E9]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        라이브러리 & 프레임워크
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory(3)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 whitespace-nowrap ${selectedCategory === 3
                                                ? 'bg-[#8B85E9] text-white border-[#8B85E9]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        데이터베이스
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory(4)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 whitespace-nowrap ${selectedCategory === 4
                                                ? 'bg-[#8B85E9] text-white border-[#8B85E9]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        플랫폼/환경
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory(5)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-200 whitespace-nowrap ${selectedCategory === 5
                                                ? 'bg-[#8B85E9] text-white border-[#8B85E9]'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        AI/데이터
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 난이도 선택을 아래로 - 스터디일 때만 표시 */}
                        {studyType === 'study' && (
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-800 mb-3 text-sm">난이도 선택 *</h4>
                                <div className="flex gap-3">
                                    {(['초급', '중급', '고급'] as const).map((difficulty) => (
                                        <button
                                            key={difficulty}
                                            type="button"
                                            onClick={() => setSelectedDifficulty(difficulty)}
                                            className={`flex-1 py-2 px-3 rounded-xl font-semibold text-sm ${getDifficultyButtonStyle(difficulty)}`}
                                        >
                                            {difficulty}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="max-h-60 overflow-y-auto pr-2" onClick={(e) => e.stopPropagation()}>
                            {filteredTags.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredTags.map((category) => (
                                        <div key={category.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                                            <h4 className="font-semibold text-gray-800 mb-2 text-sm">{category.name}</h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                {category.tags.map((tag) => {
                                                    const isSelected = studyData.tags.some(t => t.name === tag);
                                                    const selectedTag = studyData.tags.find(t => t.name === tag);
                                                    const colors = selectedTag?.difficulty ? getDifficultyColors(selectedTag.difficulty) : null;
                                                    
                                                    return (
                                                        <button
                                                            key={tag}
                                                            onClick={() => handleTagSelect(tag)}
                                                            className={`p-2 text-center rounded-lg border transition-colors duration-200 text-xs select-none ${
                                                                isSelected
                                                                    ? `${colors?.bgColor || 'bg-[#8B85E9]'} ${colors?.textColor || 'text-white'} ${colors?.borderColor || 'border-[#8B85E9]'} cursor-pointer hover:opacity-80`
                                                                    : studyData.tags.length >= 5
                                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-[#8B85E9] hover:text-white hover:border-[#8B85E9] cursor-pointer'
                                                            }`}
                                                        >
                                                            #{tag}
                                                            {selectedTag?.difficulty && (
                                                                <div className="text-xs opacity-75">({selectedTag.difficulty})</div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>검색 결과가 없습니다.</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleComplete}
                                className="px-4 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200"
                            >
                                완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default StudyCreate;

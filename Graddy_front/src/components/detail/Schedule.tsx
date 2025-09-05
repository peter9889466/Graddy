// 과제 / 일정 관리
import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Calendar } from 'lucide-react';
import { apiPost, apiGet, apiDelete, apiPut } from '../../services/api';

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


// 과제 수정 데이터 타입 정의
interface UpdateAssignmentData {
    title: string;
    description: string;
    deadline: string;
    fileUrl?: string;
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
    
    // AI 과제 생성 관련 상태
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiGeneratedAssignment, setAiGeneratedAssignment] = useState<any>(null);
    const [showAIPreview, setShowAIPreview] = useState(false);
    const [isAIAssignmentSaved, setIsAIAssignmentSaved] = useState(false); // AI 과제 저장 여부 추적

    // 일정 수정 관련 상태
    const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
    const [editingData, setEditingData] = useState({
        title: '',
        date: '',
        time: ''
    });

    // 과제 및 일정 목록 로드
    useEffect(() => {
        console.log('Schedule 컴포넌트 마운트 - studyProjectId:', studyProjectId);
        if (studyProjectId > 0) {
            loadAssignments();
            loadSchedules();
        } else {
            console.log('studyProjectId가 0 이하입니다:', studyProjectId);
        }
    }, [studyProjectId]);

    const loadAssignments = async () => {
        setIsLoading(true);
        try {
            console.log('과제 목록 로드 시도 - studyProjectId:', studyProjectId);
            
            // DB에서 과제 목록 가져오기
            const response = await apiGet(`/assignments/study-project/${studyProjectId}`);
            console.log('과제 목록 응답:', response);
            
            // API 응답 구조 확인 - response.data.data 구조 처리
            let assignmentsData = null;
            
            if (response?.data?.data && Array.isArray(response.data.data)) {
                assignmentsData = response.data.data;
            } else if (response?.data && Array.isArray(response.data)) {
                assignmentsData = response.data;
            }
            
            if (assignmentsData) {
                const assignments = assignmentsData.map((assignment: any) => ({
                    id: assignment.assignmentId.toString(),
                    title: assignment.title,
                    type: 'assignment' as const,
                    date: new Date(assignment.deadline).toISOString().split('T')[0],
                    description: assignment.description || '',
                    fileUrl: assignment.fileUrl || '',
                    createdAt: assignment.createdAt,
                    isExpanded: false
                }));
                
                console.log('변환된 과제 목록:', assignments);
                
                // 기존 일정은 유지하고 과제만 업데이트
                setScheduleItems(prevItems => {
                    const existingSchedules = prevItems.filter(item => item.type === 'schedule');
                    return [...assignments, ...existingSchedules];
                });
            } else {
                console.log('과제 데이터가 없거나 예상과 다른 구조:', response);
                // 일정만 유지하고 과제는 빈 배열로 설정
                setScheduleItems(prevItems => prevItems.filter(item => item.type === 'schedule'));
            }

        } catch (error) {
            console.error('과제 목록 로드 실패:', error);
            console.log('백엔드 API 호출 실패, 기존 일정만 유지');
            setScheduleItems(prevItems => prevItems.filter(item => item.type === 'schedule'));
        } finally {
            setIsLoading(false);
        }
    };

    const loadSchedules = async () => {
        try {
            console.log('일정 목록 로드 시도 - studyProjectId:', studyProjectId);
            
            // DB에서 일정 목록 가져오기 (정확한 엔드포인트)
            const response = await apiGet(`/schedules/study/${studyProjectId}`);
            console.log('일정 목록 응답:', response);
            
            // 응답이 직접 배열인 경우와 data 프로퍼티에 배열이 있는 경우 모두 처리
            const scheduleData = response?.data || response;
            
            if (scheduleData && Array.isArray(scheduleData)) {
                const schedules = scheduleData.map((schedule: any) => ({
                    id: schedule.schId.toString(),
                    title: schedule.content,
                    type: 'schedule' as const,
                    date: schedule.schTime.split('T')[0],
                    time: schedule.schTime.split('T')[1].substring(0, 5),
                    description: schedule.content,
                    createdAt: schedule.schTime,
                    isExpanded: false
                }));
                
                // 기존 과제는 유지하고 일정만 업데이트
                setScheduleItems(prevItems => {
                    const existingAssignments = prevItems.filter(item => item.type === 'assignment');
                    return [...existingAssignments, ...schedules];
                });
            } else {
                console.log('일정 데이터가 없거나 배열이 아닙니다:', scheduleData);
            }
        } catch (error) {
            console.error('일정 목록 로드 실패:', error);
        }
    };

    const handleAddItem = async () => {
        console.log('handleAddItem 함수 호출됨');
        console.log('newItem:', newItem);
        console.log('activeTab:', activeTab);
        console.log('aiGeneratedAssignment:', aiGeneratedAssignment);
        
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

                    // AI 생성된 과제인지 확인하고 중복 생성 방지
                    if (aiGeneratedAssignment) {
                        console.log('AI 생성된 과제를 최종 저장 처리 중...');
                        
                        // 이미 저장된 AI 과제인지 확인
                        if (isAIAssignmentSaved) {
                            alert('이 AI 과제는 이미 저장되었습니다. 중복 저장을 방지합니다.');
                            return;
                        }
                        
                        console.log('AI 기반 과제 최종 저장 진행...');
                    } else {
                        console.log('일반 수동 과제 생성 중...');
                    }

                    // 과제 추가 API 호출 (AI 생성 여부와 관계없이 항상 새로 생성)
                    const assignmentData = {
                        studyProjectId: studyProjectId,
                        memberId: memberId,
                        title: newItem.title,
                        description: newItem.description || '',
                        deadline: new Date(newItem.date).toISOString(),
                        fileUrl: selectedFile ? selectedFile.name : '', // 임시로 파일명 저장
                        isAIGenerated: !!aiGeneratedAssignment // AI 생성 여부 표시
                    };

                    console.log('과제 추가 데이터:', assignmentData);
                    
                    try {
                        const response = await apiPost('/assignments', assignmentData);
                        console.log('과제 추가 응답:', response);

                        // 응답 구조 확인 및 처리
                        const responseData = response?.data || response;
                        console.log('response 전체:', response);
                        console.log('responseData:', responseData);
                        
                        if (responseData) {
                            alert('과제가 추가되었습니다!');
                            
                            // AI 생성된 과제였다면 저장 상태 업데이트
                            if (aiGeneratedAssignment) {
                                setIsAIAssignmentSaved(true);
                                console.log('AI 과제 저장 완료 - 상태 업데이트됨');
                            }
                            
                            // 폼 및 AI 상태 완전 초기화
                            setNewItem({ title: '', description: '', date: '', time: '' });
                            setSelectedFile(null);
                            setIsAdding(false);
                            setShowAIPreview(false);
                            setAiGeneratedAssignment(null);
                            setIsAIAssignmentSaved(false);
                            
                            // 과제 목록 다시 로드
                            await loadAssignments();
                            
                            return; // 성공 시 여기서 종료
                        } else {
                            throw new Error('응답 데이터가 없습니다');
                        }
                    } catch (apiError) {
                        console.error('과제 추가 API 호출 실패:', apiError);
                        alert('과제 추가에 실패했습니다. 다시 시도해주세요.');
                        return; // 실패 시 여기서 종료
                    }
                } else {
                    // 일정 추가 API 호출
                    const scheduleData = {
                        userId: userId,
                        studyProjectId: studyProjectId,
                        content: newItem.title,
                        schTime: `${newItem.date}T${newItem.time || '00:00'}`
                    };

                    console.log('일정 추가 데이터:', scheduleData);
                    
                    try {
                        const response = await apiPost('/schedules/study', scheduleData);
                        console.log('일정 추가 응답:', response);

                        const responseData = response?.data || response;
                        if (responseData) {
                            alert('일정이 추가되었습니다!');
                            
                            // 폼 초기화
                            setNewItem({ title: '', description: '', date: '', time: '' });
                            setSelectedFile(null);
                            setIsAdding(false);
                            
                            // 일정 목록 다시 로드
                            await loadSchedules();
                            
                            return; // 성공 시 여기서 종료
                        } else {
                            throw new Error('응답 데이터가 없습니다');
                        }
                    } catch (apiError) {
                        console.error('일정 추가 API 호출 실패:', apiError);
                        alert('일정 추가에 실패했습니다. 다시 시도해주세요.');
                        return; // 실패 시 여기서 종료
                    }
                }
            } catch (error) {
                console.error('추가 실패:', error);
                alert('추가에 실패했습니다. 다시 시도해주세요.');
            }
        } else {
            alert('제목과 날짜를 입력해주세요.');
        }
    };

    // const handleEditItem
    // 과제 수정을 위한 상태 추가 (기존 일정 수정 상태와 함께)
const [editingAssignment, setEditingAssignment] = useState<string | null>(null);
const [editingAssignmentData, setEditingAssignmentData] = useState({
    title: '',
    description: '',
    date: '',
    fileUrl: ''
});

// 과제 수정 시작 함수
const handleEditAssignment = (item: ScheduleItem) => {
    setEditingAssignment(item.id);
    setEditingAssignmentData({
        title: item.title,
        description: item.description || '',
        date: item.date,
        fileUrl: item.fileUrl || ''
    });
};

// 과제 수정 완료 함수
const handleUpdateAssignment = async (assignmentId: string) => {
    if (!editingAssignmentData.title || !editingAssignmentData.date) {
        alert('제목과 마감일을 입력해주세요.');
        return;
    }

    // 마감일 유효성 검사
    const selectedDate = new Date(editingAssignmentData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        alert('과제 마감일은 오늘 이후로 설정해주세요.');
        return;
    }

    try {
        const updateData = {
            title: editingAssignmentData.title,
            description: editingAssignmentData.description,
            deadline: new Date(editingAssignmentData.date).toISOString(),
            fileUrl: editingAssignmentData.fileUrl
        };

        console.log('과제 수정 데이터:', updateData);
        const response = await apiPut(`/assignments/${assignmentId}`, updateData);
        console.log('과제 수정 응답:', response);

        const responseData = response?.data || response;
        if (responseData) {
            alert('과제가 성공적으로 수정되었습니다.');
            
            // 수정 모드 종료
            setEditingAssignment(null);
            setEditingAssignmentData({ title: '', description: '', date: '', fileUrl: '' });
            
            // 과제 목록 다시 로드
            await loadAssignments();
        } else {
            throw new Error('과제 수정에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('과제 수정 중 오류 발생:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        alert(`과제 수정 실패: ${errorMessage}`);
    }
};

// 과제 수정 취소 함수
const handleCancelAssignmentEdit = () => {
    setEditingAssignment(null);
    setEditingAssignmentData({ title: '', description: '', date: '', fileUrl: '' });
};

    const handleDeleteItem = async (id: string, type: 'assignment' | 'schedule') => {
        // 확인 창 띄우기
        const isConfirmed = window.confirm('정말 삭제하시겠습니까?');
        
        if (!isConfirmed) {
            return;
        }

        try {
            if (type === 'assignment') {
                console.log('과제 삭제 요청 - assignmentId:', id);
                const response = await apiDelete(`/assignments/${id}`);
                console.log('과제 삭제 응답:', response);

                const responseData = response?.data || response;
                if (responseData !== undefined) { // null이나 빈 객체도 성공으로 처리
                    alert('과제가 성공적으로 삭제되었습니다.');
                    // 과제 목록 다시 로드
                    await loadAssignments();
                }
            } else {
                console.log('일정 삭제 요청 - schId:', id);
                
                try {
                    await apiDelete(`/schedules/${id}`);
                    console.log('일정 삭제 성공');

                    // 일정 삭제 성공
                    alert('일정이 성공적으로 삭제되었습니다.');
                    // 일정 목록 다시 로드
                    await loadSchedules();
                } catch (deleteError: any) {
                    // JSON 파싱 오류이지만 실제로는 삭제 성공인 경우 처리
                    if (deleteError.message && deleteError.message.includes('Unexpected end of JSON input')) {
                        console.log('일정 삭제 성공 (빈 응답)');
                        alert('일정이 성공적으로 삭제되었습니다.');
                        // 일정 목록 다시 로드
                        await loadSchedules();
                    } else {
                        // 실제 삭제 실패
                        throw deleteError;
                    }
                }
            }
        } catch (error) {
            console.error(`${type === 'assignment' ? '과제' : '일정'} 삭제 실패:`, error);
            alert(`${type === 'assignment' ? '과제' : '일정'} 삭제에 실패했습니다. 다시 시도해주세요.`);
        }
    };

    const handleEditSchedule = (item: ScheduleItem) => {
        
        setEditingSchedule(item.id);
        setEditingData({
            title: item.title,
            date: item.date,
            time: item.time || '00:00'
        });
    };

    const handleUpdateSchedule = async (id: string) => {
        if (!editingData.title || !editingData.date) {
            alert('제목과 날짜를 입력해주세요.');
            return;
        }

        try {
            const updateData = {
                userId: userId,
                studyProjectId: studyProjectId,
                content: editingData.title,
                schTime: new Date(`${editingData.date}T${editingData.time || '00:00'}`).toISOString()
            };

            console.log('일정 수정 데이터:', updateData);
            const response = await apiPut(`/schedules/${id}`, updateData);
            console.log('일정 수정 응답:', response);

            // PUT 요청은 일반적으로 성공 시 수정된 데이터를 반환
            alert('일정이 성공적으로 수정되었습니다.');
            
            // 수정 모드 종료
            setEditingSchedule(null);
            setEditingData({ title: '', date: '', time: '' });
            
            // 일정 목록 다시 로드
            await loadSchedules();
            
        } catch (error) {
            console.error('일정 수정 실패:', error);
            alert('일정 수정에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleCancelEdit = () => {
        setEditingSchedule(null);
        setEditingData({ title: '', date: '', time: '' });
    };

    const handleGenerateAIAssignment = async () => {
        console.log('AI 과제 생성 함수 호출됨 - 프론트엔드 전용 모드');
        
        // 이미 AI 과제가 생성되어 있고 저장되지 않은 상태인지 확인
        if (showAIPreview && aiGeneratedAssignment && !isAIAssignmentSaved) {
            const confirmRegenerate = window.confirm('이미 생성된 AI 과제가 있습니다. 새로 생성하면 기존 내용이 사라집니다. 계속하시겠습니까?');
            if (!confirmRegenerate) {
                return;
            }
        }
        
        setIsGeneratingAI(true);
        
        // 백엔드 호출 없이 프론트엔드에서만 임시 AI 과제 데이터 생성
        try {
            console.log('프론트엔드에서 임시 AI 과제 데이터 생성 중...');
            
            // AI가 생성할 만한 샘플 과제 데이터들
            const sampleAssignments = [
                {
                    title: "JavaScript 기초 문법 연습",
                    description: "변수, 함수, 조건문, 반복문을 활용한 기본 프로그래밍 문제를 해결해보세요.\n\n요구사항:\n1. 변수 선언과 할당\n2. 함수 정의와 호출\n3. if-else 조건문 사용\n4. for/while 반복문 활용\n\n제출 형태: 코드 파일(.js) 또는 설명이 포함된 텍스트 파일"
                },
                {
                    title: "React 컴포넌트 설계 실습",
                    description: "함수형 컴포넌트를 사용하여 간단한 TODO 앱을 만들어보세요.\n\n구현 기능:\n1. 할 일 추가/삭제\n2. 상태 관리 (useState 사용)\n3. 이벤트 핸들링\n4. 조건부 렌더링\n\n제출물: 완성된 컴포넌트 코드와 실행 결과 스크린샷"
                },
                {
                    title: "알고리즘 문제 해결",
                    description: "주어진 배열에서 특정 조건을 만족하는 요소를 찾는 함수를 작성하세요.\n\n문제:\n- 배열에서 중복된 숫자 찾기\n- 가장 큰 수와 가장 작은 수의 차이 구하기\n- 배열을 역순으로 정렬하기\n\n요구사항: 각 문제에 대한 함수 구현과 테스트 케이스 작성"
                },
                {
                    title: "데이터베이스 쿼리 작성",
                    description: "관계형 데이터베이스에서 데이터를 조회하고 조작하는 SQL 쿼리를 작성해보세요.\n\n실습 내용:\n1. SELECT 문을 사용한 데이터 조회\n2. JOIN을 활용한 테이블 결합\n3. GROUP BY를 사용한 집계\n4. 서브쿼리 활용\n\n제출물: 각 요구사항에 맞는 SQL 쿼리문과 실행 결과"
                },
                {
                    title: "웹 API 연동 실습",
                    description: "REST API를 호출하여 데이터를 가져오고 화면에 표시하는 기능을 구현해보세요.\n\n구현 내용:\n1. fetch 또는 axios를 사용한 API 호출\n2. 비동기 처리 (async/await)\n3. 에러 핸들링\n4. 로딩 상태 관리\n\n제출 형태: 완성된 코드와 실행 화면 캡처"
                }
            ];
            
            // 랜덤하게 하나의 과제 선택
            const randomIndex = Math.floor(Math.random() * sampleAssignments.length);
            const selectedAssignment = sampleAssignments[randomIndex];
            
            // 7일 후 마감일 설정
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + 7);
            
            // 임시 AI 과제 데이터 생성
            const aiAssignmentData = {
                title: selectedAssignment.title,
                description: selectedAssignment.description,
                deadline: deadline.toISOString(),
                isAIGenerated: true,
                generatedAt: new Date().toISOString()
            };
            
            console.log('임시 AI 과제 데이터 생성 완료:', aiAssignmentData);
            
            // 생성된 데이터를 상태에 저장
            setAiGeneratedAssignment(aiAssignmentData);
            setShowAIPreview(true);
            
            // AI 생성된 내용을 폼에 미리보기로 채우기
            setNewItem({
                title: aiAssignmentData.title,
                description: aiAssignmentData.description,
                date: deadline.toISOString().split('T')[0],
                time: ''
            });
            
            console.log('AI 과제 미리보기 데이터를 폼에 설정 완료 (백엔드 호출 없음)');
            alert('AI 과제가 생성되었습니다!');
            
        } catch (error) {
            console.error('프론트엔드 AI 과제 생성 실패:', error);
            alert('AI 과제 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleCancelAIAssignment = () => {
        setShowAIPreview(false);
        setAiGeneratedAssignment(null);
        setIsAIAssignmentSaved(false);
        // 폼 초기화
        setNewItem({ title: '', description: '', date: '', time: '' });
        console.log('AI 과제 생성 취소됨');
    };

    const toggleItemExpansion = (id: string) => {
        setScheduleItems(scheduleItems.map(item =>
            item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
        ));
    };

    const filteredItems = scheduleItems.filter(item => item.type === activeTab);
    console.log('필터링된 아이템:', filteredItems, 'activeTab:', activeTab, '전체 아이템:', scheduleItems);

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
                                    {item.type === 'assignment' ? (
                                        // 과제: 토글 형태
                                        <>
                                            {/* 헤더 (항상 표시) */}
                                            <div 
                                                className="flex items-center justify-between p-4 cursor-pointer"
                                                onClick={() => toggleItemExpansion(item.id)}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <BookOpen className="w-4 h-4 text-purple-600" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-800">{item.title}</h4>
                                                        <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                            마감일: {item.date}
                                                            {isOverdue && ' (마감됨)'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditAssignment(item);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200 text-sm"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteItem(item.id, 'assignment');
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
                                                    {editingAssignment === item.id ? (
                                                        // 과제 수정 기능 포함
                                                        <div className="space-y-3 mt-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    과제 제목
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={editingAssignmentData.title}
                                                                    onChange={(e) => setEditingAssignmentData({...editingAssignmentData, title: e.target.value})}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    과제 설명
                                                                </label>
                                                                <textarea
                                                                    value={editingAssignmentData.description}
                                                                    onChange={(e) => setEditingAssignmentData({...editingAssignmentData, description: e.target.value})}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                                                    rows={3}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    마감일
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    value={editingAssignmentData.date}
                                                                    onChange={(e) => setEditingAssignmentData({...editingAssignmentData, date: e.target.value})}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                                                    min={new Date().toISOString().split('T')[0]}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    파일 URL
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={editingAssignmentData.fileUrl}
                                                                    onChange={(e) => setEditingAssignmentData({...editingAssignmentData, fileUrl: e.target.value})}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2 pt-2">
                                                                <button
                                                                    onClick={() => handleUpdateAssignment(item.id)}
                                                                    className="px-3 py-1.5 bg-[#8B85E9] text-white text-sm rounded-md hover:bg-[#7A73E8] transition-colors duration-200"
                                                                >
                                                                    저장
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelAssignmentEdit}
                                                                    className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors duration-200"
                                                                >
                                                                    취소
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                    <>
                                                    <div className="flex items-center gap-3">
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
                                                                    <span className="text-gray-600 ml-1">{item.fileUrl}</span>
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
                                                    </>
                                                    
                                                    )}
                                                </div>
                                            )}
                                            
                                        </>
                                    ) : (
                                        // 일정: 수정 기능 포함
                                        <div className="p-4">
                                            {editingSchedule === item.id ? (
                                                // 수정 모드
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            일정 제목
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editingData.title}
                                                            onChange={(e) => setEditingData({...editingData, title: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                날짜
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={editingData.date}
                                                                onChange={(e) => setEditingData({...editingData, date: e.target.value})}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                                                min={new Date().toISOString().split('T')[0]}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                시간
                                                            </label>
                                                            <select
                                                                value={editingData.time}
                                                                onChange={(e) => setEditingData({...editingData, time: e.target.value})}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                                            >
                                                                {Array.from({ length: 24 }, (_, i) => {
                                                                    const hour = i.toString().padStart(2, '0');
                                                                    return (
                                                                        <option key={hour} value={`${hour}:00`}>
                                                                            {hour}:00
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleUpdateSchedule(item.id)}
                                                            className="px-3 py-1.5 bg-[#8B85E9] text-white text-sm rounded-md hover:bg-[#7A73E8] transition-colors duration-200"
                                                        >
                                                            저장
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors duration-200"
                                                        >
                                                            취소
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // 일반 표시 모드
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="w-4 h-4 text-blue-600" />
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-800">{item.title}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                일정: {item.date} {item.time}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleEditSchedule(item)}
                                                                className="text-blue-500 hover:text-blue-700 transition-colors duration-200 text-sm"
                                                            >
                                                                수정
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(item.id, 'schedule')}
                                                                className="text-red-500 hover:text-red-700 transition-colors duration-200 text-sm"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* {item.createdAt 
                                                    && (
                                                        <div className="mt-2">
                                                            <p className="text-xs text-gray-400">
                                                                생성일: {new Date(item.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )} */}
                                                </>
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
                                    onClick={handleGenerateAIAssignment}
                                    disabled={isGeneratingAI}
                                    className={`px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
                                        isGeneratingAI 
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:from-purple-600 hover:to-pink-600'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    {isGeneratingAI ? 'AI 생성 중...' : 'AI로 과제 추가'}
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
                                        일정 날짜 및 시간
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={newItem.date}
                                            onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                            placeholder="날짜 선택"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        <select
                                            value={newItem.time}
                                            onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                        >
                                            <option value="">시간 선택</option>
                                            {Array.from({ length: 24 }, (_, i) => {
                                                const hour = i.toString().padStart(2, '0');
                                                return (
                                                    <option key={hour} value={`${hour}:00`}>
                                                        {hour}:00
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>
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
                                        key={isAdding ? 'adding' : 'not-adding'}
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
                        {/* AI 생성 알림 */}
                        {showAIPreview && aiGeneratedAssignment && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span className="text-sm font-medium text-purple-800">AI가 과제 내용을 생성했습니다! 내용을 확인 후 아래 "추가" 버튼을 눌러 과제를 생성하세요.</span>
                                    <button
                                        onClick={handleCancelAIAssignment}
                                        className="ml-auto text-purple-600 hover:text-purple-800 text-sm"
                                    >
                                        초기화
                                    </button>
                                </div>
                            </div>
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
                                    setShowAIPreview(false);
                                    setAiGeneratedAssignment(null);
                                    setIsAIAssignmentSaved(false);
                                    // 파일 입력 필드 초기화
                                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                    if (fileInput) {
                                        fileInput.value = '';
                                    }
                                    console.log('과제 추가 폼 취소됨 - 모든 상태 초기화');
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
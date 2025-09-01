import React, { useRef, useState, useContext, useEffect } from 'react'
import ChartComponent from '../detail/chart/LineChart'; // 위에서 만든 Chart 컴포넌트
import { LineChart, MessageCircle, Reply, Trash2, User, Paperclip } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useAssignmentContext } from '../../contexts/AssignmentContext';

interface SubmissionData {   
    submissionId: number;
    assignmentId: number;
    memberId: number;
    content: string;
    fileUrl: string;
    createdAt: string;
}

interface ApiResponse {
    status: number;
    message: string;
    data: SubmissionData[];
}

interface AssignmentSubmissionData {
    submissionId: number;
    assignmentId: number;
    memberId: number;
    content: string;
    fileUrl: string;
    createdAt: string;
}

interface AssignmentSubmissionResponse {
    status: number;
    message: string;
    data: AssignmentSubmissionData[];
}

// 개별 제출 조회를 위한 인터페이스
interface SingleSubmissionResponse {
    status: number;
    message: string;
    data: {
        submissionId: number;
        assignmentId: number;
        memberId: number;
        content: string;
        fileUrl: string | null;
        createdAt: string;
    };
}

// AI 피드백 응답 인터페이스 수정
interface FeedbackResponse {
    status: number;
    message: string;
    data: Array<{
        feedId: number;
        memberId: number;
        submissionId: number;
        score: number;
        comment: string;
        createdAt: string;
    }>;
}

interface FeedBackProps {
    studyProjectId: number;
    currentUserId: string;
    members: Array<{
        memberId: number;
        userId: string;
        nick: string;
        memberType: string;
        memberStatus: string;
        joinedAt: string;
    }>;
}

const FeedBack: React.FC<FeedBackProps> = ({ 
    studyProjectId, 
    currentUserId, 
    members 
}) => {
    const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
    const [isMemberOpen, setIsMemberOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState('과제를 선택하세요');
    const [selectedMember, setSelectedMember] = useState('스터디원을 선택하세요');
    const [assignmentContent, setAssignmentContent] = useState('');
    const assignmentDropdownRef = useRef<HTMLDivElement>(null);
    const memberDropdownRef = useRef<HTMLDivElement>(null);
    const authContext = useContext(AuthContext);
    const { getSubmissionByAssignment } = useAssignmentContext();
    const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmissionData[]>([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [currentSubmissionData, setCurrentSubmissionData] = useState<any>(null);
    
    // AI 피드백 관련 상태
    const [aiFeedback, setAiFeedback] = useState<string>('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackScore, setFeedbackScore] = useState<number | null>(null);

    // 댓글 관련 상태
    const [comments, setComments] = useState([
        {
            id: '1',
            content: 'AI 피드백이 정말 도움이 되었습니다!',
            author: '김철수',
            timestamp: '2024-01-15 14:30',
            replies: [
                {
                    id: '1-1',
                    content: '저도 동감합니다!',
                    author: '이영희',
                    timestamp: '2024-01-15 15:00',
                    parentId: '1'
                }
            ]
        },
        {
            id: '2',
            content: '다음 과제도 기대됩니다.',
            author: '박민수',
            timestamp: '2024-01-15 16:20',
            replies: []
        }
    ]);

    const [newComment, setNewComment] = useState('');
    const [newReply, setNewReply] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    
    const fetchAssignments = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/assignments/study-project/${studyProjectId}`);
            const data = await response.json();
            
            if (data.status === 200) {
                setAssignments(data.data || []);
            }
        } catch (err) {
            console.error('과제 목록 조회 실패:', err);
        }
    };

    // AI 피드백 조회 함수
    const generateAIFeedback = async (submissionId: number) => {
        try {
            setFeedbackLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:8080/api/feedbacks/submission/${submissionId}`);
            const data: FeedbackResponse = await response.json();
            
            if (data.status === 200 && data.data.length > 0) {
                // 배열의 첫 번째 피드백 사용 (가장 최신 또는 유일한 피드백)
                const feedback = data.data[0];
                setAiFeedback(feedback.comment);
                setFeedbackScore(feedback.score);
            } else {
                throw new Error(data.message || 'AI 피드백 조회 실패');
            }
        } catch (err: any) {
            console.error('AI 피드백 조회 실패:', err);
            setError('AI 피드백을 불러오는 데 실패했습니다.');
            setAiFeedback('');
            setFeedbackScore(null);
        } finally {
            setFeedbackLoading(false);
        }
    };

    // 개별 제출 내용을 가져오는 함수
    const fetchSubmissionContent = async (assignmentId: number, memberId: number) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:8080/api/submissions/assignment/${assignmentId}/member/${memberId}`);
            const data: SingleSubmissionResponse = await response.json();
            
            if (data.status === 200) {
                setCurrentSubmissionData(data.data);
                setAssignmentContent(data.data.content);
                
                // 과제 내용을 가져온 후 AI 피드백 자동 생성
                await generateAIFeedback(data.data.submissionId);
            } else {
                throw new Error(data.message || 'API 응답 오류');
            }
        } catch (err: any) {
            console.error('과제 내용 조회 실패:', err);
            setError('과제 내용을 불러오는 데 실패했습니다.');
            setAssignmentContent('');
            setCurrentSubmissionData(null);
            setAiFeedback('');
            setFeedbackScore(null);
        } finally {
            setLoading(false);
        }
    };

    const getAssignmentOptions = () => {
        if (submissions.length === 0) return [];
        
        // assignmentId별로 그룹화하여 중복 제거
        const uniqueAssignments = submissions.reduce((acc, submission) => {
            if (!acc.some(item => item.assignmentId === submission.assignmentId)) {
                // assignments 배열에서 해당 과제 정보 찾기 (과제 제목을 가져오기 위해)
                const assignmentInfo = assignments.find(a => a.assignmentId === submission.assignmentId);
                if(assignmentInfo != null){
                    acc.push({
                        assignmentId: submission.assignmentId,
                        value: `assignment_${submission.assignmentId}`,
                        // label: assignmentInfo ? assignmentInfo.title : `과제 #${submission.assignmentId}`,
                        label: assignmentInfo ? assignmentInfo.title : null,
                        period: assignmentInfo ? new Date(submission.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : null
                        // createdAt: assignmentInfo ? submission.createdAt : null
                    });
                }
            }
            return acc;
        }, [] as any[]);
        
        return uniqueAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const fetchAssignmentSubmissions = async (assignmentId: number) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:8080/api/submissions/assignment/${assignmentId}`);
            const data: AssignmentSubmissionResponse = await response.json();
            
            if (data.status === 200) {
                setAssignmentSubmissions(data.data);
            } else {
                throw new Error(data.message || 'API 응답 오류');
            }
        } catch (err: any) {
            console.error('과제별 제출 목록 조회 실패:', err);
            setError('과제별 제출 목록을 불러오는 데 실패했습니다.');
            setAssignmentSubmissions([]);
        } finally {
            setLoading(false);
        }
    };
    
    const assignmentOptions = getAssignmentOptions();

    // 과제 제출한 사람들의 목록을 동적으로 생성
    const getMemberOptions = () => {
        if (selectedAssignment === '과제를 선택하세요' || assignmentSubmissions.length === 0) {
            return [];
        }
        
        return assignmentSubmissions.map(submission => {
            // members prop에서 해당 멤버 정보 찾기
            const member = members.find(m => m.memberId === submission.memberId);
            
            return {
                value: submission.memberId.toString(),
                label: member ? member.nick : `멤버 #${submission.memberId}`,
                role: member?.memberType === 'leader' ? '스터디장' : '스터디원',
                submissionData: submission
            };
        });
    };

    const memberOptions = getMemberOptions();
    
    const handleAssignmentClick = async (option: { assignmentId: number; value: string; label: string; period: string }) => {
        setSelectedAssignment(option.label);
        setSelectedMember('스터디원을 선택하세요');
        setSelectedAssignmentId(option.assignmentId);
        setIsAssignmentOpen(false);
        setAssignmentContent('');
        
        // AI 피드백 관련 상태 초기화
        setAiFeedback('');
        setFeedbackScore(null);
        setCurrentSubmissionData(null);
        setSelectedMemberId(null);
        
        // 선택된 과제의 제출 목록 가져오기
        await fetchAssignmentSubmissions(option.assignmentId);
    };

    const handleMemberClick = async (option: { value: string; label: string; role: string; submissionData: SubmissionData }) => {
        setSelectedMember(option.label);
        setSelectedMemberId(option.submissionData.memberId);
        setIsMemberOpen(false);
        
        // 새로운 API로 과제 내용 가져오기
        if (selectedAssignmentId) {
            await fetchSubmissionContent(selectedAssignmentId, option.submissionData.memberId);
        }
    };

    const fetchSubmissions = async () => {
        if (!currentUserId) {
            setError('사용자 정보를 찾을 수 없습니다.');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            // 현재 사용자의 memberId 찾기
            const currentMember = members.find(member => member.userId === currentUserId);
            const memberId = currentMember?.memberId;
            
            if (!memberId) {
                setError('멤버 정보를 찾을 수 없습니다.');
                return;
            }
            
            const response = await fetch(`http://localhost:8080/api/submissions/member/${memberId}`);

            const data: ApiResponse = await response.json();

            if (data.status === 200) {
                setSubmissions(data.data); // API 응답 데이터를 submissions 상태에 저장
            } else {
                throw new Error(data.message || 'API 응답 오류');
            }
            
            // 나머지 로직은 동일
        } catch (err) {
            // 에러 처리
            console.error('Failed to fetch submissions:', err);
            setError('과제 제출 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 API 호출
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchSubmissions(),
                fetchAssignments() // 과제 기본 정보 가져오기
            ]);
        };
        
        fetchData();
    }, []);

    // 선택된 과제의 기간 찾기
    const selectedAssignmentData = assignmentOptions.find(option => option.label === selectedAssignment);

    // 드롭다운 외부 클릭 처리
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (assignmentDropdownRef.current && !assignmentDropdownRef.current.contains(event.target as Node)) {
                setIsAssignmentOpen(false);
            }
            if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
                setIsMemberOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 댓글 관련 함수들
    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment = {
                id: Date.now().toString(),
                content: newComment,
                // 닉네임 들어오는 곳
                author: authContext?.isLoggedIn ? '김개발' : '익명 사용자',
                timestamp: new Date().toLocaleString('ko-KR'),
                replies: []
            };
            setComments([...comments, comment]);
            setNewComment('');
        }
    };

    const handleAddReply = (parentId: string) => {
        if (newReply.trim()) {
            const reply = {
                id: `${parentId}-${Date.now()}`,
                content: newReply,
                author: authContext?.isLoggedIn ? '김개발' : '익명 사용자',
                timestamp: new Date().toLocaleString('ko-KR'),
                parentId
            };
            
            setComments(comments.map(comment => 
                comment.id === parentId 
                    ? { ...comment, replies: [...comment.replies, reply] }
                    : comment
            ));
            setNewReply('');
            setReplyingTo(null);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        setComments(comments.filter(comment => comment.id !== commentId));
    };

    const handleDeleteReply = (commentId: string, replyId: string) => {
        setComments(comments.map(comment => 
            comment.id === commentId 
                ? { ...comment, replies: comment.replies.filter(reply => reply.id !== replyId) }
                : comment
        ));
    };

    return (
        <div className="space-y-4 h-[61.5vh] overflow-y-auto p-4 pr-10">

        {/* AI 피드백 소제목 */}
        <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4"
            style={{ color: "#8B85E9" }}>과제 피드백</h2>

            {/* 드롭다운 선택 영역 */}
            <div className="flex flex-col gap-4 mb-4">
                {/* 과제 선택 드롭다운 */}
                <div className="flex-1 relative" ref={assignmentDropdownRef}>
                    <button
                        onClick={() => setIsAssignmentOpen(!isAssignmentOpen)}
                        className={`w-full px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${
                            isAssignmentOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
                        } focus:outline-none`}>
                        <span>{selectedAssignment}</span>
                        <svg 
                            className={`w-4 h-4 transition-transform ${isAssignmentOpen ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {isAssignmentOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                            {assignmentOptions.map((option, index) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleAssignmentClick(option)}
                                    className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${index !== assignmentOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    style={{ 
                                        backgroundColor: selectedAssignment === option.label ? '#E8E6FF' : '#FFFFFF',
                                        color: selectedAssignment === option.label ? '#8B85E9' : '#374151'
                                    }}
                                >
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-gray-500 mt-1">{option.period}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 스터디원 선택 드롭다운 */}
                <div className="flex-1 relative" ref={memberDropdownRef}>
                    <button
                        onClick={() => selectedAssignment !== '과제를 선택하세요' && setIsMemberOpen(!isMemberOpen)}
                        disabled={selectedAssignment === '과제를 선택하세요'}
                        className={`w-full px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${
                            isMemberOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
                        } focus:outline-none ${
                            selectedAssignment === '과제를 선택하세요' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}>
                        <span>{selectedMember}</span>
                        <svg 
                            className={`w-4 h-4 transition-transform ${isMemberOpen ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {isMemberOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                            {memberOptions.length > 0 ? (
                                memberOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        onClick={() => handleMemberClick(option)}
                                        className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${index !== memberOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        style={{ 
                                            backgroundColor: selectedMember === option.label ? '#E8E6FF' : '#FFFFFF',
                                            color: selectedMember === option.label ? '#8B85E9' : '#374151'
                                        }}
                                    >
                                        <div className="font-medium">{option.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{option.role}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-500 text-center">
                                    해당 과제를 제출한 스터디원이 없습니다.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 선택된 과제 제목 및 기간 */}
            {selectedAssignment !== '과제를 선택하세요' && (
                <div>
                    <p className="text-2xl font-semibold text-black">
                        {selectedAssignment} <span className="text-sm text-gray-500 font-normal">[{selectedAssignmentData?.period}]</span>
                    </p>
                    {selectedMember !== '스터디원을 선택하세요' && (
                        <p className="text-sm text-gray-600 mt-1">
                            작성자 : {selectedMember}
                        </p>
                    )}
                </div>
            )}
        <hr className="my-4"/>

            {/* 과제 제출 내용 */}
            <div>
                <p className="text-lg font-bold mb-2 text-gray-500">
                    과제 내용
                </p>
                {selectedAssignment !== '과제를 선택하세요' && selectedMember !== '스터디원을 선택하세요' ? (
                    currentSubmissionData ? (
                        <div className="bg-gray-50 border-2 border-[#8B85E9] rounded-lg p-4">
                            <div className="mb-2 text-sm text-gray-600">
                                <strong>제출일:</strong> {new Date(currentSubmissionData.createdAt).toLocaleString('ko-KR')}
                            </div>
                            <div 
                                className="text-gray-700 text-sm leading-relaxed whitespace-pre-line"
                            >
                                {currentSubmissionData.content}
                            </div>
                            
                            {/* 첨부파일 표시 */}
                            <div className="mt-4 bg-white rounded p-3 border border-gray-200">
                                {currentSubmissionData.fileUrl ? (
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="w-4 h-4 text-gray-400" />
                                            <div className="flex-1">
                                                <button 
                                                    className="text-sm font-medium text-[#8B85E9] hover:text-[#7A75D8] hover:underline transition-colors text-left"
                                                    onClick={() => {
                                                        window.open(currentSubmissionData.fileUrl, '_blank');
                                                    }}
                                                >
                                                    첨부파일 보기
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                                        <p className="text-sm text-gray-500 text-center">첨부파일이 없습니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                            <p className="text-gray-500 text-center">과제 내용을 불러오는 중...</p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                            <p className="text-gray-500 text-center">해당 스터디원의 과제 제출 내용이 없습니다.</p>
                        </div>
                    )
                ) : (
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                        <p className="text-gray-500 text-center">과제와 스터디원을 선택해주세요.</p>
                    </div>
                )}
            </div>

            {/* AI 피드백 */}        
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-bold text-gray-500">
                        AI 피드백
                    </p>
                    {feedbackScore !== null && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">점수:</span>
                            <span className="text-lg font-bold text-[#8B85E9]">{feedbackScore}점</span>
                        </div>
                    )}
                </div>
                <div className="w-full min-h-[120px] p-3 border-2 border-[#8B85E9] rounded-lg bg-gray-50">
                    {feedbackLoading ? (
                        <p className="text-gray-500 text-center">피드백을 생성하는 중입니다...</p>
                    ) : aiFeedback ? (
                        <div className="text-gray-700 text-sm leading-relaxed">
                            {aiFeedback.split('\n').map((line: string, index: number) => (
                                <div key={index}>
                                    {line}
                                    {index < aiFeedback.split('\n').length - 1 && <br />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center">과제와 스터디원을 선택하면 AI 피드백이 생성됩니다.</p>
                    )}
                </div>
                {/* {currentSubmissionData && !feedbackLoading && (
                    <div className="mt-2 flex justify-end">
                        <button
                            onClick={() => generateAIFeedback(currentSubmissionData.submissionId)}
                            className="px-4 py-2 text-white rounded-md transition-colors duration-200"
                            style={{ backgroundColor: "#8B85E9" }}
                        >
                            피드백 재생성
                        </button>
                    </div>
                )} */}
            </div>
    
      {/* 댓글 */}
        <div>
            <p className="text-lg font-bold mb-2 text-gray-500">
                댓글
            </p>
            <hr/>
            
            {/* 댓글 입력 섹션 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#8B85E9] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleAddComment}
                                className="px-4 py-2 text-white rounded-md transition-colors duration-200"
                                style={{ backgroundColor: "#8B85E9" }}
                            >
                                댓글 작성
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 댓글 목록 */}
            <div className="space-y-4 mt-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        {/* 메인 댓글 */}
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-[#8B85E9] rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-800">{comment.author}</span>
                                    <span className="text-sm text-gray-500">{comment.timestamp}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{comment.content}</p>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-[#8B85E9] transition-colors"
                                    >
                                        <Reply className="w-3 h-3" />
                                        <span>답글</span>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        <span>삭제</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 답글 입력 */}
                        {replyingTo === comment.id && (
                            <div className="mt-4 ml-11">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                        <User className="w-3 h-3 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newReply}
                                            onChange={(e) => setNewReply(e.target.value)}
                                            placeholder="답글을 입력하세요..."
                                            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                            rows={2}
                                        />
                                        <div className="flex justify-end mt-2 space-x-2">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-3 py-1 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                            >
                                                취소
                                            </button>
                                            <button
                                                onClick={() => handleAddReply(comment.id)}
                                                className="px-3 py-1 text-white rounded-md transition-colors"
                                                style={{ backgroundColor: "#8B85E9" }}
                                            >
                                                답글 작성
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 답글 목록 */}
                        {comment.replies.length > 0 && (
                            <div className="mt-4 ml-11 space-y-3">
                                {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                            <User className="w-3 h-3 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-gray-800">{reply.author}</span>
                                                <span className="text-sm text-gray-500">{reply.timestamp}</span>
                                            </div>
                                            <p className="text-gray-700 mb-2">{reply.content}</p>
                                            <button
                                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                                className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>삭제</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>아직 댓글이 없습니다.</p>
                    <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
                </div>
            )}
        </div>
        </div>
    )
}

export default FeedBack;
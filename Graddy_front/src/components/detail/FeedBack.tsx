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
    

    const getAssignmentOptions = () => {
        if (submissions.length === 0) return [];
        
        // assignmentId별로 그룹화하여 중복 제거
        const uniqueAssignments = submissions.reduce((acc, submission) => {
            if (!acc.some(item => item.assignmentId === submission.assignmentId)) {
                acc.push({
                    assignmentId: submission.assignmentId,
                    value: `assignment_${submission.assignmentId}`,
                    label: `과제 #${submission.assignmentId}`,
                    period: new Date(submission.createdAt).toLocaleDateString('ko-KR'),
                    createdAt: submission.createdAt
                });
            }
            return acc;
        }, [] as any[]);
        
        return uniqueAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const assignmentOptions = getAssignmentOptions();

    // 과제 제출한 사람들의 목록을 동적으로 생성
    const getMemberOptions = () => {
        if (selectedAssignment === '과제를 선택하세요') {
            return [];
        }
        
        const selectedOption = assignmentOptions.find(option => option.label === selectedAssignment);
        if (!selectedOption) return [];
        
        const assignmentSubmissions = submissions.filter(
            submission => submission.assignmentId === selectedOption.assignmentId
        );
        
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
    
    const handleAssignmentClick = (option: { assignmentId: number; value: string; label: string; period: string }) => {
        setSelectedAssignment(option.label);
        setSelectedMember('스터디원을 선택하세요');
        setIsAssignmentOpen(false);
        setAssignmentContent('');
    };

    const handleMemberClick = (option: { value: string; label: string; role: string; submissionData: SubmissionData }) => {
        setSelectedMember(option.label);
        setIsMemberOpen(false);
        setAssignmentContent(option.submissionData.content);
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
            
            // 나머지 로직은 동일
        } catch (err) {
            // 에러 처리
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 API 호출
    useEffect(() => {
        fetchSubmissions();
    }, []);

    // 선택된 과제의 기간 찾기
    const selectedAssignmentData = assignmentOptions.find(option => option.label === selectedAssignment);

    const getSelectedSubmissionData = () => {
        if (selectedAssignment === '과제를 선택하세요' || selectedMember === '스터디원을 선택하세요') {
            return null;
        }
        
        const selectedOption = assignmentOptions.find(option => option.label === selectedAssignment);
        if (!selectedOption) return null;
        
        const memberOption = memberOptions.find(option => option.label === selectedMember);
        if (!memberOption) return null;
        
        return memberOption.submissionData;
    };

    const selectedSubmissionData = getSelectedSubmissionData();

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

//     // 점수 데이터 (기존 데이터 사용)
//     const labels = ["1월", "2월", "3월", "4월", "5월"];
//     const scoreData = [120, 200, 150, 170, 220];

//   // Chart.js용 데이터 형식으로 변환
//     const chartData = {
//         labels: labels,
//         datasets: [
//         {
//             label: '점수',
//             data: scoreData,
//             borderColor: 'rgba(139, 133, 233, 1)', // 보라색 계열
//             backgroundColor: 'rgba(139, 133, 233, 0.1)',
//             borderWidth: 3,
//             tension: 0.4,
//             pointBackgroundColor: 'rgba(139, 133, 233, 1)',
//             pointBorderColor: '#ffffff',
//             pointBorderWidth: 2,
//             pointRadius: 6,
//             pointHoverRadius: 8,
//         }
//         ]
//     };

//   // 차트 옵션
//     const chartOptions = {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//         legend: {
//             display: false // 범례 숨김
//         },
//         title: {
//             display: true,
//             text: '월별 점수 추이',
//             font: {
//             size: 16,
//             weight: 'bold' as const
//             },
//             color: '#374151'
//         }
//         },
//         scales: {
//         x: {
//             grid: {
//             display: false
//             },
//             ticks: {
//             color: '#6B7280'
//             }
//         },
//         y: {
//             beginAtZero: true,
//             grid: {
//             color: '#F3F4F6'
//             },
//             ticks: {
//             color: '#6B7280'
//             },
//             title: {
//             display: true,
//             text: '점수',
//             color: '#6B7280'
//             }
//         }
//         }
//     };

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
                (() => {
                    const submission = getSubmissionByAssignment(selectedAssignment);
                    if (submission && submission.submittedBy === selectedMember) {
                        return (
                            <div className="bg-gray-50 border-2 border-[#8B85E9] rounded-lg p-4">
                                <div className="mb-2 text-sm text-gray-600">
                                    <strong>제출일:</strong> {submission.submittedAt}
                                </div>
                                                                <div className="bg-white rounded p-3 border border-gray-200">
                                    <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{submission.content}</p>
                                </div>
                                
                                                                {/* 첨부파일 표시 */}
                                <div className="mt-4 bg-white rounded p-3 border border-gray-200">
                                    {submission.attachment ? (
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="w-4 h-4 text-gray-400" />
                                                <div className="flex-1">
                                                    <button 
                                                        className="text-sm font-medium text-[#8B85E9] hover:text-[#7A75D8] hover:underline transition-colors text-left"
                                                        onClick={() => {
                                                            // 실제 파일 다운로드 기능은 서버 연동 시 구현
                                                            alert('파일 다운로드 기능은 서버 연동 후 구현됩니다.');
                                                        }}
                                                    >
                                                        {submission.attachment.fileName}
                                                    </button>
                                                    <p className="text-xs text-gray-500">
                                                        {submission.attachment.fileSize} • {submission.attachment.fileType}
                                                    </p>
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
                        );
                    } else {
                        return (
                            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                                <p className="text-gray-500 text-center">해당 스터디원의 과제 제출 내용이 없습니다.</p>
                            </div>
                        );
                    }
                })()
            ) : (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                    <p className="text-gray-500 text-center">과제와 스터디원을 선택해주세요.</p>
                </div>
            )}
            </div>

        {/* AI 피드백 */}        
        <div>
            <p className="text-lg font-bold mb-2 text-gray-500">
                AI 피드백
            </p>
            <textarea
                value={assignmentContent}
                readOnly
                placeholder="피드백을 불러오는 중입니다..."
                className="w-full h-30 p-3 border-2 border-[#8B85E9] rounded-lg resize-none placeholder:text-sm placeholder:text-gray-400 bg-gray-50"
            />
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

export default FeedBack
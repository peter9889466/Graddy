import React, { useRef, useState, useContext } from 'react'
import ChartComponent from '../detail/chart/LineChart'; // 위에서 만든 Chart 컴포넌트
import { LineChart, MessageCircle, Reply, Trash2, User } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

const FeedBack = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('과제를 선택하세요');
    const [assignmentContent, setAssignmentContent] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const authContext = useContext(AuthContext);

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
    

    const options = [
        { value: 'algorithm', label: '알고리즘 문제 풀이', period: '2025.08.20 ~ 2025.08.25' },
        { value: 'project', label: '프로젝트 기획서', period: '2025.08.25 ~ 2025.08.30' },
        { value: 'report', label: '스터디 리포트', period: '2025.08.30 ~ 2025.09.05' },
        { value: 'presentation', label: '발표 자료', period: '2025.09.05 ~ 2025.09.10' }
      ];
    
      const handleOptionClick = (option: { value: string; label: string; period: string }) => {
        setSelectedOption(option.label);
        setIsOpen(false);
    };

    // 선택된 과제의 기간 찾기
  const selectedAssignment = options.find(option => option.label === selectedOption);

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

  // 점수 데이터 (기존 데이터 사용)
  const labels = ["1월", "2월", "3월", "4월", "5월"];
  const scoreData = [120, 200, 150, 170, 220];

  // Chart.js용 데이터 형식으로 변환
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: '점수',
        data: scoreData,
        borderColor: 'rgba(139, 133, 233, 1)', // 보라색 계열
        backgroundColor: 'rgba(139, 133, 233, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgba(139, 133, 233, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // 범례 숨김
      },
      title: {
        display: true,
        text: '월별 점수 추이',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        color: '#374151'
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        },
        ticks: {
          color: '#6B7280'
        },
        title: {
          display: true,
          text: '점수',
          color: '#6B7280'
        }
      }
    }
  };

  return (
    <div className="space-y-6 h-[61.5vh] overflow-y-auto p-4 pr-10">
        {/* 피드백 드롭 다운 */}
      <div className="mb-4 relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${
          isOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
        } focus:outline-none`}>
          <span>{selectedOption}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
            {options.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${index !== options.length - 1 ? 'border-b border-gray-100' : ''}`}
                style={{ 
                  backgroundColor: selectedOption === option.label ? '#E8E6FF' : '#FFFFFF',
                  color: selectedOption === option.label ? '#8B85E9' : '#374151'
                }}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 mt-1">{option.period}</div>
              </div>
            ))}
          </div>
        )}
      </div>
        {/* 선택된 과제 제목 및 기간 */}
      {selectedOption !== '과제를 선택하세요' && (
        <div>
          <p className="text-2xl font-semibold text-black">
            {selectedOption}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {selectedAssignment?.period}
          </p>
        </div>
      )}
      <hr className="my-4"/>

      {/* AI 피드백 */}        
      <div>
        <p className="text-lg font-bold mb-3 text-gray-500">
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
        <p className="text-lg font-bold mb-3 text-gray-500">
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
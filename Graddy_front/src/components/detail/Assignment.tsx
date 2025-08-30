import React, { useState, useRef, useEffect, useContext } from 'react';
import { useAssignmentContext } from '../../contexts/AssignmentContext';
import { AuthContext } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import dayjs from "dayjs";

interface AssignmentProps {
  studyProjectId: number;
}

interface FetchedAssignment {
  assignmentId: number;
  studyProjectId: number;
  memberId: number;
  title: string;
  description: string;
  deadline: string;
  fileUrl: string;
  createdAt: string;
}

interface SubmissionData {
  assignmentId: number;
  memberId: number;
  content: string;
  fileUrl: string | null;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// API 기본 URL을 상수로 정의
const API_BASE_URL = 'http://localhost:8080/api';

const Assignment: React.FC<AssignmentProps> = ({ studyProjectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('과제를 선택하세요');
  const [assignmentContent, setAssignmentContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fetchedAssignments, setFetchedAssignments] = useState<FetchedAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { submitAssignment, getSubmissionByAssignment } = useAssignmentContext();
  const authContext = useContext(AuthContext);

  // 과제 목록을 가져오는 함수
  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/study-project/${studyProjectId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse<FetchedAssignment[]> = await response.json();
      setFetchedAssignments(data.data || []);
    } catch (err: any) {
      console.error('과제 목록 로딩 실패:', err);
      setError(err.message || '과제 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 과제 목록 가져오기
  useEffect(() => {
    fetchAssignments();
  }, [studyProjectId]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: FetchedAssignment) => {
    setSelectedOption(option.title);
    setIsOpen(false);
  };

  const selectedAssignment = fetchedAssignments.find(option => option.title === selectedOption);

  // 파일 업로드 함수 (실제 구현 필요)
  const uploadFile = async (file: File): Promise<string> => {
    // TODO: 실제 파일 업로드 API 구현
    // 현재는 임시로 파일명 반환
    return `uploads/${Date.now()}_${file.name}`;
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!authContext?.isLoggedIn) {
      alert("로그인 후 이용해주세요!");
      return;
    }

    if (!selectedAssignment) {
      alert("과제를 선택해주세요!");
      return;
    }

    if (!assignmentContent.trim()) {
      alert("과제 내용을 작성해주세요!");
      return;
    }

    // memberId를 숫자로 변환
    const memberId = authContext.user?.nickname ? 
      parseInt(authContext.user.nickname) : 
      authContext.user?.nickname ? parseInt(authContext.user.nickname.toString()) : null;

    if (!memberId) {
      alert("사용자 정보를 확인할 수 없습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 파일 업로드 (선택사항)
      let fileUrl: string | null = null;
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }

      // API 요청 데이터 준비
      const submissionData: SubmissionData = {
        assignmentId: selectedAssignment.assignmentId,
        memberId: memberId,
        content: assignmentContent.trim(),
        fileUrl: fileUrl
      };

      console.log('제출 데이터:', submissionData);

      // API 호출
      const response = await fetch(`${API_BASE_URL}/submissions/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: 인증 토큰이 필요한 경우 추가
          // 'Authorization': `Bearer ${authContext.token}`
        },
        body: JSON.stringify(submissionData),
      });

      const responseData: ApiResponse<any> = await response.json();

      if (response.ok && responseData.status === 200) {
        // 성공 처리
        setIsSubmitted(true);
        setShowSuccessMessage(true);
        console.log("과제 제출 성공:", responseData.data);
        
        // 성공 메시지 자동 숨김
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);

      } else {
        // 실패 처리
        console.error("과제 제출 실패:", responseData.message);
        alert(`과제 제출에 실패했습니다: ${responseData.message}`);
      }

    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      alert("과제 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 선택된 과제가 변경될 때 기존 제출 내용 확인
  useEffect(() => {
    if (selectedOption !== '과제를 선택하세요') {
      const existingSubmission = getSubmissionByAssignment(selectedOption);
      if (existingSubmission) {
        setAssignmentContent(existingSubmission.content);
        setIsSubmitted(true);
      } else {
        setAssignmentContent('');
        setIsSubmitted(false);
        setSelectedFile(null);
      }
    }
  }, [selectedOption, getSubmissionByAssignment]);

  // 로딩 상태 렌더링
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 pr-10">
        <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4" style={{ color: "#8B85E9" }}>과제 제출</h2>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin w-8 h-8 text-[#8B85E9]" />
          <span className="ml-2 text-gray-500">과제 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태 렌더링
  if (error) {
    return (
      <div className="space-y-4 p-4 pr-10">
        <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4" style={{ color: "#8B85E9" }}>과제 제출</h2>
        <div className="flex flex-col items-center justify-center h-48 text-red-500">
          <p className="mb-4">오류 발생: {error}</p>
          <button 
            onClick={fetchAssignments}
            className="px-4 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7C76D8] transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 과제가 없을 때
  if (fetchedAssignments.length === 0) {
    return (
      <div className="space-y-4 p-4 pr-10">
        <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4" style={{ color: "#8B85E9" }}>과제 제출</h2>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>제출할 과제가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pr-10">
      <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4" style={{ color: "#8B85E9" }}>과제 제출</h2>

      {/* 과제 선택 드롭다운 */}
      <div className="mb-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${
            isOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
          } focus:outline-none hover:border-[#8B85E9] transition-colors`}
        >
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
            {fetchedAssignments.map((option, index) => {
              const deadline = dayjs(option.deadline).format('YYYY.MM.DD');
              return (
                <div
                  key={option.assignmentId}
                  onClick={() => handleOptionClick(option)}
                  className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedOption === option.title 
                      ? 'bg-[#E8E6FF] text-[#8B85E9]' 
                      : 'bg-white text-gray-700'
                  } ${index !== fetchedAssignments.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="font-medium">{option.title}</div>
                  <div className="text-xs text-gray-500 mt-1">마감일: {deadline}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 선택된 과제 정보 */}
      {selectedOption !== '과제를 선택하세요' && selectedAssignment && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedAssignment.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{selectedAssignment.description}</p>
          <p className="text-sm text-red-600">
            마감일: {dayjs(selectedAssignment.deadline).format('YYYY년 MM월 DD일')}
          </p>
        </div>
      )}

      <hr />

      {/* 과제 내용 + 첨부파일 */}
      <div className="space-y-4">
        {/* 과제 내용 */}
        <div>
          <label className="block text-lg font-bold mb-2 text-gray-700">
            과제 내용 <span className="text-black-500">*</span>
          </label>
          <textarea
            value={assignmentContent}
            onChange={(e) => setAssignmentContent(e.target.value)}
            placeholder="과제 내용을 작성해주세요"
            disabled={isSubmitted}
            className={`w-full min-h-[120px] p-3 border-2 border-[#8B85E9] rounded-lg resize-none placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] transition-colors ${
              isSubmitted ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
            }`}
            style={{ height: 'auto', minHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        </div>

        {/* 첨부파일 */}
        <div>
          <label className="block text-lg font-bold mb-2 text-gray-700">
            첨부 파일
          </label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            disabled={isSubmitted}
            className={`block w-full text-sm file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold file:text-[#8B85E9]
                      file:bg-violet-50 hover:file:bg-violet-100 transition-colors
                      ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.rar"
          />
          {selectedFile && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">선택된 파일:</span> {selectedFile.name} 
                <span className="text-blue-500 ml-2">
                  ({selectedFile.size > 1024 * 1024 
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` 
                    : `${(selectedFile.size / 1024).toFixed(1)} KB`})
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">과제가 성공적으로 제출되었습니다! AI 피드백이 자동으로 생성됩니다.</span>
          </div>
        </div>
      )}

      {/* 과제 제출 버튼 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitted || isSubmitting || !selectedAssignment || !assignmentContent.trim()}
        className={`w-full px-4 py-2 rounded-lg text-white text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          isSubmitted 
            ? 'bg-gray-400 cursor-not-allowed' 
            : isSubmitting
            ? 'bg-gray-500 cursor-not-allowed'
            : !selectedAssignment || !assignmentContent.trim()
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#8B85E9] hover:bg-[#7C76D8] hover:shadow-md'
        }`}
      >
        {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
        {isSubmitted ? '과제 제출 완료' : isSubmitting ? '제출 중...' : '과제 제출'}
      </button>
    </div>
  );
};

export default Assignment;
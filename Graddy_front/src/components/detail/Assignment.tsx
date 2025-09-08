import React, { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import { useAssignmentContext } from '../../contexts/AssignmentContext';
import { AuthContext } from '../../contexts/AuthContext';
import { TokenService } from '../../services/tokenService';
import { Loader2, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';

interface AssignmentProps {
  studyProjectId: number;
  memberId: number | null;
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
  isSubmitted?: boolean; // 제출 여부 추가
}

interface SubmissionResponse {
  status: number;
  message: string;
  data: {
    submissionId: number;
    assignmentId: number;
    memberId: string;
    content: string;
    fileUrl: string | null;
    createdAt: string;
  };
}

// API 에러 타입 정의
interface ApiError {
  status: number;
  message: string;
}

const Assignment: React.FC<AssignmentProps> = ({ studyProjectId, memberId }) => {
  // 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [assignmentContent, setAssignmentContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fetchedAssignments, setFetchedAssignments] = useState<FetchedAssignment[]>([]);
  
  // 로딩 및 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context
  const { getSubmissionByAssignment } = useAssignmentContext();
  const authContext = useContext(AuthContext);

  // 인증 헤더 생성 유틸리티
  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('userToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (token && token !== 'null' && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 선택된 과제 정보 계산
  const selectedAssignment = useMemo(() => 
    fetchedAssignments.find(assignment => assignment.assignmentId === selectedAssignmentId),
    [fetchedAssignments, selectedAssignmentId]
  );

  // 과제 목록 조회 API
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8080/api/assignments/study-project/${studyProjectId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`과제 목록 조회 실패: ${response.status}`);
      }
      
      const data = await response.json();
      const assignments = data.data || [];
      
      // 각 과제에 대한 제출 상태 확인
      if (memberId) {
        const assignmentsWithSubmissionStatus = await Promise.all(
          assignments.map(async (assignment: FetchedAssignment) => {
            try {
              const submissionResponse = await fetch(
                `http://localhost:8080/api/submissions/assignment/${assignment.assignmentId}/member/${memberId}`,
                { headers: getAuthHeaders() }
              );
              return {
                ...assignment,
                isSubmitted: submissionResponse.ok
              };
            } catch (error) {
              return {
                ...assignment,
                isSubmitted: false
              };
            }
          })
        );
        setFetchedAssignments(assignmentsWithSubmissionStatus);
      } else {
        setFetchedAssignments(assignments);
      }
    } catch (err: any) {
      console.error('과제 목록 조회 오류:', err);
      setError(err.message || '과제 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [studyProjectId, memberId]);

  // 제출된 과제 내용 조회
  const fetchSubmissionContent = useCallback(async (assignmentId: number) => {
    if (!memberId) return;
    
    try {
      const response = await fetch(
        `http://localhost:8080/api/submissions/assignment/${assignmentId}/member/${memberId}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setAssignmentContent(data.data.content || '');
        }
      }
    } catch (error) {
      console.error('제출 내용 조회 실패:', error);
    }
  }, [memberId]);

  // 파일 업로드 API
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    console.log("🚀 [DEBUG] 파일 업로드 시작:", file.name);
    console.log("📄 [DEBUG] 파일 정보:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    try {
      // 토큰 유효성 검사 및 갱신
      let currentToken = localStorage.getItem('userToken');
      if (!currentToken || !TokenService.getInstance().isTokenValid(currentToken)) {
        console.log("🔄 [DEBUG] 토큰 갱신 시도...");
        try {
          currentToken = await TokenService.getInstance().refreshAccessToken();
          console.log("✅ [DEBUG] 토큰 갱신 성공");
        } catch (error) {
          console.error("❌ [DEBUG] 토큰 갱신 실패:", error);
          throw new Error('인증 오류가 발생했습니다. 다시 로그인해주세요.');
        }
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log("📡 [DEBUG] FormData 생성 완료, 서버 요청 시작");

      const response = await fetch('http://localhost:8080/api/files/upload/assignment', {
        method: 'POST',
        body: formData,
        headers: {
<<<<<<< HEAD
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
=======
          'Authorization': `Bearer ${currentToken}`
          // Content-Type은 브라우저가 자동으로 설정하도록 제거 (multipart/form-data)
>>>>>>> fc0f1a701776b413607538a08e4af4cd90bca5ab
        }
      });

      console.log("📡 [DEBUG] 서버 응답 받음:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [DEBUG] 파일 업로드 실패:", response.status, errorText);
        throw new Error(`파일 업로드 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ [DEBUG] 파일 업로드 성공:", result);
      
      // 스토리지 타입 및 상세 정보 디버깅
      console.log("🏗️ [DEBUG] 업로드 응답 상세 분석:", {
        fullResponse: result,
        storageType: result.data?.storageType || 'unknown',
        fileName: result.data?.fileName,
        fileUrl: result.data?.fileUrl,
        uploadTime: new Date().toISOString()
      });
      
      const fileUrl = result.data?.fileUrl;
      const storageType = result.data?.storageType || 'unknown';
      
      if (!fileUrl) {
        console.error("❌ [DEBUG] 파일 URL이 응답에 없음:", result);
        throw new Error('파일 URL을 받지 못했습니다.');
      }

      // URL 타입 분석
      const isS3Url = fileUrl.includes('s3.') || fileUrl.includes('graddy-files');
      const isLocalUrl = fileUrl.startsWith('/api/files/');
      
      console.log("📎 [DEBUG] 파일 업로드 결과 분석:", {
        storageType,
        fileUrl,
        isS3Url,
        isLocalUrl,
        urlLength: fileUrl.length,
        urlDomain: new URL(fileUrl, window.location.origin).hostname
      });
      
      // 🚫 로컬스토리지 저장 중단 확인
      console.log("💾 [DEBUG] 로컬스토리지 저장 중단됨 - S3/서버 기반 파일 관리 사용");

      return fileUrl;

    } catch (error) {
      console.error("💥 [DEBUG] 파일 업로드 오류:", error);
      throw error;
    }
  }, []);

  // 과제 제출 API
  const submitAssignment = useCallback(async () => {
    console.log("🚀 [DEBUG] 과제 제출 시작");
    console.log("👤 [DEBUG] 인증 상태:", authContext?.isLoggedIn);
    console.log("📋 [DEBUG] 선택된 과제:", selectedAssignment?.assignmentId);
    console.log("📝 [DEBUG] 제출 내용 길이:", assignmentContent.trim().length);
    console.log("📎 [DEBUG] 첨부 파일:", selectedFile?.name || '없음');

    if (!authContext?.isLoggedIn || !authContext.user?.nickname) {
      console.error("❌ [DEBUG] 로그인 필요");
      setError("로그인이 필요합니다.");
      return;
    }

    if (!selectedAssignment) {
      console.error("❌ [DEBUG] 과제 미선택");
      setError("과제를 선택해주세요.");
      return;
    }

    // 이미 제출한 과제인지 확인
    if (selectedAssignment.isSubmitted) {
      console.error("❌ [DEBUG] 이미 제출한 과제");
      setError("이미 제출한 과제입니다. 한 과제당 한 번만 제출할 수 있습니다.");
      return;
    }

    if (!assignmentContent.trim()) {
      console.error("❌ [DEBUG] 제출 내용 없음");
      setError("과제 내용을 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 토큰 유효성 검사 및 갱신
      let currentToken = localStorage.getItem('userToken');
      if (!currentToken || !TokenService.getInstance().isTokenValid(currentToken)) {
        console.log("🔄 [DEBUG] 과제 제출 전 토큰 갱신 시도...");
        try {
          currentToken = await TokenService.getInstance().refreshAccessToken();
          console.log("✅ [DEBUG] 과제 제출용 토큰 갱신 성공");
        } catch (error) {
          console.error("❌ [DEBUG] 과제 제출용 토큰 갱신 실패:", error);
          setError('인증 오류가 발생했습니다. 다시 로그인해주세요.');
          setIsSubmitting(false);
          return;
        }
      }

      // 파일 업로드 처리
      let fileUrl: string | null = null;
      if (selectedFile) {
        console.log("📎 [DEBUG] 파일 업로드 시작");
        fileUrl = await uploadFile(selectedFile);
        console.log("✅ [DEBUG] 파일 업로드 완료:", fileUrl);
      } else {
        console.log("📎 [DEBUG] 첨부 파일 없음");
      }

      // 과제 제출 API 호출
      const submissionData = {
        assignmentId: selectedAssignment.assignmentId,
        memberId: memberId,
        content: assignmentContent.trim(),
        fileUrl: fileUrl
      };

      console.log("📦 [DEBUG] 제출 데이터:", submissionData);

      console.log("🌐 [DEBUG] 서버에 제출 요청 시작");
      const response = await fetch('http://localhost:8080/api/submissions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(submissionData)
      });

      console.log("📡 [DEBUG] 서버 응답 받음:", response.status);
      const responseData: SubmissionResponse = await response.json();
      console.log("📋 [DEBUG] 응답 데이터:", responseData);

      if (response.ok && responseData.status === 200) {
        // 제출 성공
        console.log("✅ [DEBUG] 과제 제출 성공");
        setIsSubmitted(true);
        setShowSuccessMessage(true);
        setSubmitMessage(responseData.message);
        
        // 과제 목록의 제출 상태 업데이트
        setFetchedAssignments(prev => 
          prev.map(assignment => 
            assignment.assignmentId === selectedAssignment.assignmentId
              ? { ...assignment, isSubmitted: true }
              : assignment
          )
        );
        
        console.log("📄 [DEBUG] 제출 완료 데이터:", responseData.data);

        // 성공 메시지 자동 숨김
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);

      } else {
        // 서버 에러 응답
        console.error("❌ [DEBUG] 제출 실패:", responseData);
        throw new Error(responseData.message || '과제 제출에 실패했습니다.');
      }

    } catch (err: any) {
      console.error("💥 [DEBUG] 과제 제출 오류:", err);
      console.error("💥 [DEBUG] 오류 타입:", typeof err);
      console.error("💥 [DEBUG] 오류 메시지:", err.message);
      setError(err.message || '과제 제출 중 오류가 발생했습니다.');
    } finally {
      console.log("🏁 [DEBUG] 과제 제출 프로세스 완료");
      setIsSubmitting(false);
    }
  }, [authContext, selectedAssignment, assignmentContent, selectedFile, uploadFile]);

  // 드롭다운 외부 클릭 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 컴포넌트 마운트 시 과제 목록 조회
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // 선택된 과제 변경 시 기존 제출 내용 확인
  useEffect(() => {
    if (selectedAssignment) {
      if (selectedAssignment.isSubmitted) {
        // 이미 제출한 과제인 경우 제출 상태로 설정
        setIsSubmitted(true);
        // 제출된 내용을 가져와서 표시
        fetchSubmissionContent(selectedAssignment.assignmentId);
      } else {
        setAssignmentContent('');
        setIsSubmitted(false);
        setSelectedFile(null);
        setShowSuccessMessage(false);
      }
    }
  }, [selectedAssignment]);

  // 과제 선택 핸들러
  const handleAssignmentSelect = useCallback((assignment: FetchedAssignment) => {
    setSelectedAssignmentId(assignment.assignmentId);
    setIsDropdownOpen(false);
    setError(null);
  }, []);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하여야 합니다.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  // 파일 제거 핸들러
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // 날짜 포맷팅 유틸리티
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 pr-10">
        <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4" style={{ color: "#8B85E9" }}>
          과제 제출
        </h2>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin w-8 h-8 text-[#8B85E9]" />
          <span className="ml-2 text-gray-500">과제 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 과제가 없는 경우
  if (fetchedAssignments.length === 0) {
    return (
      <div className="space-y-4 p-4 pr-10">
        <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4" style={{ color: "#8B85E9" }}>
          과제 제출
        </h2>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>제출할 과제가 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pr-10">
      <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4" style={{ color: "#8B85E9" }}>
        과제 제출
      </h2>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-800 font-medium">
              {submitMessage || '과제가 성공적으로 제출되었습니다!'}
            </span>
          </div>
        </div>
      )}

      {/* 과제 선택 드롭다운 */}
      <div className="mb-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isSubmitted}
          className={`w-full px-4 py-3 rounded-xl bg-white text-gray-700 flex items-center justify-between border-2 transition-colors focus:outline-none ${
            isDropdownOpen 
              ? "border-[#8B85E9]" 
              : "border-gray-300 hover:border-gray-400"
          } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span className={selectedAssignment ? 'text-gray-900' : 'text-gray-500'}>
            {selectedAssignment ? selectedAssignment.title : '과제를 선택하세요'}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto">
            {fetchedAssignments.map((assignment, index) => (
              <div
                key={assignment.assignmentId}
                onClick={() => handleAssignmentSelect(assignment)}
                className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedAssignmentId === assignment.assignmentId 
                    ? 'bg-[#E8E6FF] text-[#8B85E9]' 
                    : 'bg-white text-gray-700'
                } ${index !== fetchedAssignments.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{assignment.title}</div>
                  {assignment.isSubmitted && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      제출완료
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  마감일: {formatDate(assignment.deadline)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 선택된 과제 정보 */}
      {selectedAssignment && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedAssignment.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">
                {selectedAssignment.description}
              </p>
              <p className="text-sm text-red-600">
                마감일: {formatDate(selectedAssignment.deadline)}
              </p>
            </div>
          </div>
        </div>
      )}

      <hr className="my-4" />

      {/* 과제 내용 입력 */}
      <div className="space-y-4">
        <div>
          <label className="block text-lg font-bold mb-2 text-gray-500">
            과제 내용
          </label>
          <textarea
            value={assignmentContent}
            onChange={(e) => setAssignmentContent(e.target.value)}
            placeholder="과제 내용을 작성해주세요"
            disabled={isSubmitted}
            className={`w-full min-h-[120px] p-3 border-2 border-[#8B85E9] rounded-lg resize-none placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] transition-colors ${
              isSubmitted ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
            }`}
            rows={6}
          />
        </div>

        {/* 첨부파일 */}
        <div>
          <label className="block text-lg font-bold mb-2 text-gray-500">
            첨부 파일 (선택사항)
          </label>
          
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                disabled={isSubmitted}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitted}
                className={`text-[#8B85E9] hover:text-[#7A74D8] font-medium ${
                  isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                파일을 선택하거나 여기에 끌어다 놓으세요
              </button>
              <p className="text-xs text-gray-500 mt-2">
                최대 10MB, PDF, DOC, TXT, ZIP 파일만 지원
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8B85E9] rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                {!isSubmitted && (
                  <button
                    type="button"
                    onClick={handleFileRemove}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="pt-4">
        <button
          type="button"
          onClick={submitAssignment}
          disabled={isSubmitted || isSubmitting || !selectedAssignment}
          className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            isSubmitted 
              ? 'bg-gray-400 cursor-not-allowed' 
              : isSubmitting
              ? 'bg-gray-500 cursor-not-allowed'
              : !selectedAssignment
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#8B85E9] hover:bg-[#7A74D8] cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              제출 중...
            </>
          ) : isSubmitted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              과제 제출 완료
            </>
          ) : (
            '과제 제출'
          )}
        </button>
      </div>
    </div>
  );
};

export default Assignment;
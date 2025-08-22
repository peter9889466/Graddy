import React, { useState, useRef, useEffect, useContext } from 'react';
import { useAssignmentContext } from '../../contexts/AssignmentContext';
import { AuthContext } from '../../contexts/AuthContext';

const Assignment: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('과제를 선택하세요');
  const [assignmentContent, setAssignmentContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { submitAssignment, getSubmissionByAssignment } = useAssignmentContext();
  const authContext = useContext(AuthContext);

  const options = [
    { value: 'algorithm', label: '알고리즘 문제 풀이', period: '2025.08.20 ~ 2025.08.25' },
    { value: 'project', label: '프로젝트 기획서', period: '2025.08.25 ~ 2025.08.30' },
    { value: 'report', label: '스터디 리포트', period: '2025.08.30 ~ 2025.09.05' },
    { value: 'presentation', label: '발표 자료', period: '2025.09.05 ~ 2025.09.10' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: { value: string; label: string; period: string }) => {
    setSelectedOption(option.label);
    setIsOpen(false);
  };

  // 선택된 과제의 기간 찾기
  const selectedAssignment = options.find(option => option.label === selectedOption);

  // 과제 제출 처리
  const handleSubmit = () => {
    if (!authContext?.isLoggedIn) {
      alert("로그인 후 이용해주세요!");
      return;
    }

    if (selectedOption === '과제를 선택하세요') {
      alert("과제를 선택해주세요!");
      return;
    }

    if (!assignmentContent.trim()) {
      alert("과제 내용을 작성해주세요!");
      return;
    }

    const submittedBy = authContext.user?.nickname || '익명 사용자';
    
    // 첨부파일 정보 처리
    let attachmentInfo = undefined;
    if (selectedFile) {
      attachmentInfo = {
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
        fileType: selectedFile.type || '알 수 없는 형식'
      };
    }
    
    submitAssignment(selectedOption, assignmentContent, submittedBy, attachmentInfo);
    
    setIsSubmitted(true);
    setShowSuccessMessage(true);
    
    // 3초 후 성공 메시지 숨기기
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // 과제 선택 시 기존 제출 내용 확인
  useEffect(() => {
    if (selectedOption !== '과제를 선택하세요') {
      const existingSubmission = getSubmissionByAssignment(selectedOption);
      if (existingSubmission) {
        setAssignmentContent(existingSubmission.content);
        setIsSubmitted(true);
        // 기존 첨부파일 정보는 표시만 하고 수정 불가
      } else {
        setAssignmentContent('');
        setIsSubmitted(false);
        setSelectedFile(null);
      }
    }
  }, [selectedOption, getSubmissionByAssignment]);

  return (
    		<div className="space-y-4 p-4 pr-10">
      {/* 과제 제출 소제목 */}
      <h2 className="text-xl font-bold mb-6 -mt-5 -ml-4"
        style={{ color: "#8B85E9" }}>과제 제출</h2>

      {/* 과제 선택 드롭다운 */}
      <div className="mb-4 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${isOpen ? "border-2 border-[#8B85E9]" : "border-2 border-gray-300"
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
            {selectedOption} <span className="text-sm text-gray-500 font-normal">[{selectedAssignment?.period}]</span>
          </p>
        </div>
      )}

      <hr />

             {/* 과제 내용 + 첨부파일 묶음 */}
       <div className="space-y-4">
        {/* 과제 내용 */}
        <div>
          <p className="text-lg font-bold mb-2 text-gray-500">
            과제 내용
          </p>
          <textarea
            value={assignmentContent}
            onChange={(e) => setAssignmentContent(e.target.value)}
            placeholder="과제 내용을 작성해주세요"
            className="w-full min-h-[120px] p-3 border-2 border-[#8B85E9] rounded-lg resize-none overflow-hidden placeholder:text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
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
           <p className="text-lg font-bold mb-2 text-gray-500">
             첨부 파일
           </p>
           <input
             type="file"
             onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
             disabled={isSubmitted}
             className={`block w-full text-sm file:mr-4 file:py-2 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-semibold file:text-[#8B85E9]
                       file:bg-violet-50 hover:file:bg-violet-100
                       ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
           />
           {selectedFile && (
             <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
               <p className="text-sm text-gray-700">
                 <span className="font-medium">선택된 파일:</span> {selectedFile.name} 
                 <span className="text-gray-500 ml-2">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
               </p>
             </div>
           )}
         </div>
      </div>

      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">과제가 성공적으로 제출되었습니다!</span>
          </div>
        </div>
      )}

      {/* 과제 제출 버튼 */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitted}
        className={`w-full px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer transition-all duration-200 ${
          isSubmitted 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'hover:opacity-90'
        }`}
        style={{ backgroundColor: isSubmitted ? "#9CA3AF" : "#8B85E9" }}
      >
        {isSubmitted ? '과제 제출 완료' : '과제 제출'}
      </button>
    </div>
  );
};

export default Assignment;

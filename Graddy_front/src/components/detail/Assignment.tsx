import React, { useState, useRef, useEffect } from 'react';

const Assignment: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('과제를 선택하세요');
  const [assignmentContent, setAssignmentContent] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-6 h-[61.5vh] overflow-y-auto p-4 pr-10">
      {/* 과제 선택 드롭다운 */}
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

      <hr />

      {/* 과제 내용 + 첨부파일 묶음 */}
      <div className="space-y-6">
        {/* 과제 내용 */}
        <div>
          <p className="text-lg font-bold mb-3 text-gray-500">
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
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold file:text-[#8B85E9]
                      file:bg-violet-50 hover:file:bg-violet-100"
          />
        </div>
      </div>
      
      {/* 과제 제출 버튼 */}
      <button
        type="button"
        className="w-full px-4 py-2 rounded-lg text-white text-sm sm:text-base cursor-pointer hover:opacity-90"
        style={{ backgroundColor: "#8B85E9" }}
      >
        과제 제출
      </button>
    </div>
  );
};

export default Assignment;

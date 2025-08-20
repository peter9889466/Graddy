import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { AuthContext } from '../contexts/AuthContext';

const StudyCreate: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    
    if (!authContext) {
        throw new Error('StudyCreate 컴포넌트는 AuthProvider 내에서 사용되어야 합니다.');
    }
    const { user } = authContext;
    const [studyData, setStudyData] = useState({
        title: '',
        introduction: '',
        description: '',
        maxMembers: 0,
        tags: [] as string[],
        startDate: '',
        endDate: ''
    });
    const [newTag, setNewTag] = useState('');
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tagSearchValue, setTagSearchValue] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleAddTag = () => {
        if (newTag.trim() && !studyData.tags.includes(newTag.trim())) {
            if (studyData.tags.length < 5) {
                setStudyData({
                    ...studyData,
                    tags: [...studyData.tags, newTag.trim()]
                });
                setNewTag('');
            } else {
                alert('태그는 5개까지만 선택할 수 있습니다!');
            }
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setStudyData({
            ...studyData,
            tags: studyData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 에러 초기화
        setErrors({});

        // 필수 필드 검증
        const newErrors: { [key: string]: string } = {};

        if (!studyData.title.trim()) {
            newErrors.title = '스터디 제목을 입력해주세요!';
        }

        if (!studyData.introduction.trim()) {
            newErrors.introduction = '스터디 소개를 입력해주세요!';
        }

                if (!studyData.startDate) {
            newErrors.startDate = '시작일을 입력해주세요!';
        }
        
        if (!studyData.endDate) {
            newErrors.endDate = '종료일을 입력해주세요!';
        }

        if (!studyData.description.trim()) {
            newErrors.description = '스터디 설명을 입력해주세요!';
        }

        // 최대 인원 검증
        if (!studyData.maxMembers || studyData.maxMembers <= 0) {
            newErrors.maxMembers = '최대 인원을 입력해주세요!';
        } else if (studyData.maxMembers > 100) {
            newErrors.maxMembers = '최대 인원은 100명 이하여야 합니다!';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 여기에 스터디 생성 로직 추가
        console.log('스터디 생성:', studyData);
        
        // 새 스터디 데이터 생성
        const newStudy = {
            id: Date.now(), // 임시 ID 생성
            title: studyData.title,
            description: studyData.description,
            period: `${studyData.startDate}~${studyData.endDate}`,
            tags: studyData.tags,
            leader: user?.nickname || "알 수 없음", // 사용자의 닉네임 사용
            isRecruiting: true,
            recruitmentStatus: "모집중" as const
        };
        
        console.log('스터디 생성 시 사용자 정보:', user);
        console.log('생성된 스터디장:', newStudy.leader);
        
        // 로컬 스토리지에서 기존 스터디 목록 가져오기
        const existingStudies = JSON.parse(localStorage.getItem('userStudies') || '[]');
        
        // 새 스터디 추가
        existingStudies.push(newStudy);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('userStudies', JSON.stringify(existingStudies));
        
        navigate('/search');
    };

    // 샘플 태그 데이터 (실제로는 API에서 가져올 데이터)
    const availableTags = [
        '리액트', '자바스크립트', '타입스크립트', '파이썬', '자바', 'C++', 'C#',
        '웹개발', '앱개발', '백엔드', '프론트엔드', '데이터베이스', 'AI', '머신러닝',
        '디자인', 'UI/UX', '마케팅', '영어', '일본어', '중국어', '자격증', '토익',
        '토플', 'JLPT', 'HSK', '정보처리기사', '컴활', '워드', '엑셀'
    ];

    const filteredTags = availableTags.filter(tag =>
        tag.toLowerCase().includes(tagSearchValue.toLowerCase())
    );

    const handleTagSelect = (tag: string) => {
        if (!studyData.tags.includes(tag)) {
            if (studyData.tags.length < 5) {
                setStudyData({
                    ...studyData,
                    tags: [...studyData.tags, tag]
                });
            } else {
                alert('태그는 5개까지만 선택할 수 있습니다!');
            }
        }
        // 모달창을 닫지 않고 태그만 추가
    };

    const handleComplete = () => {
        setIsTagModalOpen(false);
        setTagSearchValue('');
    };

    return (
        <PageLayout>
            <div className="max-w-4xl mx-auto p-6">
                {/* 헤더 */}
                <div className="relative mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 top-0 flex items-center space-x-2 text-gray-600 hover:text-[#8B85E9] transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>뒤로가기</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 text-center">스터디 생성</h1>
                </div>

                {/* 스터디 생성 폼 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 스터디 제목 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            스터디 제목 *
                        </label>
                        <input
                            type="text"
                            value={studyData.title}
                            onChange={(e) => {
                                setStudyData({ ...studyData, title: e.target.value });
                                if (errors.title) {
                                    setErrors(prev => ({ ...prev, title: '' }));
                                }
                            }}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] ${errors.title ? 'placeholder-red-500' : 'placeholder-gray-500'
                                }`}
                            placeholder={errors.title || "스터디 제목을 입력해주세요."}
                            style={{ color: errors.title ? '#dc2626' : '#1f2937' }}
                        />
                    </div>

                    {/* 스터디 소개 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            스터디 소개 *
                        </label>
                        <input
                            type="text"
                            value={studyData.introduction}
                            onChange={(e) => {
                                setStudyData({ ...studyData, introduction: e.target.value });
                                if (errors.introduction) {
                                    setErrors(prev => ({ ...prev, introduction: '' }));
                                }
                            }}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] ${errors.introduction ? 'placeholder-red-500' : 'placeholder-gray-500'
                                }`}
                            placeholder={errors.introduction || "스터디 소개를 입력해주세요."}
                            style={{ color: errors.introduction ? '#dc2626' : '#1f2937' }}
                        />
                    </div>

                    {/* 태그 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            태그 <span className="text-gray-500">({studyData.tags.length}/5)</span>
                        </label>
                        <div className="flex space-x-2 mb-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                placeholder="태그를 입력해주세요."
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            />
                            <button
                                type="button"
                                onClick={() => setIsTagModalOpen(true)}
                                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <Search className="w-5 h-5" />
                                <span>태그 찾기</span>
                            </button>
                        </div>
                        {/* 태그 목록 */}
                        <div className="flex flex-wrap gap-2">
                            {studyData.tags.map((tag, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-1 bg-[#8B85E9] text-white px-3 py-1 rounded-full text-sm"
                                >
                                    <span>#{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(tag)}
                                        className="ml-1 hover:text-red-200 transition-colors duration-200"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 최대 인원과 스터디 기간을 가로로 배치 */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* 최대 인원 */}
                        <div className="col-span-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                                 스터디 최대 인원 *
                             </label>
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
                                            if (numValue >= 0 && numValue <= 100) {
                                                setStudyData({ ...studyData, maxMembers: numValue });
                                            }
                                        }
                                    }
                                    if (errors.maxMembers) {
                                        setErrors(prev => ({ ...prev, maxMembers: '' }));
                                    }
                                }}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] ${errors.maxMembers ? 'placeholder-red-500' : 'placeholder-gray-500'
                                    }`}
                                placeholder={errors.maxMembers || "스터디 최대 인원을 입력해주세요"}
                                style={{ color: errors.maxMembers ? '#dc2626' : '#1f2937' }}
                            />
                        </div>

                        {/* 시작일 */}
                        <div className="col-span-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                시작일 *
                            </label>
                            <input
                                type="date"
                                value={studyData.startDate}
                                onChange={(e) => {
                                    setStudyData({ ...studyData, startDate: e.target.value });
                                    if (errors.startDate) {
                                        setErrors(prev => ({ ...prev, startDate: '' }));
                                    }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                style={{ color: errors.startDate ? '#ef4444' : '#1f2937' }}
                            />
                            {errors.startDate && (
                                <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
                            )}
                        </div>

                        {/* 종료일 */}
                        <div className="col-span-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                종료일 *
                            </label>
                            <input
                                type="date"
                                value={studyData.endDate}
                                onChange={(e) => {
                                    setStudyData({ ...studyData, endDate: e.target.value });
                                    if (errors.endDate) {
                                        setErrors(prev => ({ ...prev, endDate: '' }));
                                    }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                style={{ color: errors.endDate ? '#ef4444' : '#1f2937' }}
                            />
                            {errors.endDate && (
                                <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
                            )}
                        </div>
                    </div>

                    {/* 스터디 설명 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            스터디 설명 *
                        </label>
                        <textarea
                            value={studyData.description}
                            onChange={(e) => {
                                setStudyData({ ...studyData, description: e.target.value });
                                if (errors.description) {
                                    setErrors(prev => ({ ...prev, description: '' }));
                                }
                            }}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] resize-none ${errors.description ? 'placeholder-red-500' : 'placeholder-gray-500'
                                }`}
                            rows={5}
                            placeholder={errors.description || "스터디에 대한 상세한 설명을 입력해주세요"}
                            style={{ color: errors.description ? '#dc2626' : '#1f2937' }}
                        />
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200 font-medium"
                        >
                            스터디 생성
                        </button>
                    </div>
                </form>
            </div>

            {/* 태그 검색 모달 */}
            {isTagModalOpen && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-center items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">태그 찾기</h3>
                            <span className="ml-2 text-sm text-gray-500">({studyData.tags.length}/5)</span>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={tagSearchValue}
                                onChange={(e) => setTagSearchValue(e.target.value)}
                                placeholder="태그를 검색해주세요"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                autoFocus
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                            {filteredTags.length > 0 ? (
                                <div className="grid grid-cols-3 gap-3 p-3">
                                    {filteredTags.map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagSelect(tag)}
                                            disabled={studyData.tags.includes(tag)}
                                            className={`p-3 text-center rounded-lg border transition-colors duration-200 text-sm select-none ${studyData.tags.includes(tag)
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                                                    : studyData.tags.length >= 5
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-pointer'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-[#8B85E9] hover:text-white hover:border-[#8B85E9] cursor-pointer'
                                                }`}
                                        >
                                            #{tag}
                                        </button>
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

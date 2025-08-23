import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import { AuthContext } from '../contexts/AuthContext';
import { CommunityProvider, useCommunityContext } from '../contexts/CommunityContext';

const CommunityCreateInner: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const { createPost } = useCommunityContext();

    if (!authContext) {
        throw new Error('CommunityCreate 컴포넌트는 AuthProvider 내에서 사용되어야 합니다.');
    }
    const { user } = authContext;

    const [postData, setPostData] = useState({
        title: '',
        content: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 에러 초기화
        setErrors({});

        // 필수 필드 검증
        const newErrors: { [key: string]: string } = {};

        if (!postData.title.trim()) {
            newErrors.title = '게시글 제목을 입력해주세요!';
        }

        if (!postData.content.trim()) {
            newErrors.content = '게시글 내용을 입력해주세요!';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            // 게시글 생성
            const newPost = {
                title: postData.title,
                content: postData.content,
                author: user?.nickname || '익명',
                type: 'study' as const // 기본값으로 study 설정
            };

            createPost(newPost);

            // 성공 시 커뮤니티 페이지로 이동
            navigate('/community');
        } catch (error) {
            console.error('게시글 생성 실패:', error);
            alert('게시글 생성에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <PageLayout>
            <div className="max-w-3xl mx-auto p-4">
                {/* 헤더 */}
                <div className="relative mb-16">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 top-0 flex items-center space-x-2 text-gray-600 hover:text-[#8B85E9] transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>뒤로가기</span>
                    </button>
                </div>

                {/* 게시글 작성 폼 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 제목 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                게시글 제목 *
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <input
                                type="text"
                                value={postData.title}
                                onChange={(e) => {
                                    setPostData({ ...postData, title: e.target.value });
                                    if (errors.title) {
                                        setErrors(prev => ({ ...prev, title: '' }));
                                    }
                                }}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] placeholder-gray-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="게시글 제목을 입력해주세요."
                                style={{ color: errors.title ? '#dc2626' : '#1f2937' }}
                            />
                        </div>
                        {errors.title && (
                            <p className="mt-2 text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>

                    {/* 내용 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: "#8B85E9" }}></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                게시글 내용 *
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <textarea
                                value={postData.content}
                                onChange={(e) => {
                                    setPostData({ ...postData, content: e.target.value });
                                    if (errors.content) {
                                        setErrors(prev => ({ ...prev, content: '' }));
                                    }
                                }}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] resize-none placeholder-gray-500 ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
                                rows={8}
                                placeholder="게시글 내용을 입력해주세요."
                                style={{ color: errors.content ? '#dc2626' : '#1f2937' }}
                            />
                        </div>
                        {errors.content && (
                            <p className="mt-2 text-sm text-red-500">{errors.content}</p>
                        )}
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/community')}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200 font-medium"
                        >
                            게시글 생성
                        </button>
                    </div>
                </form>
            </div>
        </PageLayout>
    );
};

const CommunityCreate: React.FC = () => {
    return (
        <CommunityProvider>
            <CommunityCreateInner />
        </CommunityProvider>
    );
};

export default CommunityCreate;

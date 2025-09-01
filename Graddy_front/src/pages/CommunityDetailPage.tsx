import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import {
    CommunityProvider,
    useCommunityContext,
} from "../contexts/CommunityContext";
import CommentsSection from "../components/community/CommentsSection";

const CommunityDetailInner: React.FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const { posts } = useCommunityContext();

    const [post, setPost] = useState<any>(null);

    useEffect(() => {
        if (postId && posts) {
            const foundPost = posts.find((p) => p.id === postId);
            setPost(foundPost);
        }
    }, [postId, posts]);

    if (!post) {
        return (
            <div className="max-w-4xl mx-auto p-5 min-h-screen">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-gray-400 text-lg mb-2">
                            게시글을 찾을 수 없습니다
                        </div>
                        <div className="text-gray-300 text-sm">
                            존재하지 않는 게시글이거나 삭제되었습니다
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-5 min-h-screen">
            {/* 헤더 */}
            <div className="relative mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-0 top-0 flex items-center space-x-2 text-gray-600 hover:text-[#8B85E9] transition-colors duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>뒤로가기</span>
                </button>
            </div>

            {/* 게시글 상세 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                {/* 게시글 헤더 */}
                <div className="flex items-center gap-3 mb-4">
                    <span
                        className="text-xs px-3 py-1 rounded-full font-bold"
                        style={{
                            color:
                                post.type === "project" ? "#8B85E9" : "#10B981",
                            backgroundColor:
                                post.type === "project" ? "#E8E6FF" : "#D1FAE5",
                        }}
                    >
                        {post.type === "project" ? "프로젝트" : "스터디"}
                    </span>
                    <span className="text-sm text-gray-500">{post.author}</span>
                </div>

                {/* 제목 */}
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    {post.title}
                </h1>

                {/* 내용 */}
                <div className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                    {post.content}
                </div>
            </div>

            {/* 댓글 섹션 */}
            <CommentsSection
                postId={parseInt(post.id)}
                postType="free"
                initialExpanded={true}
            />
        </div>
    );
};

const CommunityDetailPage: React.FC = () => {
    return (
        <PageLayout>
            <CommunityProvider>
                <CommunityDetailInner />
            </CommunityProvider>
        </PageLayout>
    );
};

export default CommunityDetailPage;

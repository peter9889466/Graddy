import React, { useState, useEffect, useRef, useContext } from "react";
import {
    MessageCircle,
    MoreHorizontal,
    Send,
    Edit,
    Trash2,
    AlertCircle,
} from "lucide-react";
import { AuthContext } from "@/contexts/AuthContext";
interface BackendPost {
    stPrPostId: number;
    studyProjectId: number;
    memberId: string;
    title: string;
    content: string;
    createdAt: string;
}

interface Comment {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    editedAt?: string;
}

interface Post {
    id: string;
    author: string;
    title?: string;
    content: string;
    timestamp: string;
    comments: Comment[];
    canEdit?: boolean;
}

interface CommunityProps {
    studyProjectId?: number;
    currentUserId?: string;
}

const Community: React.FC<CommunityProps> = ({
    studyProjectId = 55, // 기본값으로 55 사용
    currentUserId = "나", // 기본값
}) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newPost, setNewPost] = useState("");
    const [newPostTitle, setNewPostTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [editTitle, setEditTitle] = useState("");

    // 댓글 관련 상태
    const [showComments, setShowComments] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(
        null
    );
    const [editCommentContent, setEditCommentContent] = useState("");

    const menuRef = useRef<HTMLDivElement>(null);

    const { user } = useContext(AuthContext)!;

    // API 함수들
    const fetchPosts = async () => {
        if (!studyProjectId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/posts/study-project/${studyProjectId}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 200 && result.data) {
                // 백엔드 데이터를 프론트엔드 형식으로 변환
                const transformedPosts: Post[] = result.data.map(
                    (backendPost: BackendPost) => ({
                        id: backendPost.stPrPostId.toString(),
                        author: backendPost.memberId,
                        title: backendPost.title,
                        content: backendPost.content,
                        timestamp: formatTimestamp(backendPost.createdAt),
                        comments: [], // 현재는 댓글 API가 없으므로 빈 배열
                        canEdit: backendPost.memberId === currentUserId,
                    })
                );

                setPosts(transformedPosts);
            } else {
                throw new Error(
                    result.message || "게시글을 불러오는데 실패했습니다."
                );
            }
        } catch (error) {
            console.error("게시글 로드 실패:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "게시글을 불러오는데 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const createPost = async (title: string, content: string) => {
        // studyProjectId와 사용자의 nickname이 모두 존재하는지 확인합니다.
        if (
            !studyProjectId ||
            !user?.nickname ||
            !title.trim() ||
            !content.trim()
        )
            return;

        setIsSubmitting(true);

        try {
            const response = await fetch(
                "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/posts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        studyProjectId: studyProjectId,
                        memberId: user.nickname, // ✅ AuthContext에서 가져온 nickname을 memberId로 사용
                        title: title.trim(),
                        content: content.trim(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 성공적으로 게시글을 작성한 후 목록을 새로고침합니다.
            await fetchPosts();
            setNewPost("");
            setNewPostTitle("");
        } catch (error) {
            console.error("게시글 작성 실패:", error);
            alert("게시글 작성에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updatePost = async (
        postId: string,
        title: string,
        content: string
    ) => {
        try {
            // URL에 stPrPostId(게시글 ID)와 currentMemberId(현재 로그인 사용자 ID)를 포함합니다.
            const response = await fetch(`http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/posts/${postId}?currentMemberId=${user?.nickname}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim()
                })
            });
            
            if (!response.ok) {
                // HTTP 오류가 발생했을 때 상세 메시지를 확인
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // 게시글 수정 성공 후 목록 새로고침
            await fetchPosts();
        } catch (error) {
            console.error('게시글 수정 실패:', error);
            alert(`게시글 수정에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
    };

    const deletePost = async (postId: string) => {
        try {
            // URL에 게시글 ID와 현재 로그인한 사용자 ID를 쿼리 파라미터로 포함합니다.
            const response = await fetch(`http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/posts/${postId}?currentMemberId=${user?.nickname}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                // HTTP 오류가 발생했을 때 상세 메시지를 확인합니다.
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            // 성공적으로 삭제되면 게시글 목록을 새로고침하여 화면을 업데이트합니다.
            await fetchPosts();
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            alert(`게시글 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
    };

    // 컴포넌트 마운트 시 게시글 목록 로드
    useEffect(() => {
        fetchPosts();
    }, [studyProjectId]);

    // 이벤트 핸들러들
    const handleSubmitPost = async () => {
        if (!newPostTitle.trim() || !newPost.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        await createPost(newPostTitle, newPost);
    };

    const handleEditPost = (post: Post) => {
        setEditingPostId(post.id);
        setEditTitle(post.title || "");
        setEditContent(post.content);
        setOpenMenuId(null);
    };

    const handleSaveEdit = async () => {
        if (!editingPostId || !editTitle.trim() || !editContent.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        await updatePost(editingPostId, editTitle, editContent);
        setEditingPostId(null);
        setEditTitle("");
        setEditContent("");
    };

    const handleCancelEdit = () => {
        setEditingPostId(null);
        setEditTitle("");
        setEditContent("");
    };

    const handleDeletePost = async (postId: string) => {
        if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            await deletePost(postId);
            setOpenMenuId(null);
        }
    };

    const toggleMenu = (postId: string) => {
        setOpenMenuId(openMenuId === postId ? null : postId);
    };

    // 댓글 관련 함수들 (현재는 로컬 상태만 사용)
    const handleAddComment = (postId: string) => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            author: currentUserId,
            content: newComment,
            timestamp: new Date().toLocaleString("ko-KR"),
        };

        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, comments: [...post.comments, comment] }
                    : post
            )
        );
        setNewComment("");
    };

    const handleEditComment = (postId: string, commentId: string) => {
        const post = posts.find((p) => p.id === postId);
        const comment = post?.comments.find((c) => c.id === commentId);
        if (comment) {
            setEditingCommentId(commentId);
            setEditCommentContent(comment.content);
        }
    };

    const handleSaveCommentEdit = (postId: string) => {
        if (!editingCommentId || !editCommentContent.trim()) return;

        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                          ...post,
                          comments: post.comments.map((comment) =>
                              comment.id === editingCommentId
                                  ? { ...comment, content: editCommentContent }
                                  : comment
                          ),
                      }
                    : post
            )
        );
        setEditingCommentId(null);
        setEditCommentContent("");
    };

    const handleCancelCommentEdit = () => {
        setEditingCommentId(null);
        setEditCommentContent("");
    };

    const handleDeleteComment = (postId: string, commentId: string) => {
        if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              comments: post.comments.filter(
                                  (c) => c.id !== commentId
                              ),
                          }
                        : post
                )
            );
        }
    };

    const toggleComments = (postId: string) => {
        setShowComments(showComments === postId ? null : postId);
    };

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // 로딩 상태
    if (loading) {
        return (
            <div className="space-y-4 p-4 pr-10">
                <h2
                    className="text-xl font-bold mb-6 -mt-4 -ml-4"
                    style={{ color: "#8B85E9" }}
                >
                    커뮤니티
                </h2>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85E9]"></div>
                    <span className="ml-2 text-gray-600">
                        게시글을 불러오는 중...
                    </span>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="space-y-4 p-4 pr-10">
                <h2
                    className="text-xl font-bold mb-6 -mt-4 -ml-4"
                    style={{ color: "#8B85E9" }}
                >
                    커뮤니티
                </h2>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            오류가 발생했습니다
                        </h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={() => fetchPosts()}
                            className="px-4 py-2 bg-[#8B85E9] hover:bg-[#7A75D8] text-white rounded-lg transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 pr-10">
            {/* 커뮤니티 제목 */}
            <h2
                className="text-xl font-bold mb-6 -mt-4 -ml-4"
                style={{ color: "#8B85E9" }}
            >
                커뮤니티
            </h2>

            {/* 새 게시글 작성 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#8B85E9] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                            {currentUserId[0]}
                        </span>
                    </div>
                    <div className="flex-1 space-y-3">
                        <input
                            type="text"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            placeholder="제목을 입력하세요..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                            disabled={isSubmitting}
                        />
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="스터디원들과 공유하고 싶은 내용을 작성해보세요..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                            rows={3}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmitPost}
                                disabled={
                                    !newPostTitle.trim() ||
                                    !newPost.trim() ||
                                    isSubmitting
                                }
                                className="px-4 py-2 bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>
                                    {isSubmitting ? "게시 중..." : "게시"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 게시글 목록 */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                    >
                        {/* 게시글 헤더 */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-medium text-sm">
                                        {post.author[0]}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {post.author}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {post.timestamp}
                                    </p>
                                </div>
                            </div>
                            {/* 본인 게시글만 수정/삭제 가능 */}
                            {post.canEdit && (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => toggleMenu(post.id)}
                                        className="p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                    </button>

                                    {openMenuId === post.id && (
                                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                            <button
                                                onClick={() =>
                                                    handleEditPost(post)
                                                }
                                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span>수정</span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeletePost(post.id)
                                                }
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>삭제</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 게시글 내용 */}
                        <div className="mb-4">
                            {editingPostId === post.id ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) =>
                                            setEditTitle(e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] font-medium"
                                        placeholder="제목을 입력하세요..."
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e) =>
                                            setEditContent(e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                                        rows={3}
                                        placeholder="내용을 입력하세요..."
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            disabled={
                                                !editTitle.trim() ||
                                                !editContent.trim()
                                            }
                                            className="px-3 py-1 text-sm bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded transition-colors disabled:cursor-not-allowed"
                                        >
                                            저장
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {post.title && (
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {post.title}
                                        </h3>
                                    )}
                                    <p className="text-gray-800 leading-relaxed">
                                        {post.content}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 게시글 액션 */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => toggleComments(post.id)}
                                    className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-sm">
                                        {post.comments.length}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* 댓글 섹션 */}
                        {showComments === post.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                {/* 댓글 목록 */}
                                <div className="space-y-3 mb-4">
                                    {post.comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="flex items-start space-x-3"
                                        >
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-gray-600 font-medium text-xs">
                                                    {comment.author[0]}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="font-medium text-sm text-gray-900">
                                                        {comment.author}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {comment.timestamp}
                                                    </span>
                                                </div>
                                                {editingCommentId ===
                                                comment.id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={
                                                                editCommentContent
                                                            }
                                                            onChange={(e) =>
                                                                setEditCommentContent(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] text-sm"
                                                            rows={2}
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={
                                                                    handleCancelCommentEdit
                                                                }
                                                                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                                                            >
                                                                취소
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleSaveCommentEdit(
                                                                        post.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    !editCommentContent.trim()
                                                                }
                                                                className="px-2 py-1 text-xs bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded transition-colors disabled:cursor-not-allowed"
                                                            >
                                                                저장
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start justify-between">
                                                        <p className="text-sm text-gray-800 leading-relaxed">
                                                            {comment.content}
                                                        </p>
                                                        {comment.author ===
                                                            currentUserId && (
                                                            <div className="flex items-center space-x-1 ml-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleEditComment(
                                                                            post.id,
                                                                            comment.id
                                                                        )
                                                                    }
                                                                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteComment(
                                                                            post.id,
                                                                            comment.id
                                                                        )
                                                                    }
                                                                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 새 댓글 작성 */}
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-[#8B85E9] rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-medium text-xs">
                                            {currentUserId[0]}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) =>
                                                setNewComment(e.target.value)
                                            }
                                            placeholder="댓글을 작성하세요..."
                                            className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] text-sm"
                                            rows={2}
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                onClick={() =>
                                                    handleAddComment(post.id)
                                                }
                                                disabled={!newComment.trim()}
                                                className="px-3 py-1 text-sm bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded transition-colors disabled:cursor-not-allowed"
                                            >
                                                댓글 작성
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 게시글이 없을 때 */}
            {posts.length === 0 && !loading && !error && (
                <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        아직 게시글이 없습니다
                    </h3>
                    <p className="text-gray-500">
                        첫 번째 게시글을 작성해보세요!
                    </p>
                </div>
            )}
        </div>
    );
};

export default Community;

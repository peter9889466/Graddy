// 스터디별 커뮤니티
import React, { useState, useEffect, useRef } from "react";
import {
    MessageCircle,
    MoreHorizontal,
    Send,
    Edit,
    Trash2,
    AlertCircle,
} from "lucide-react";

// API 기본 URL 설정
const API_BASE_URL = 'http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api';

interface BackendPost {
    stPrPostId: number;
    studyProjectId: number;
    memberId: string;
    title: string;
    content: string;
    createdAt: string;
}

interface Comment {
    commentId: number;
    userId: string;
    nickname: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface Post {
    id: string;
    author: string;
    title?: string;
    content: string;
    timestamp: string;
    comments: Comment[];
    canEdit?: boolean;
    nick?:string;
}

interface CommunityProps {
    studyProjectId: number;
    currentUserId: string;
    members: {
        memberId: number;
        userId: string;
        nick: string;
        memberType: string;
        memberStatus: string;
        joinedAt: string;
    }[];
}

const Community: React.FC<CommunityProps> = ({
    studyProjectId = 55, // 기본값으로 55 사용
    currentUserId = "나", // 기본값
    members = [], // 기본값으로 빈 배열
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

    const [showComments, setShowComments] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
    const [newComments, setNewComments] = useState<{ [postId: string]: string }>({});

    const menuRef = useRef<HTMLDivElement>(null);

    // const { user, token, isLoggedIn } = useContext(AuthContext)!;

    const getAuthHeaders = (): HeadersInit => {
        const token = localStorage.getItem("userToken") || "";
        return {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        };
    };


    const isStudyMember = members.some(
        (member) => member.userId === currentUserId
        );
    console.log("스터디 멤버 여부:", isStudyMember);
        
    // 현재 사용자가 approved 상태인 멤버인지 확인
    const isApprovedMember = members.some(
        (member) => member.userId === currentUserId && member.memberStatus === 'approved'
    );
    console.log("승인된 스터디 멤버 여부:", isApprovedMember);
        
    console.log("스터디 멤버 배열:", members);
    console.log("현재 사용자 ID:", currentUserId);

        
    const handleChangeComment = (postId: string, value: string) => {
        setNewComments((prev) => ({ ...prev, [postId]: value }));
    };

    // 댓글 수 조회
    const fetchCommentCount = async (postId: string) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/comments/study-posts/${postId}/count`,
                { headers: getAuthHeaders() }
            );
            if (!response.ok) throw new Error("댓글 수 조회 실패");
            const result = await response.json();
            if (result.status === 200) {
                setCommentCounts((prev) => ({ ...prev, [postId]: result.data }));
            }
        } catch (error) {
            console.error("댓글 수 조회 실패:", error);
        }
    };
    

    // 댓글 목록 조회
    const fetchComments = async (postId: string) => {
        try {
            const response = await fetch(
            `${API_BASE_URL}/api/comments/study-posts/${postId}`,
            { headers: getAuthHeaders() }
            );
            if (!response.ok) throw new Error(`댓글 목록 조회 실패: HTTP ${response.status}`);
            const result = await response.json();
            console.log(`postId ${postId} 댓글 목록 확인:`, result);
            setPosts((prev) =>
            prev.map((post) =>
                post.id === postId ? { ...post, comments: result.data } : post
            )
            );
            setCommentCounts((prev) => ({ ...prev, [postId]: result.data.length }));
        } catch (error) {
            console.error("댓글 목록 조회 실패:", error);
        }
    };

    // 댓글 작성
    const handleAddComment = async (postId: string) => {
        const content = (newComments[postId] || "").trim();
        if (!content) return;

        // 멤버 상태 확인 - approved 상태인 멤버만 댓글 작성 가능
        if (!isApprovedMember) {
            alert("승인된 스터디 멤버만 댓글을 작성할 수 있습니다.");
            return;
        }

        // studyProjectId 타입 확인
        console.log("studyProjectId 타입:", typeof studyProjectId, "값:", studyProjectId);
        console.log("postId",postId)

        const payload = {
            content,
            studyProjectId: Number(studyProjectId)  // 숫자형으로 강제 변환
        };

        console.log("보낼 payload:", payload);
        console.log("Authorization 헤더:", getAuthHeaders());

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/comments/study-posts/${postId}`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload),
                }
            );

            console.log("서버 응답 status:", response.status);

            const result = await response.json();
            console.log("서버 응답 body:", result);

            if (!response.ok) {
                throw new Error(result?.message || `HTTP error! status: ${response.status}`);
            }

            setNewComments((prev) => ({ ...prev, [postId]: "" }));
            fetchComments(postId);
            fetchCommentCount(postId);

        } catch (error) {
            console.error("댓글 작성 실패:", error);
            alert(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.");
        }
    };

    // 댓글 수정 시작
    const handleEditComment = (comment: Comment) => {
        setEditingCommentId(comment.commentId.toString());
        setEditCommentContent(comment.content);
    };

    // 댓글 수정 저장
    const handleSaveCommentEdit = async (postId: string) => {
        if (!editingCommentId || !editCommentContent.trim()) return;
            
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/comments/${editingCommentId}?content=${encodeURIComponent(editCommentContent)}`,
                {
                    method: "PUT",
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    // body: JSON.stringify({ content: editCommentContent }),
                }
            );

            if (!response.ok) {
                // 서버가 오류 메시지를 JSON으로 줄 수도 있고 아닐 수도 있음
                let errMsg = `${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData?.message) errMsg = errData.message;
                } catch {}
                throw new Error(errMsg);
            }

            // JSON 바디가 없는 경우를 대비
            if (response.status !== 200) {
                await response.json(); // 성공 메시지 읽기 (있으면)
            }

            setEditingCommentId(null);
            setEditCommentContent("");
            fetchComments(postId);
            fetchCommentCount(postId);
        } catch (error) {
            console.error("댓글 수정 실패:", error);
            alert(error instanceof Error ? error.message : "댓글 수정에 실패했습니다.");
        }
    };

    // 댓글 수정 취소
    const handleCancelCommentEdit = () => {
        setEditingCommentId(null);
        setEditCommentContent("");
    };

    // 댓글 삭제
    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
        
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/comments/${commentId}`,
                { method: "DELETE", headers: getAuthHeaders() }
            );

            console.log("🔍 Response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log("🔍 서버 에러 메시지:", errorText);
                console.log("🔍 Headers:", getAuthHeaders());
                throw new Error(`댓글 삭제 실패: ${response.status} - ${errorText}`);
            }

            // 성공 처리
            fetchComments(postId);
            fetchCommentCount(postId);
            // alert("댓글이 삭제되었습니다.");
            console.log("✅ 댓글이 삭제되었습니다.");
            
        } catch (error) {
            console.error("댓글 삭제 실패:", error);
            alert(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.");
        }
    };

    // 댓글 토글
    const toggleComments = (postId: string) => {
        if (showComments === postId) {
            setShowComments(null);
        } else {
            setShowComments(postId);
            fetchComments(postId);
        }
    };

    // 게시글 목록
    const fetchPosts = async () => {
        if (!studyProjectId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/posts/study-project/${studyProjectId}`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 200 && result.data) {
                const transformedPosts: Post[] = result.data.map((backendPost: BackendPost) => {
                    // 닉네임 매칭 디버깅
                    const matchedMember = members.find(member => member.userId === backendPost.memberId);
                    console.log('🔍 게시글 작성자 매칭:', {
                        postId: backendPost.stPrPostId,
                        authorId: backendPost.memberId,
                        membersCount: members.length,
                        matchedMember: matchedMember,
                        finalNick: matchedMember?.nick || '알 수 없음'
                    });
                    
                    return {
                        id: backendPost.stPrPostId.toString(),
                        author: backendPost.memberId,
                        title: backendPost.title,
                        content: backendPost.content,
                        timestamp: formatTimestamp(backendPost.createdAt),
                        comments: [],
                        canEdit: backendPost.memberId === currentUserId,
                        nick: matchedMember?.nick || '알 수 없음'
                    };
                });
                
                setPosts(transformedPosts);

                // ✅ 각 게시글에 대한 댓글 수 조회
                transformedPosts.forEach((post) => {
                    fetchCommentCount(post.id);
                });
            } else {
                throw new Error(result.message || "게시글을 불러오는데 실패했습니다.");
            }
        } catch (error) {
            console.error("게시글 로드 실패:", error);
            setError(error instanceof Error ? error.message : "게시글을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [studyProjectId]);

    const formatTimestamp = (isoString: string) => {
        try {
            // 백엔드에서 LocalDateTime으로 전송된 시간을 한국 시간대로 정확히 변환
            // LocalDateTime은 시간대 정보가 없으므로 한국 시간으로 해석
            const date = new Date(isoString + '+09:00'); // 한국 시간대(UTC+9) 명시적 지정
            
            if (isNaN(date.getTime())) {
                console.warn('날짜 파싱 실패:', isoString);
                return '날짜 형식 오류';
            }
            
            return date.toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Seoul" // 한국 시간대 명시적 지정
            });
        } catch (error) {
            console.error('날짜 포맷팅 오류:', error, '원본:', isoString);
            return '날짜 오류';
        }
    };

    // 게시글 작성
    const createPost = async (title: string, content: string) => {
    if (!studyProjectId || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: getAuthHeaders(),
            body: JSON.stringify({
            studyProjectId,
            memberId: currentUserId,
            title: title.trim(),
            content: content.trim(),
            }),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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

    // 게시글 수정
    const updatePost = async (postId: string, title: string, content: string) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/posts/${postId}?currentMemberId=${currentUserId}`,
            {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ title: title.trim(), content: content.trim() }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        await fetchPosts();
        } catch (error) {
        console.error("게시글 수정 실패:", error);
        alert(
            `게시글 수정에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
        );
        }
    };

    // 게시글 삭제
    const deletePost = async (postId: string) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/posts/${postId}?currentMemberId=${currentUserId}`,
            {
            method: "DELETE",
            headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        await fetchPosts();
        } catch (error) {
        console.error("게시글 삭제 실패:", error);
        alert(
            `게시글 삭제에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
        );
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
                            {currentUserId?.[0]?.toUpperCase() || 'U'}
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
                                        {post.author[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {post.nick}
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
                                        {commentCounts[post.id] || 0}
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
                                    <div key={comment.commentId} className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-gray-600 font-medium text-xs">
                                                {comment.nickname[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-sm text-gray-900">
                                                    {comment.nickname}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTimestamp(comment.createdAt)}
                                                </span>
                                            </div>

                                            {editingCommentId === comment.commentId.toString() ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={editCommentContent}
                                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                                        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] text-sm"
                                                        rows={2}
                                                    />
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={handleCancelCommentEdit}
                                                            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                                                        >
                                                            취소
                                                        </button>
                                                        <button
                                                            onClick={() => handleSaveCommentEdit(post.id)}
                                                            disabled={!editCommentContent.trim()}
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
                                                    {comment.userId === currentUserId && (
                                                    <div className="flex items-center space-x-1 ml-2">
                                                        <button
                                                            onClick={() => handleEditComment(comment)}
                                                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteComment(post.id, comment.commentId.toString())
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
                                        {currentUserId[0].toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    {!isApprovedMember ? (
                                        <p className="text-sm text-gray-500">
                                            승인된 스터디 멤버만 댓글을 작성할 수 있습니다.
                                        </p>
                                    ) : (
                                        <>
                                            <textarea
                                                value={newComments[post.id] || ""}
                                                onChange={(e) => handleChangeComment(post.id, e.target.value)}
                                                placeholder="댓글을 작성하세요..."
                                                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] text-sm"
                                                rows={2}
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={() => handleAddComment(post.id)}
                                                    disabled={!(newComments[post.id]?.trim())}
                                                    className="px-3 py-1 text-sm bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded transition-colors disabled:cursor-not-allowed"
                                                >
                                                    댓글 작성
                                                </button>
                                            </div>
                                        </>
                                    )}
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
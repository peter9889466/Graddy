import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { ChevronDown, ChevronUp } from "lucide-react";

// API 응답 타입 정의
interface CommentResponse {
    commentId: number;
    userId: string;
    nickname: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

// API 요청 타입
interface CommentRequest {
    content: string;
    studyProjectId?: number;
}

interface Props {
    postId: number;
    postType: "free" | "study" | "assignment";
    isExpanded: boolean;
    onToggle: () => void;
}

// JWT 토큰을 localStorage에서 가져오는 헬퍼 함수
const getAuthHeaders = () => {
    const token = localStorage.getItem("userToken");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// API 함수들
const commentApi = {
    // 댓글 목록 조회
    getCommentsByType: async (
        postType: string,
        postId: number
    ): Promise<ApiResponse<CommentResponse[]>> => {
        const response = await fetch(
            `http://localhost:8080/api/api/comments/free-posts/${postId}`,
            {
                method: "GET",
                headers: getAuthHeaders(),
            }
        );
        return response.json();
    },

    // 댓글 작성
    createCommentByType: async (
        postType: string,
        postId: number,
        commentData: CommentRequest
    ): Promise<ApiResponse<CommentResponse>> => {
        const response = await fetch(
            `http://localhost:8080/api/api/comments/free-posts/${postId}`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(commentData),
            }
        );
        return response.json();
    },

    // 댓글 수정
    updateComment: async (
        commentId: number,
        content: string
    ): Promise<ApiResponse<CommentResponse>> => {
        const response = await fetch(
            `http://localhost:8080/api/api/comments/${commentId}?content=${encodeURIComponent(
                content
            )}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
            }
        );
        return response.json();
    },

    // 댓글 삭제
    deleteComment: async (commentId: number): Promise<ApiResponse<null>> => {
        const response = await fetch(
            `http://localhost:8080/api/api/comments/${commentId}`,
            {
                method: "DELETE",
                headers: getAuthHeaders(),
            }
        );
        return response.json();
    },
};

const Comments: React.FC<Props> = ({
    postId,
    postType,
    isExpanded,
    onToggle,
}) => {
    const authContext = useContext(AuthContext);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [loading, setLoading] = useState(false);

    const isLoggedIn = authContext?.isLoggedIn || false;
    const currentUser = authContext?.user;

    // 댓글 목록 로드
    const loadComments = async () => {
        if (!isExpanded) return;

        try {
            setLoading(true);
            const response = await commentApi.getCommentsByType(
                postType,
                postId
            );

            if (response.status === 200 && Array.isArray(response.data)) {
                setComments(response.data);
            } else {
                console.error("댓글 데이터 형식 오류:", response);
                setComments([]);
            }
        } catch (error) {
            console.error("댓글 로드 실패:", error);
            setComments([]);
            console.warn("댓글을 불러오는데 실패했습니다:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, [isExpanded, postId, postType]);

    const handleAddComment = async () => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            return;
        }
        if (!newComment.trim()) {
            alert("댓글 내용을 입력하세요.");
            return;
        }

        try {
            // JWT 토큰 확인
            const token = localStorage.getItem("userToken");
            if (!token) {
                alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
                return;
            }

            const commentData: CommentRequest = {
                content: newComment.trim(),
                studyProjectId: 0, // API 명세에 따라 필수값, 필요시 수정
            };

            const response = await commentApi.createCommentByType(
                postType,
                postId,
                commentData
            );

            if (response.status === 201) {
                setNewComment("");
                loadComments();
                console.log("댓글이 성공적으로 작성되었습니다.");
            } else {
                throw new Error(
                    response.message || "댓글 작성에 실패했습니다."
                );
            }
        } catch (error) {
            console.error("댓글 작성 실패:", error);
            alert("댓글 작성에 실패했습니다.");
        }
    };

    return (
        <div className="border-t border-gray-200 pt-3 ">
            {/* 댓글 토글 버튼 */}
            <button
                onClick={onToggle}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#8B85E9] transition-colors mb-3 ml-3"
            >
                {isExpanded ? (
                    <ChevronUp size={16} />
                ) : (
                    <ChevronDown size={16} />
                )}
                댓글 {comments.length}개
            </button>

            {/* 댓글 섹션 (확장 시에만 표시) */}
            {isExpanded && (
                <div className="space-y-4">
                    {/* 댓글 작성 (로그인 시에만) */}
                    {isLoggedIn ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex gap-2 mb-3">
                                <input
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    placeholder="댓글을 입력하세요..."
                                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-[#8B85E9]"
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="px-4 py-2 rounded-lg text-white hover:bg-[#7A74D8] transition-colors"
                                    style={{ backgroundColor: "#8B85E9" }}
                                >
                                    등록
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                            댓글을 작성하려면 로그인이 필요합니다.
                        </div>
                    )}

                    {/* 댓글 목록 */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center text-gray-500 py-4">
                                댓글을 불러오는 중...
                            </div>
                        ) : (
                            <>
                                {comments.map((comment) => (
                                    <CommentItem
                                        key={comment.commentId}
                                        comment={comment}
                                        onUpdate={loadComments}
                                    />
                                ))}
                                {comments.length === 0 && (
                                    <div className="text-center text-gray-500 py-4">
                                        아직 댓글이 없습니다.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const CommentItem: React.FC<{
    comment: CommentResponse;
    onUpdate: () => void;
}> = ({ comment, onUpdate }) => {
    const authContext = useContext(AuthContext);
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [editCommentContent, setEditCommentContent] = useState("");

    const isLoggedIn = authContext?.isLoggedIn || false;
    const currentUser = authContext?.user;

    const handleEditComment = () => {
        setIsEditingComment(true);
        setEditCommentContent(comment.content);
    };

    const handleSaveComment = async () => {
        if (!editCommentContent.trim()) {
            alert("댓글 내용을 입력하세요.");
            return;
        }

        try {
            // JWT 토큰 확인
            const token = localStorage.getItem("userToken");
            if (!token) {
                alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
                return;
            }

            const response = await commentApi.updateComment(
                comment.commentId,
                editCommentContent.trim()
            );
            if (response.status === 200) {
                setIsEditingComment(false);
                setEditCommentContent("");
                onUpdate();
                console.log("댓글이 성공적으로 수정되었습니다.");
            } else {
                throw new Error(
                    response.message || "댓글 수정에 실패했습니다."
                );
            }
        } catch (error) {
            console.error("댓글 수정 실패:", error);
            alert("댓글 수정에 실패했습니다.");
        }
    };

    const handleCancelEditComment = () => {
        setIsEditingComment(false);
        setEditCommentContent("");
    };

    const handleDeleteComment = async () => {
        if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            try {
                // JWT 토큰 확인
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
                    return;
                }

                const response = await commentApi.deleteComment(
                    comment.commentId
                );
                if (response.status === 200) {
                    onUpdate();
                    console.log("댓글이 성공적으로 삭제되었습니다.");
                } else {
                    throw new Error(
                        response.message || "댓글 삭제에 실패했습니다."
                    );
                }
            } catch (error) {
                console.error("댓글 삭제 실패:", error);
                alert("댓글 삭제에 실패했습니다.");
            }
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="font-medium text-sm">
                        {comment.nickname}
                    </div>
                    {isEditingComment ? (
                        <div className="mt-2">
                            <textarea
                                value={editCommentContent}
                                onChange={(e) =>
                                    setEditCommentContent(e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8B85E9] resize-none"
                                rows={3}
                                placeholder="댓글을 수정하세요..."
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleSaveComment}
                                    className="px-3 py-1 rounded-lg text-white text-xs hover:bg-[#7A74D8] transition-colors"
                                    style={{ backgroundColor: "#8B85E9" }}
                                >
                                    저장
                                </button>
                                <button
                                    onClick={handleCancelEditComment}
                                    className="px-3 py-1 rounded-lg text-gray-600 text-xs border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-700 whitespace-pre-line mt-1">
                            {comment.content}
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                    </div>
                    {/* 수정/삭제 버튼 - 본인 댓글만 (nickname 비교) */}
                    {isLoggedIn &&
                        currentUser?.nickname === comment.nickname &&
                        !isEditingComment && (
                            <div className="flex gap-1">
                                <button
                                    onClick={handleEditComment}
                                    className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                                >
                                    수정
                                </button>
                                <button
                                    onClick={handleDeleteComment}
                                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

// Note: 대댓글 기능은 현재 백엔드 API에서 지원하지 않으므로 제거됨

export default Comments;

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import {
    communityApi,
    Post as ApiPost,
    CreatePostRequest,
} from "../services/communityApi";

export type PostType = "project" | "study";

export interface Reply {
    id: string;
    postId: string;
    parentCommentId: string; // 상위 댓글 ID
    content: string;
    author: string;
    createdAt: string;
}

export interface Comment {
    id: string;
    postId: string;
    content: string;
    author: string;
    createdAt: string;
}

export interface Post {
    id: string;
    type: PostType;
    title: string;
    author: string;
    content: string;
    createdAt: string;
}

interface CommunityContextType {
    posts: Post[];
    comments: Comment[];
    replies: Reply[];
    loading: boolean;
    error: string | null;
    createPost: (data: CreatePostRequest) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    updatePost: (postId: string, data: CreatePostRequest) => Promise<void>;
    refreshPosts: () => Promise<void>;
    addComment: (postId: string, content: string, author: string) => void;
    addReply: (
        postId: string,
        parentCommentId: string,
        content: string,
        author: string
    ) => void;
    updateComment: (commentId: string, content: string) => void;
    deleteComment: (commentId: string) => void;
    updateReply: (replyId: string, content: string) => void;
    deleteReply: (replyId: string) => void;
    getCommentsByPost: (postId: string) => Comment[];
    getRepliesByComment: (commentId: string) => Reply[];
}

const CommunityContext = createContext<CommunityContextType | undefined>(
    undefined
);

export const useCommunityContext = () => {
    const ctx = useContext(CommunityContext);
    if (!ctx)
        throw new Error(
            "useCommunityContext must be used within CommunityProvider"
        );
    return ctx;
};

interface ProviderProps {
    children: ReactNode;
}

export const CommunityProvider: React.FC<ProviderProps> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // API 게시글을 UI 게시글로 변환
    const convertApiPostToPost = (apiPost: ApiPost): Post => ({
        id: apiPost.frPostId.toString(),
        type: "project", // 기본값, 필요시 API에서 타입 정보 추가
        title: apiPost.title,
        author: apiPost.nick || apiPost.userId,
        content: apiPost.content,
        createdAt: new Date(apiPost.createdAt).toLocaleString("ko-KR"),
    });

    // 게시글 목록 조회
    const refreshPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const apiPosts = await communityApi.getAllPosts();
            const convertedPosts = apiPosts.map(convertApiPostToPost);
            setPosts(convertedPosts);
        } catch (err) {
            console.error("게시글 조회 실패:", err);
            setError("게시글을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 게시글 생성
    const createPost = async (data: CreatePostRequest) => {
        try {
            setLoading(true);
            setError(null);
            console.log("게시글 생성 요청 데이터:", data);

            const result = await communityApi.createPost(data);
            console.log("게시글 생성 성공:", result);

            await refreshPosts(); // 생성 후 목록 새로고침
        } catch (err: any) {
            console.error("게시글 생성 실패 상세:", {
                error: err,
                message: err?.message,
                response: err?.response?.data,
                status: err?.response?.status,
            });

            let errorMessage = "게시글 작성에 실패했습니다.";
            if (err?.response?.status === 401) {
                errorMessage = "로그인이 필요합니다.";
            } else if (err?.response?.status === 403) {
                errorMessage = "권한이 없습니다.";
            } else if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 게시글 삭제
    const deletePost = async (postId: string) => {
        try {
            setLoading(true);
            setError(null);
            await communityApi.deletePost(parseInt(postId));
            await refreshPosts(); // 삭제 후 목록 새로고침
        } catch (err) {
            console.error("게시글 삭제 실패:", err);
            setError("게시글 삭제에 실패했습니다.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 게시글 수정
    const updatePost = async (postId: string, data: CreatePostRequest) => {
        try {
            setLoading(true);
            setError(null);
            await communityApi.updatePost(parseInt(postId), data);
            await refreshPosts(); // 수정 후 목록 새로고침
        } catch (err) {
            console.error("게시글 수정 실패:", err);
            setError("게시글 수정에 실패했습니다.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 게시글 목록 조회
    useEffect(() => {
        refreshPosts();
    }, []);

    const addComment = (postId: string, content: string, author: string) => {
        const newComment: Comment = {
            id: `${Date.now()}-${Math.random()}`,
            postId,
            content,
            author,
            createdAt: new Date().toLocaleString("ko-KR"),
        };
        setComments((prev) => [...prev, newComment]);
    };

    const addReply = (
        postId: string,
        parentCommentId: string,
        content: string,
        author: string
    ) => {
        const newReply: Reply = {
            id: `${Date.now()}-${Math.random()}`,
            postId,
            parentCommentId,
            content,
            author,
            createdAt: new Date().toLocaleString("ko-KR"),
        };
        setReplies((prev) => [...prev, newReply]);
    };

    const updateComment = (commentId: string, content: string) => {
        setComments((prev) =>
            prev.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
            )
        );
    };

    const deleteComment = (commentId: string) => {
        setComments((prev) =>
            prev.filter((comment) => comment.id !== commentId)
        );
        // 해당 댓글의 대댓글도 함께 삭제
        setReplies((prev) =>
            prev.filter((reply) => reply.parentCommentId !== commentId)
        );
    };

    const updateReply = (replyId: string, content: string) => {
        setReplies((prev) =>
            prev.map((reply) =>
                reply.id === replyId ? { ...reply, content } : reply
            )
        );
    };

    const deleteReply = (replyId: string) => {
        setReplies((prev) => prev.filter((reply) => reply.id !== replyId));
    };

    const getCommentsByPost = (postId: string) =>
        comments.filter((c) => c.postId === postId);
    const getRepliesByComment = (commentId: string) =>
        replies.filter((r) => r.parentCommentId === commentId);

    const value: CommunityContextType = {
        posts,
        comments,
        replies,
        loading,
        error,
        createPost,
        deletePost,
        updatePost,
        refreshPosts,
        addComment,
        addReply,
        updateComment,
        deleteComment,
        updateReply,
        deleteReply,
        getCommentsByPost,
        getRepliesByComment,
    };

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
};

import React, { createContext, useContext, useState, ReactNode } from "react";

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
    createPost: (data: Omit<Post, "id" | "createdAt">) => void;
    addComment: (postId: string, content: string, author: string) => void;
    addReply: (
        postId: string,
        parentCommentId: string,
        content: string,
        author: string
    ) => void;
    getCommentsByPost: (postId: string) => Comment[];
    getRepliesByComment: (commentId: string) => Reply[];
}

const CommunityContext = createContext<CommunityContextType | undefined>(
    undefined
);

export const useCommunityContext = () => {
    const ctx = useContext(CommunityContext);
    if (!ctx) throw new Error("useCommunityContext must be used within CommunityProvider");
    return ctx;
};

interface ProviderProps {
    children: ReactNode;
}

export const CommunityProvider: React.FC<ProviderProps> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [replies, setReplies] = useState<Reply[]>([]);

    const createPost = (data: Omit<Post, "id" | "createdAt">) => {
        const newPost: Post = {
            ...data,
            id: Date.now().toString(),
            createdAt: new Date().toLocaleString("ko-KR"),
        };
        setPosts((prev) => [newPost, ...prev]);
    };

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

    const getCommentsByPost = (postId: string) =>
        comments.filter((c) => c.postId === postId);
    const getRepliesByComment = (commentId: string) =>
        replies.filter((r) => r.parentCommentId === commentId);

    const value: CommunityContextType = {
        posts,
        comments,
        replies,
        createPost,
        addComment,
        addReply,
        getCommentsByPost,
        getRepliesByComment,
    };

    return (
        <CommunityContext.Provider value={value}>
            {children}
        </CommunityContext.Provider>
    );
};



import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';
import { AxiosResponse } from 'axios';

// 댓글 요청 타입
export interface CommentRequest {
    content: string;
}

// 댓글 응답 타입
export interface CommentResponse {
    commentId: number;
    content: string;
    nickname: string;
    createdAt: string;
    updatedAt?: string;
}

// 과제 댓글 작성
export const createAssignmentComment = (assignmentId: number, data: CommentRequest): Promise<AxiosResponse<ApiResponse<CommentResponse>>> => {
    return apiPost<CommentResponse>(`/comments/assignments/${assignmentId}`, data);
};

// 과제 댓글 목록 조회
export const getAssignmentComments = (assignmentId: number): Promise<AxiosResponse<ApiResponse<CommentResponse[]>>> => {
    return apiGet<CommentResponse[]>(`/comments/assignments/${assignmentId}`);
};

// 과제 댓글 수 조회
export const getAssignmentCommentCount = (assignmentId: number): Promise<AxiosResponse<ApiResponse<number>>> => {
    return apiGet<number>(`/comments/assignments/${assignmentId}/count`);
};

// 자유게시판 댓글 작성
export const createFreePostComment = (frPostId: number, data: CommentRequest): Promise<AxiosResponse<ApiResponse<CommentResponse>>> => {
    return apiPost<CommentResponse>(`/comments/free-posts/${frPostId}`, data);
};

// 555555555555555666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
export const getFreePostComments = (frPostId: number): Promise<AxiosResponse<ApiResponse<CommentResponse[]>>> => {
    return apiGet<CommentResponse[]>(`/comments/free-posts/${frPostId}`);
};

// 자유게시판 댓글 수 조회
export const getFreePostCommentCount = (frPostId: number): Promise<AxiosResponse<ApiResponse<number>>> => {
    return apiGet<number>(`/comments/free-posts/${frPostId}/count`);
};

// 스터디게시판 댓글 작성
export const createStudyPostComment = (stPrPostId: number, data: CommentRequest): Promise<AxiosResponse<ApiResponse<CommentResponse>>> => {
    return apiPost<CommentResponse>(`/comments/study-posts/${stPrPostId}`, data);
};

// 스터디게시판 댓글 목록 조회
export const getStudyPostComments = (stPrPostId: number): Promise<AxiosResponse<ApiResponse<CommentResponse[]>>> => {
    return apiGet<CommentResponse[]>(`/comments/study-posts/${stPrPostId}`);
};

// 스터디게시판 댓글 수 조회
export const getStudyPostCommentCount = (stPrPostId: number): Promise<AxiosResponse<ApiResponse<number>>> => {
    return apiGet<number>(`/comments/study-posts/${stPrPostId}/count`);
};

// 댓글 수정
export const updateComment = (commentId: number, content: string): Promise<AxiosResponse<ApiResponse<CommentResponse>>> => {
    return apiPut<CommentResponse>(`/comments/${commentId}?content=${encodeURIComponent(content)}`, {});
};

// 댓글 삭제
export const deleteComment = (commentId: number): Promise<AxiosResponse<ApiResponse<void>>> => {
    return apiDelete<void>(`/comments/${commentId}`);
};

// 댓글 타입별 API 함수 매핑
export const getCommentsByType = (postType: 'free' | 'study' | 'assignment', postId: number): Promise<AxiosResponse<ApiResponse<CommentResponse[]>>> => {
    switch (postType) {
        case 'free':
            return getFreePostComments(postId);
        case 'study':
            return getStudyPostComments(postId);
        case 'assignment':
            return getAssignmentComments(postId);
        default:
            throw new Error(`Unsupported post type: ${postType}`);
    }
};

export const createCommentByType = (postType: 'free' | 'study' | 'assignment', postId: number, data: CommentRequest): Promise<AxiosResponse<ApiResponse<CommentResponse>>> => {
    switch (postType) {
        case 'free':
            return createFreePostComment(postId, data);
        case 'study':
            return createStudyPostComment(postId, data);
        case 'assignment':
            return createAssignmentComment(postId, data);
        default:
            throw new Error(`Unsupported post type: ${postType}`);
    }
};

export const getCommentCountByType = (postType: 'free' | 'study' | 'assignment', postId: number): Promise<AxiosResponse<ApiResponse<number>>> => {
    switch (postType) {
        case 'free':
            return getFreePostCommentCount(postId);
        case 'study':
            return getStudyPostCommentCount(postId);
        case 'assignment':
            return getAssignmentCommentCount(postId);
        default:
            throw new Error(`Unsupported post type: ${postType}`);
    }
};
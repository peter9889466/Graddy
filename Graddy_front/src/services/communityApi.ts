import axios from 'axios';

const API_BASE_URL = 'http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api';

// JWT 토큰을 포함한 axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: JWT 토큰 자동 추가
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token && token !== 'null' && token.trim() !== '') {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Community API - Authorization 헤더 추가됨:', `Bearer ${token.substring(0, 20)}...`);
        } else {
            console.log('Community API - 토큰이 없어서 Authorization 헤더를 포함하지 않습니다.');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
    (response) => {
        console.log('Community API 응답 성공:', response.status, response.data);
        return response;
    },
    (error) => {
        console.error('Community API 에러:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            // 토큰 만료 시 로그인 페이지로 리다이렉트
            localStorage.removeItem('userToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 게시글 타입 정의
export interface Post {
    frPostId: number;
    userId: string;
    nick: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface CreatePostRequest {
    title: string;
    content: string;
}

export interface UpdatePostRequest {
    title: string;
    content: string;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

// 커뮤니티 API 서비스
export const communityApi = {
    // 전체 게시글 조회
    async getAllPosts(): Promise<Post[]> {
        try {
            const response = await apiClient.get<ApiResponse<Post[]>>('/free-posts');
            return response.data.data || [];
        } catch (error) {
            console.error('게시글 목록 조회 실패:', error);
            throw error;
        }
    },

    // 게시글 생성
    async createPost(postData: CreatePostRequest): Promise<Post> {
        try {
            console.log('게시글 생성 API 호출:', {
                url: `${API_BASE_URL}/free-posts`,
                data: postData,
                headers: apiClient.defaults.headers
            });

            const response = await apiClient.post<ApiResponse<Post>>('/free-posts', postData);

            console.log('게시글 생성 API 응답:', response.data);
            return response.data.data;
        } catch (error: any) {
            console.error('게시글 생성 API 실패:', {
                error,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                data: error?.response?.data,
                config: error?.config
            });
            throw error;
        }
    },

    // 게시글 수정
    async updatePost(postId: number, postData: UpdatePostRequest): Promise<void> {
        try {
            await apiClient.put(`/free-posts/${postId}`, postData);
        } catch (error) {
            console.error('게시글 수정 실패:', error);
            throw error;
        }
    },

    // 게시글 삭제
    async deletePost(postId: number): Promise<void> {
        try {
            await apiClient.delete(`/free-posts/${postId}`);
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            throw error;
        }
    },

        // 댓글 목록 조회
    async getComments(stPrPostId: number) {
        const response = await apiClient.get<ApiResponse<Comment[]>>(
            `/comments/study-posts/${stPrPostId}`
        );
        return response.data.data;
    },

    // 댓글 작성
    async addComment(stPrPostId: number, studyProjectId: number, content: string) {
        const response = await apiClient.post<ApiResponse<Comment>>(
            `/api/comments/study-posts/${stPrPostId}`,
            { content, studyProjectId }
        );
        return response.data.data;
    },

    // 댓글 수정
    async updateComment(commentId: number, content: string) {
        const response = await apiClient.put<ApiResponse<Comment>>(
            `/api/comments/${commentId}?content=${encodeURIComponent(content)}`
        );
        return response.data.data;
    },

    // 댓글 삭제
    async deleteComment(commentId: number) {
        await apiClient.delete(`/api/comments/${commentId}`);
    },

    // 댓글 수 조회
    async getCommentCount(stPrPostId: number) {
        const response = await apiClient.get<ApiResponse<number>>(
            `/api/comments/study-posts/${stPrPostId}/count`
        );
        return response.data.data;
    },
};
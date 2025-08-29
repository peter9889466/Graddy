// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api';

// 공통 헤더 설정
const getHeaders = (): HeadersInit => {
    const token = localStorage.getItem('userToken');
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    // 토큰이 있을 때만 Authorization 헤더 추가
    if (token && token !== 'null' && token.trim() !== '') {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Authorization 헤더 추가됨:', `Bearer ${token.substring(0, 20)}...`);
    } else {
        // 임시: 토큰이 없을 때는 헤더를 포함하지 않음
        console.log('토큰이 없어서 Authorization 헤더를 포함하지 않습니다.');
        console.log('저장된 토큰:', token);
    }

    return headers;
};

// API 응답 타입
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
}

// 에러 응답 타입
export interface ApiError {
    success: false;
    message: string;
    error?: string;
    timestamp?: string;
}

// HTTP 메서드별 요청 함수
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        headers: getHeaders(),
        ...options,
    };

    console.log('API 요청 정보:', {
        url,
        method: options.method || 'GET',
        headers: config.headers,
        body: options.body
    });

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData: ApiError = await response.json().catch(() => ({
                success: false,
                message: `HTTP ${response.status}: ${response.statusText}`
            }));

            // JWT 만료 에러 처리
            if (errorData.message && errorData.message.includes('JWT expired')) {
                console.log('JWT 토큰이 만료되었습니다. 로그아웃 처리합니다.');
                // localStorage에서 토큰 제거
                localStorage.removeItem('userToken');
                // 로그인 페이지로 리다이렉트
                window.location.href = '/login';
                return;
            }

            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data: ApiResponse<T> = await response.json();
        return data;
    } catch (error) {
        console.error('API 요청 실패:', error);

        // JWT 만료 에러 처리 (catch 블록에서도)
        if (error instanceof Error && error.message.includes('JWT expired')) {
            console.log('JWT 토큰이 만료되었습니다. 로그아웃 처리합니다.');
            localStorage.removeItem('userToken');
            window.location.href = '/login';
            return;
        }

        throw error;
    }
};

// GET 요청
export const apiGet = <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { method: 'GET' });
};

// POST 요청
export const apiPost = <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

// PUT 요청
export const apiPut = <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
};

// DELETE 요청
export const apiDelete = <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
};

// PATCH 요청
export const apiPatch = <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return apiRequest<T>(endpoint, {
        method: 'PATCH',
        ...(data && { body: JSON.stringify(data) })
    });
};


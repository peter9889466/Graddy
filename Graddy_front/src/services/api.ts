import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 요청 인터셉터 - 토큰 추가
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token && token !== 'null' && token.trim() !== '') {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('토큰이 없어서 Authorization 헤더를 포함하지 않습니다.');
        }
        
        console.log('API 요청 정보:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 에러 처리
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        console.error('API 요청 실패:', error);
        if (error.response) {
            // 서버에서 응답이 왔지만 에러 상태인 경우
            const errorData = error.response.data as any;
            const errorMessage = errorData?.message || `HTTP ${error.response.status}`;
            throw new Error(errorMessage);
        } else if (error.request) {
            // 요청은 보냈지만 응답을 받지 못한 경우
            throw new Error('서버에 연결할 수 없습니다.');
        } else {
            // 요청 자체를 보내지 못한 경우
            throw new Error('요청을 보낼 수 없습니다.');
        }
    }
);

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
export const apiGet = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.get<ApiResponse<T>>(endpoint);
    return response.data;
};

export const apiPost = async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.post<ApiResponse<T>>(endpoint, data);
    return response.data;
};

export const apiPut = async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.put<ApiResponse<T>>(endpoint, data);
    return response.data;
};

export const apiDelete = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.delete<ApiResponse<T>>(endpoint);
    return response.data;
};

export const apiPatch = async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.patch<ApiResponse<T>>(endpoint, data);
    return response.data;
};


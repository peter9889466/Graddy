import axios, { AxiosResponse } from 'axios';

// API 기본 설정
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 - JWT 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken'); // AuthContext와 일치하도록 수정
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 시 로그인 페이지로 리다이렉트
            localStorage.removeItem('userToken'); // AuthContext와 일치하도록 수정
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API 응답 타입 정의
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
}

// API 함수들
export const apiGet = async <T = any>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.get(url, { params });
};

export const apiPost = async <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.post(url, data);
};

export const apiPut = async <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.put(url, data);
};

export const apiPatch = async <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.patch(url, data);
};

export const apiDelete = async <T = any>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.delete(url);
};

// 파일 업로드용 API 함수
export const apiPostFile = async <T = any>(url: string, formData: FormData): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.post(url, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default api;
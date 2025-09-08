import axios, { AxiosResponse } from 'axios';

// API 기본 설정
const API_BASE_URL = 'http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // CSRF 토큰 및 쿠키 전송을 위해 필수
    xsrfCookieName: 'XSRF-TOKEN', // Spring Boot의 기본 CSRF 쿠키 이름
    xsrfHeaderName: 'X-XSRF-TOKEN', // Spring Boot의 기본 CSRF 헤더 이름
});

// 요청 인터셉터 - JWT 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken'); // AuthContext와 일치하도록 수정
        console.log("🔍 [DEBUG] API 요청 인터셉터 - URL:", config.url);
        console.log("🔍 [DEBUG] API 요청 인터셉터 - 토큰 상태:", token ? "토큰 존재" : "토큰 없음");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("🔍 [DEBUG] API 요청 인터셉터 - Authorization 헤더 추가됨");
        } else {
            console.log("🔍 [DEBUG] API 요청 인터셉터 - 토큰이 없어서 Authorization 헤더 추가 안됨");
        }
        return config;
    },
    (error) => {
        console.error("🔍 [DEBUG] API 요청 인터셉터 에러:", error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
    (response) => {
        console.log("🔍 [DEBUG] API 응답 성공 - URL:", response.config.url, "Status:", response.status);
        return response;
    },
    (error) => {
        console.error("🔍 [DEBUG] API 응답 에러 - URL:", error.config?.url);
        console.error("🔍 [DEBUG] API 응답 에러 - Status:", error.response?.status);
        console.error("🔍 [DEBUG] API 응답 에러 - StatusText:", error.response?.statusText);
        console.error("🔍 [DEBUG] API 응답 에러 - Data:", error.response?.data);
        console.error("🔍 [DEBUG] API 응답 에러 - Headers:", error.response?.headers);
        
        if (error.response?.status === 401) {
            console.log("🔍 [DEBUG] 401 Unauthorized - 토큰 만료로 인한 로그인 페이지 리다이렉트");
            // 토큰 만료 시 로그인 페이지로 리다이렉트
            localStorage.removeItem('userToken'); // AuthContext와 일치하도록 수정
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            console.log("🔍 [DEBUG] 403 Forbidden - 권한 없음");
            console.log("🔍 [DEBUG] 403 오류 상세 정보:", {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data
            });
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
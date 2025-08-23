import axios from 'axios';

// Interests API만을 위한 axios 인스턴스 (JWT 토큰 없이)
const interestsAxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interest 데이터 타입 (백엔드 응답 구조에 맞춤)
export interface Interest {
    interestId: number;
    interestDivision: number;
    interestName: string;
}

// 프론트엔드에서 사용할 Interest 타입 (기존 호환성 유지)
export interface InterestForFrontend {
    id: number;
    name: string;
    category?: string;
}

// Interest 생성 요청 타입
export interface CreateInterestRequest {
    name: string;
    description?: string;
    category?: string;
}

// Interest 수정 요청 타입
export interface UpdateInterestRequest {
    name?: string;
    description?: string;
    category?: string;
}

// Interest API 서비스 클래스
export class InterestApiService {
    // 전체 관심사 목록 조회
    static async getAllInterests(): Promise<Interest[]> {
        try {
            const response = await interestsAxiosInstance.get<{status: number; message: string; data: Interest[]}>('/interests');
            
            // 응답 데이터 검증
            if (!response.data || !response.data.data) {
                console.warn('Interests API 응답 데이터가 없습니다.');
                return [];
            }
            
            // 데이터가 배열인지 확인
            if (!Array.isArray(response.data.data)) {
                console.warn('Interests API 응답이 배열이 아닙니다:', response.data.data);
                return [];
            }
            
            return response.data.data;
        } catch (error) {
            console.error('Interests API 호출 실패:', error);
            // 에러가 발생해도 빈 배열 반환하여 앱이 중단되지 않도록 함
            return [];
        }
    }

    // 특정 관심사 조회
    static async getInterest(interestId: number): Promise<Interest> {
        try {
            const response = await interestsAxiosInstance.get<{success: boolean; message: string; data: Interest}>(`/interests/${interestId}`);
            return response.data.data;
        } catch (error) {
            console.error('Interest 조회 실패:', error);
            throw error;
        }
    }

    // 카테고리별 관심사 목록 조회
    static async getInterestsByCategory(category: string): Promise<Interest[]> {
        try {
            const response = await interestsAxiosInstance.get<{success: boolean; message: string; data: Interest[]}>(`/interests/category/${category}`);
            return response.data.data;
        } catch (error) {
            console.error('카테고리별 interests 조회 실패:', error);
            throw error;
        }
    }

    // 관심사 검색
    static async searchInterests(keyword: string): Promise<Interest[]> {
        try {
            const response = await interestsAxiosInstance.get<{success: boolean; message: string; data: Interest[]}>(`/interests/search?keyword=${encodeURIComponent(keyword)}`);
            return response.data.data;
        } catch (error) {
            console.error('Interests 검색 실패:', error);
            throw error;
        }
    }

    // 관심사 생성 (관리자용 - 필요시 JWT 토큰 사용)
    static async createInterest(interestData: CreateInterestRequest): Promise<Interest> {
        try {
            const response = await interestsAxiosInstance.post<{success: boolean; message: string; data: Interest}>('/interests', interestData);
            return response.data.data;
        } catch (error) {
            console.error('Interest 생성 실패:', error);
            throw error;
        }
    }

    // 관심사 수정 (관리자용 - 필요시 JWT 토큰 사용)
    static async updateInterest(interestId: number, interestData: UpdateInterestRequest): Promise<Interest> {
        try {
            const response = await interestsAxiosInstance.put<{success: boolean; message: string; data: Interest}>(`/interests/${interestId}`, interestData);
            return response.data.data;
        } catch (error) {
            console.error('Interest 수정 실패:', error);
            throw error;
        }
    }

    // 관심사 삭제 (관리자용 - 필요시 JWT 토큰 사용)
    static async deleteInterest(interestId: number): Promise<string> {
        try {
            const response = await interestsAxiosInstance.delete<{success: boolean; message: string; data: string}>(`/interests/${interestId}`);
            return response.data.data;
        } catch (error) {
            console.error('Interest 삭제 실패:', error);
            throw error;
        }
    }
}

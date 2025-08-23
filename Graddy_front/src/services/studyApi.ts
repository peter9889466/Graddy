import { apiGet, apiPost, apiPut, apiDelete, apiPatch, ApiResponse } from './api';

// 백엔드 응답 구조에 맞는 스터디/프로젝트 데이터 타입
export interface BackendStudyProjectData {
    studyProjectId: number;
    studyProjectName: string;
    studyProjectTitle: string;
    studyProjectDesc: string;
    studyLevel: number;
    typeCheck: string;
    userId: string;
    isRecruiting: 'recruitment' | 'complete' | 'end'; // ENUM 값에 맞게 수정
    studyProjectStart: string;
    studyProjectEnd: string;
    studyProjectTotal: number;
    soltStart: string;
    soltEnd: string;
    createdAt: string;
    curText: string;
    tagNames: string[];
    availableDays: string[];
}

// 프론트엔드에서 사용할 스터디 데이터 타입 (기존 호환성 유지)
export interface StudyData {
    studyId: number;
    studyName: string;
    studyTitle: string;
    studyDesc: string;
    studyLevel: number;
    userId: string;
    studyStart: string;
    studyEnd: string;
    studyTotal: number;
    soltStart: string;
    soltEnd: string;
    isRecruiting: boolean;
    recruitmentStatus: '모집중' | '모집완료';
    type: '스터디' | '프로젝트';
    tags: Array<string | {name: string, difficulty?: string}>;
    leader: string;
    createdAt?: string;
    updatedAt?: string;
}

// 스터디 생성 요청 타입 (기존)
export interface CreateStudyRequest {
    studyName: string;
    studyTitle: string;
    studyDesc: string;
    studyLevel: number;
    userId: string;
    studyStart: string;
    studyEnd: string;
    studyTotal: number;
    soltStart: string;
    soltEnd: string;
    interestIds: number[];
}

// 새로운 스터디 프로젝트 생성 요청 타입 (백엔드 DTO와 일치)
export interface CreateStudyProjectRequest {
    studyProjectName: string;
    studyProjectTitle: string;
    studyProjectDesc: string;
    studyLevel: number;
    typeCheck: string; // "study" 또는 "project"
    userId?: string; // JWT 토큰에서 자동 추출되므로 선택적
    studyProjectStart: string; // ISO 8601 형식: "2025-08-22T11:27:56.603Z"
    studyProjectEnd: string; // ISO 8601 형식: "2025-08-22T11:27:56.603Z"
    studyProjectTotal: number;
    soltStart: string; // ISO 8601 형식: "2025-08-22T11:27:56.603Z"
    soltEnd: string; // ISO 8601 형식: "2025-08-22T11:27:56.603Z"
    interestIds: number[];
    dayIds: string[]; // 백엔드에서는 Byte[]이지만 프론트엔드에서는 string[]로 처리
}

// 스터디 수정 요청 타입
export interface UpdateStudyRequest {
    studyName?: string;
    studyTitle?: string;
    studyDesc?: string;
    studyLevel?: number;
    studyStart?: string;
    studyEnd?: string;
    studyTotal?: number;
    soltStart?: string;
    soltEnd?: string;
    interestIds?: number[];
}

// 스터디 API 서비스 클래스
export class StudyApiService {
    // 백엔드에서 스터디/프로젝트 목록 조회 (새로운 API)
    static async getStudiesProjects(): Promise<BackendStudyProjectData[]> {
        try {
            console.log('API 호출 시작: /studies-projects');
            
            // 직접 fetch를 사용하여 백엔드 응답 구조에 맞게 처리
            const response = await fetch('http://localhost:8080/api/studies-projects', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('HTTP 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log('백엔드 응답 데이터:', responseData);
            
            if (!responseData || !responseData.data) {
                console.warn('Studies-projects API data 필드가 없습니다. 전체 응답:', responseData);
                return [];
            }
            
            console.log('성공적으로 데이터 추출:', responseData.data);
            return responseData.data;
        } catch (error) {
            console.error('Studies-projects API 호출 실패:', error);
            console.error('에러 상세 정보:', error);
            return [];
        }
    }

    // 전체 스터디 목록 조회 (기존 - 호환성 유지)
    static async getAllStudies(): Promise<StudyData[]> {
        const response = await apiGet<StudyData[]>('/studies');
        return response.data;
    }

    // 특정 스터디 조회
    static async getStudy(studyId: number): Promise<StudyData> {
        const response = await apiGet<StudyData>(`/studies/${studyId}`);
        return response.data;
    }

    // 모집중인 스터디 목록 조회
    static async getRecruitingStudies(): Promise<StudyData[]> {
        const response = await apiGet<StudyData[]>('/studies/recruiting');
        return response.data;
    }

    // 스터디 검색
    static async searchStudies(keyword?: string): Promise<StudyData[]> {
        const endpoint = keyword ? `/studies/search?keyword=${encodeURIComponent(keyword)}` : '/studies/search';
        const response = await apiGet<StudyData[]>(endpoint);
        return response.data;
    }

    // 레벨별 스터디 목록 조회
    static async getStudiesByLevel(level: number): Promise<StudyData[]> {
        const response = await apiGet<StudyData[]>(`/studies/level/${level}`);
        return response.data;
    }

    // 사용자가 리더인 스터디 목록 조회
    static async getStudiesByLeader(userId: string): Promise<StudyData[]> {
        const response = await apiGet<StudyData[]>(`/studies/leader/${userId}`);
        return response.data;
    }

    // 스터디 생성 (기존)
    static async createStudy(studyData: CreateStudyRequest): Promise<StudyData> {
        const response = await apiPost<StudyData>('/studies', studyData);
        return response.data;
    }

    // 새로운 스터디 프로젝트 생성 (JWT 토큰 인증 포함)
    static async createStudyProject(studyProjectData: CreateStudyProjectRequest): Promise<any> {
        const response = await apiPost<any>('/studies-projects', studyProjectData);
        return response.data;
    }

    // 스터디 수정
    static async updateStudy(studyId: number, studyData: UpdateStudyRequest): Promise<StudyData> {
        const response = await apiPut<StudyData>(`/studies/${studyId}`, studyData);
        return response.data;
    }

    // 스터디 상태 변경
    static async updateStudyStatus(studyId: number, status: string): Promise<StudyData> {
        const response = await apiPatch<StudyData>(`/studies/${studyId}/status?status=${status}`);
        return response.data;
    }

    // 스터디 삭제
    static async deleteStudy(studyId: number): Promise<string> {
        const response = await apiDelete<string>(`/studies/${studyId}`);
        return response.data;
    }
}


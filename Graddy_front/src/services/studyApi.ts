import { apiGet, apiPost, apiPut, apiDelete, apiPatch, ApiResponse } from './api';

// 스터디 데이터 타입 정의
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

// 스터디 생성 요청 타입
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
    // 전체 스터디 목록 조회
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

    // 스터디 생성
    static async createStudy(studyData: CreateStudyRequest): Promise<StudyData> {
        const response = await apiPost<StudyData>('/studies', studyData);
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


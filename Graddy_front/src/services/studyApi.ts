import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './api';

// 백엔드에서 오는 스터디/프로젝트 데이터 타입 (정확한 백엔드 응답 구조와 일치)
export interface BackendStudyProjectData {
    studyProjectId: number;
    studyProjectName: string;
    studyProjectTitle: string;
    studyProjectDesc: string;
    studyLevel: number;
    typeCheck: string;
    userId: string;
    isRecruiting: 'recruitment' | 'complete' | 'end';
    studyProjectStart: string;
    studyProjectEnd: string;
    studyProjectTotal: number;
    soltStart: string;
    soltEnd: string;
    createdAt: string;
    curText: string | null;
    gitUrl: string | null;  // 추가
    tagNames: string[];
    availableDays: number[];  // string[]에서 number[]로 변경
    currentMemberCount: number;  // 추가
    members?: Array<{
        memberId: number;
        userId: string;
        nick: string;
        memberType: string;
        memberStatus: string;
        joinedAt: string;
    }>;
    userParticipationStatus: string;  // 추가
    applicationStatus: string | null;  // 추가
    applicationDate: string | null;  // 추가
    studyStatus: string;  // 추가
    studyProjectStatus?: {  // 추가
        userId: string;
        studyProjectId: number;
        status: string;
        joinedAt: string;
    };
}

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
    tags: Array<string | { name: string, difficulty?: string }>;
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
    // 전체 스터디 목록 조회
    static async getAllStudies(): Promise<StudyData[]> {
        const response = await apiGet<StudyData[]>('/studies');
        return response.data.data;
    }

    // 특정 스터디 조회
    static async getStudy(studyId: number): Promise<StudyData> {
        const response = await apiGet<StudyData>(`/studies/${studyId}`);
        return response.data.data;
    }

    // 모집중인 스터디 목록 조회
    static async getRecruitingStudies(): Promise<StudyData[]> {
        const response = await apiGet<StudyData[]>('/studies/recruiting');
        return response.data.data;
    }

    // 스터디 검색
    static async searchStudies(keyword?: string): Promise<StudyData[]> {
        const endpoint = keyword ? `/studies/search?keyword=${encodeURIComponent(keyword)}` : '/studies/search';
        const response = await apiGet<StudyData[]>(endpoint);
        return response.data.data;
    }

    // 레벨별 스터디 목록 조회
    static async getStudiesByLevel(level: number): Promise<StudyData[]> {
        const response = await apiGet<StudyData[]>(`/studies/level/${level}`);
        return response.data.data;
    }

    // 사용자가 리더인 스터디 목록 조회
    static async getStudiesByLeader(userId: string): Promise<StudyData[]> {
        const response = await apiGet<StudyData[]>(`/studies/leader/${userId}`);
        return response.data.data;
    }

    // 스터디 생성 (기존)
    static async createStudy(studyData: CreateStudyRequest): Promise<StudyData> {
        const response = await apiPost<StudyData>('/studies', studyData);
        return response.data.data;
    }

    // 새로운 스터디 프로젝트 생성 (JWT 토큰 인증 포함)
    static async createStudyProject(studyProjectData: CreateStudyProjectRequest): Promise<any> {
        const response = await apiPost<any>('/studies-projects', studyProjectData);
        return response.data.data;
    }

    // 스터디/프로젝트 목록 조회 (백엔드 API와 직접 통신)
    static async getStudiesProjects(): Promise<BackendStudyProjectData[]> {
        try {
            console.log('getStudiesProjects 호출 시작');

            const response = await fetch('/api/studies-projects', {
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
            console.log('getStudiesProjects 응답:', responseData);

            if (!responseData || !responseData.data) {
                console.warn('getStudiesProjects API data 필드가 없습니다.');
                return [];
            }

            return responseData.data;
        } catch (error) {
            console.error('getStudiesProjects 실패:', error);
            throw error;
        }
    }

    // 특정 스터디/프로젝트 조회
    static async getStudyProject(studyProjectId: number): Promise<BackendStudyProjectData | null> {
        try {
            console.log('getStudyProject 호출 시작:', studyProjectId);

            // apiGet을 사용하여 인증 헤더 자동 포함
            const response = await apiGet<BackendStudyProjectData>(`/studies-projects/${studyProjectId}`);
            console.log('getStudyProject 응답:', response);

            if (!response || !response.data || !response.data.data) {
                console.warn('getStudyProject API data 필드가 없습니다.');
                return null;
            }

            return response.data.data;
        } catch (error) {
            console.error('getStudyProject 실패:', error);
            return null;
        }
    }

    // 스터디 수정
    static async updateStudy(studyId: number, studyData: UpdateStudyRequest): Promise<StudyData> {
        const response = await apiPut<StudyData>(`/studies/${studyId}`, studyData);
        return response.data.data;
    }

    // 스터디 상태 변경
    static async updateStudyStatus(studyId: number, status: string): Promise<StudyData> {
        const response = await apiPatch<StudyData>(`/studies/${studyId}/status?status=${status}`);
        return response.data.data;
    }

    // 스터디 삭제
    static async deleteStudy(studyId: number): Promise<string> {
        const response = await apiDelete<string>(`/studies/${studyId}`);
        return response.data.data;
    }

    // 스터디/프로젝트 수정
    static async updateStudyProject(studyProjectId: number, updateData: any): Promise<any> {
        try {
            console.log('updateStudyProject 호출 시작:', studyProjectId);

            const response = await apiPut<any>(`/studies-projects/${studyProjectId}`, updateData);
            console.log('updateStudyProject 응답:', response);

            return response.data.data;
        } catch (error) {
            console.error('updateStudyProject 실패:', error);
            throw error;
        }
    }

    // 스터디/프로젝트 상태 변경 (모집 마감/재시작/종료)
    static async updateStudyProjectStatus(studyProjectId: number, status: string): Promise<BackendStudyProjectData> {
        try {
            console.log('updateStudyProjectStatus 호출 시작:', { studyProjectId, status });

            // body가 아닌 쿼리 파라미터로 status 전달
            const response = await apiPatch<BackendStudyProjectData>(`/studies-projects/${studyProjectId}/status?status=${status}`);
            console.log('updateStudyProjectStatus 응답:', response);

            return response.data.data;
        } catch (error) {
            console.error('updateStudyProjectStatus 실패:', error);
            throw error;
        }
    }
}

// 가입 신청 관련 타입 정의
export interface StudyApplicationRequest {
    studyProjectId: number;
    message: string;
}

export interface StudyApplicationResponse {
    userId: string;
    studyProjectId: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    message: string;
    appliedAt: string;
}

export interface ProcessApplicationRequest {
    userId: string;
    status: 'APPROVED' | 'REJECTED';  // 백엔드 API와 일치
    reason?: string;
}

// 가입 신청 API
export const applyToStudyProject = async (request: StudyApplicationRequest): Promise<StudyApplicationResponse> => {
    const response = await apiPost<StudyApplicationResponse>('/study-applications/apply', request);
    return response.data.data;
};

// 가입 신청 목록 조회 API
export const getStudyApplications = async (studyProjectId: number): Promise<StudyApplicationResponse[]> => {
    const response = await apiGet<StudyApplicationResponse[]>(`/study-applications/${studyProjectId}/applications`);
    return response.data.data;
};

// 가입 신청 처리 API (승인/거절)
export const processStudyApplication = async (
    studyProjectId: number,
    request: ProcessApplicationRequest
): Promise<string> => {
    const response = await apiPut<string>(`/study-applications/${studyProjectId}/process`, request);
    return response.data.data;
};

// 사용자의 가입 신청 상태 조회 API
export const getUserApplicationStatus = async (studyProjectId: number): Promise<StudyApplicationResponse | null> => {
    try {
        // 내 신청 목록을 가져와서 해당 스터디/프로젝트의 신청 상태를 찾기
        const response = await apiGet<StudyApplicationResponse[]>('/study-applications/my-applications');
        const myApplications = response.data.data;

        // 해당 스터디/프로젝트의 신청을 찾기
        const application = myApplications.find((app: StudyApplicationResponse) => app.studyProjectId === studyProjectId);

        return application || null;
    } catch (error) {
        // 가입 신청이 없는 경우 404 에러가 발생할 수 있음
        return null;
    }
};

// 커리큘럼 텍스트 업데이트 함수
export const updateCurriculumText = async (studyProjectId: number, curText: string): Promise<void> => {
    try {
        console.log('🔍 [DEBUG] updateCurriculumText 호출:', {
            studyProjectId,
            curText: curText.substring(0, 100) + '...', // 텍스트가 길 수 있으므로 일부만 로그
            requestData: { curText }
        });
        
        const response = await apiPatch(`/studies-projects/${studyProjectId}/curriculum`, { curText });
        console.log('✅ [DEBUG] updateCurriculumText 성공:', response);
        
        // void 반환 타입에 맞게 수정
        return;
    } catch (error) {
        console.error('❌ [DEBUG] updateCurriculumText 실패:', error);
        throw error;
    }
};

// 게시글 작성
export const createPost = async (data: {
    studyProjectId: number;
    memberId: string;
    title: string;
    content: string;
}) => {
    return apiPost("/posts", data);  // http://localhost:8080/api/posts 호출
};

// 신청 취소
export const cancelStudyApplication = async (studyProjectId: number): Promise<any> => {
    const response = await apiDelete<any>(`/study-applications/${studyProjectId}/cancel`);
    return response.data.data;
};

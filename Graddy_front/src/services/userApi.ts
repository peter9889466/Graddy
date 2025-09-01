import { apiGet, apiPut, apiDelete, ApiResponse } from './api';

// 사용자 관심분야 타입
export interface UserInterest {
    interestId: number;
    interestName: string;
    interestLevel: string;
}

// 마이페이지 응답 타입
export interface MyPageResponse {
    nickname: string;
    githubUrl?: string;
    userScore: number;
    interests: UserInterest[];
    recommenderNickname?: string;
}

// 회원정보 수정 페이지 데이터 타입
export interface UpdatePageInfo {
    name: string;
    userId: string;
    tel: string;
    nickname: string;
}

// 회원정보 수정 요청 타입
export interface UserProfileUpdateRequest {
    newPassword?: string;
    newNickname?: string;
    newTel?: string;
}

// 회원정보 수정 응답 타입
export interface UserProfileUpdateResponse {
    message: string;
    updatedFields: Record<string, string>;
}

// 관심분야 수정 요청 타입
export interface UserInterestsUpdateRequest {
    interests: Array<{
        interestId: number;
        interestLevel: string;
    }>;
}

// 스터디/프로젝트 목록 응답 타입
export interface StudyProjectListResponse {
    studyProjectId: number;
    studyProjectName: string;
    studyProjectTitle: string;
    studyProjectStatus: string;
    studyProjectType: string;
    studyProjectStartDate: string;
    studyProjectEndDate: string;
    memberRole: string;
    memberStatus: string;
}

// 마이페이지 정보 조회
export const getMyPageInfo = (): Promise<ApiResponse<MyPageResponse>> => {
    return apiGet<MyPageResponse>('/me');
};

// 회원정보 수정 페이지 데이터 조회
export const getUpdatePageInfo = (): Promise<ApiResponse<UpdatePageInfo>> => {
    return apiGet<UpdatePageInfo>('/me/update');
};

// 회원정보 수정
export const updateUserProfile = (data: UserProfileUpdateRequest): Promise<ApiResponse<UserProfileUpdateResponse>> => {
    return apiPut<UserProfileUpdateResponse>('/me/profile', data);
};

// 관심분야 수정
export const updateUserInterests = (data: UserInterestsUpdateRequest): Promise<ApiResponse<{ interests: UserInterest[] }>> => {
    return apiPut<{ interests: UserInterest[] }>('/me/interests', data);
};

// 회원탈퇴
export const withdrawUser = (): Promise<ApiResponse<{ message: string; deletedUserId: string; note: string }>> => {
    return apiDelete<{ message: string; deletedUserId: string; note: string }>('/me/withdraw');
};

// 스터디/프로젝트 목록 조회
export const getStudyProjectList = (status: string = 'ALL'): Promise<ApiResponse<StudyProjectListResponse[]>> => {
    return apiGet<StudyProjectListResponse[]>(`/me/study-projects?status=${status}`);
};
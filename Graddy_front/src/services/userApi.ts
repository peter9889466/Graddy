import { apiGet, apiPut, apiDelete, ApiResponse } from './api';
import { AxiosResponse } from 'axios';

// 사용자 관심분야 타입
export interface UserInterest {
    interestId: number;
    interestName: string;
    interestLevel: string;
    interestDivision: number;
}

// 마이페이지 응답 타입 (백엔드 응답 구조에 맞게 수정)
export interface MyPageResponse {
    nick: string; // 백엔드에서 nick 필드 사용
    gitUrl?: string; // 백엔드에서 gitUrl 필드 사용
    userScore: number;
    interests: string[]; // 백엔드에서 문자열 배열로 반환
    userRefer?: string; // 백엔드에서 userRefer 필드 사용
}

// 회원정보 수정 페이지 데이터 타입 (백엔드 응답 구조에 맞게 수정)
export interface UpdatePageInfo {
    name: string;
    userId: string;
    tel: string;
    nick: string; // 백엔드에서 nick 필드 사용
    availableDays: string[];
    availableTime: string;
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
        interestLevel: number;
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
export const getMyPageInfo = (): Promise<AxiosResponse<ApiResponse<MyPageResponse>>> => {
    return apiGet<MyPageResponse>('/me');
};

// 회원정보 수정 페이지 데이터 조회
export const getUpdatePageInfo = (): Promise<AxiosResponse<ApiResponse<UpdatePageInfo>>> => {
    return apiGet<UpdatePageInfo>('/me/update');
};

// 관심분야 전체 목록 조회 (userApi.ts로 통합)
export const getAllInterests = (): Promise<AxiosResponse<ApiResponse<UserInterest[]>>> => {
    return apiGet<UserInterest[]>('/interests');
};

// 회원정보 수정

// 회원정보 수정
export const updateUserProfile = (data: UserProfileUpdateRequest): Promise<AxiosResponse<ApiResponse<UserProfileUpdateResponse>>> => {
    return apiPut<UserProfileUpdateResponse>('/me/profile', data);
};

// 관심분야 수정
export const updateUserInterests = (data: UserInterestsUpdateRequest): Promise<AxiosResponse<ApiResponse<{ interests: UserInterest[] }>>> => {
    return apiPut<{ interests: UserInterest[] }>('/me/interests', data);
};

// 회원탈퇴
export const withdrawUser = (): Promise<AxiosResponse<ApiResponse<{ message: string; deletedUserId: string; note: string }>>> => {
    return apiDelete<{ message: string; deletedUserId: string; note: string }>('/me/withdraw');
};

// 스터디/프로젝트 목록 조회
export const getStudyProjectList = (status: string = 'ALL'): Promise<AxiosResponse<ApiResponse<StudyProjectListResponse[]>>> => {
    return apiGet<StudyProjectListResponse[]>(`/me/study-projects?status=${status}`);
};

// Git 정보 수정 요청 타입
export interface UserGitInfoUpdateRequest {
    gitUrl?: string;
    userRefer?: string;
}

// Git 정보 수정 응답 타입
export interface UserGitInfoUpdateResponse {
    message: string;
    updatedFields: Record<string, string>;
}

// Git 정보 수정
export const updateUserGitInfo = (data: UserGitInfoUpdateRequest): Promise<AxiosResponse<ApiResponse<UserGitInfoUpdateResponse>>> => {
    return apiPut<UserGitInfoUpdateResponse>('/me/git-info', data);
};
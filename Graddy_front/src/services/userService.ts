import { apiGet, apiPost, apiPut, apiPostFile } from './api';

// 사용자 정보 관련 타입 정의
export interface UserProfile {
    userId: string;
    nickname: string;
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
    githubUrl?: string;
    introduction?: string;
}

export interface UserScore {
    userId: string;
    score: number;
    rank?: number;
}

export interface StudyProjectListItem {
    allStudies: {
        studyProjectId: number;
        studyProjectName: string;
        studyProjectTitle: string;
        studyProjectDesc: string;
        studyLevel: number;
        typeCheck: 'STUDY' | 'PROJECT';
        userId: string;
        isRecruiting: 'RECRUITING' | 'COMPLETE' | 'END';
        studyProjectStart: string;
        studyProjectEnd: string;
        studyProjectTotal: number;
        currentMemberCount: number;
        tagNames: string[];
        members: string[];
    }[];
}

export interface Interest {
    interestId: number;
    interestName: string;
    interestDivision: number;
}

export interface UserInterest {
    id: number;
    name: string;
    category: string;
    difficulty: string;
}

// 사용자 프로필 조회
export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await apiGet('/me');
    return response.data.data;
};

// 사용자 프로필 수정
export const updateUserProfile = async (profileData: UserProfile): Promise<UserProfile> => {
    const response = await apiPut('/me/profile', profileData);
    return response.data.data;
};

// 사용자 점수 조회
export const getUserScore = async (userId: string): Promise<UserScore> => {
    const response = await apiGet(`/scores/user/${userId}`);
    return response.data.data;
};

// 사용자 스터디/프로젝트 목록 조회
export const getUserStudyProjects = async (status: 'ALL' | 'RECRUITING' | 'COMPLETE' | 'END' = 'ALL'): Promise<StudyProjectListItem[]> => {
    const response = await apiGet('/studies-projects/my-dashboard', { status });
    console.log('스터디 리스트 ', response.data.data.allStudies);
    return response.data.data.allStudies;
};

// 관심분야 전체 목록 조회
export const getAllInterests = async (): Promise<Interest[]> => {
    const response = await apiGet('/interests');
    return response.data.data;
};

// 사용자 관심분야 조회
export const getUserInterests = async (): Promise<UserInterest[]> => {
    const response = await apiGet('/me/interests');
    return response.data.data;
};

// 사용자 관심분야 수정
export const updateUserInterests = async (interests: UserInterest[]): Promise<void> => {
    await apiPut('/me/interests', { interests });
};

// 사용자 소개글 수정
export const updateUserIntroduction = async (introduction: string): Promise<void> => {
    await apiPut('/me/introduction', { introduction });
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiPostFile('/me/profile-image', formData);
    return response.data.data.imageUrl;
};

// GitHub URL 수정
export const updateGithubUrl = async (githubUrl: string): Promise<void> => {
    await apiPut('/me/git-info', { githubUrl });
}

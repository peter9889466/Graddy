import { apiGet, apiPost, apiPut, apiDelete } from './api';

// 스터디 관련 타입 정의
export interface StudyProject {
    studyProjectId: number;
    title: string;
    description: string;
    leader: string;
    startDate: string;
    endDate: string;
    status: 'RECRUITING' | 'COMPLETE' | 'END';
    type: 'STUDY' | 'PROJECT';
    currentMembers: number;
    maxMembers: number;
    tags: string[];
    meetingDays?: string[];
    meetingTime?: string;
}

export interface StudyCreateRequest {
    title: string;
    description: string;
    type: 'STUDY' | 'PROJECT';
    maxMembers: number;
    startDate: string;
    endDate: string;
    tags: string[];
    meetingDays?: string[];
    meetingTime?: string;
}

// 스터디/프로젝트 생성
export const createStudyProject = async (studyData: StudyCreateRequest): Promise<StudyProject> => {
    const response = await apiPost('/studies', studyData);
    return response.data.data;
};

// 스터디/프로젝트 상세 조회
export const getStudyProject = async (studyProjectId: number): Promise<StudyProject> => {
    const response = await apiGet(`/studies/${studyProjectId}`);
    return response.data.data;
};

// 스터디/프로젝트 수정
export const updateStudyProject = async (studyProjectId: number, studyData: Partial<StudyCreateRequest>): Promise<StudyProject> => {
    const response = await apiPut(`/studies/${studyProjectId}`, studyData);
    return response.data.data;
};

// 스터디/프로젝트 삭제
export const deleteStudyProject = async (studyProjectId: number): Promise<void> => {
    await apiDelete(`/studies/${studyProjectId}`);
};

// 스터디/프로젝트 신청
export const applyToStudyProject = async (studyProjectId: number): Promise<void> => {
    await apiPost(`/studies/${studyProjectId}/apply`);
};

// 스터디/프로젝트 신청 취소
export const cancelStudyApplication = async (studyProjectId: number): Promise<void> => {
    await apiDelete(`/studies/${studyProjectId}/apply`);
};
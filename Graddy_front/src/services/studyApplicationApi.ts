// 스터디 가입 신청 API 서비스
import axios from 'axios';

// 가입 신청 데이터 타입 정의
export interface StudyApplication {
    applicationId: number;
    studyProjectId: number;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: string;
    processedAt?: string;
}

// 백엔드 응답 타입
export interface StudyApplicationResponse {
    status: number;
    message: string;
    data: StudyApplication | StudyApplication[];
}

// 스터디 가입 신청 API 서비스 클래스
export class StudyApplicationApiService {
    private static baseURL = 'http://localhost:8080/api';

    // 특정 스터디/프로젝트에 대한 사용자의 가입 신청 상태 조회
    static async getApplicationStatus(studyProjectId: number, userId: string): Promise<StudyApplication | null> {
        try {
            console.log('가입 신청 상태 조회 시작:', { studyProjectId, userId });
            const response = await fetch(`${this.baseURL}/study-applications/status?studyProjectId=${studyProjectId}&userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('HTTP 응답 상태:', response.status);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('가입 신청 내역이 없습니다.');
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('백엔드 응답 데이터:', responseData);

            if (!responseData || !responseData.data) {
                console.warn('가입 신청 API data 필드가 없습니다. 전체 응답:', responseData);
                return null;
            }

            console.log('성공적으로 가입 신청 상태 추출:', responseData.data);
            return responseData.data;
        } catch (error) {
            console.error('가입 신청 상태 조회 실패:', error);
            console.error('에러 상세 정보:', error);
            return null;
        }
    }

    // 스터디/프로젝트 가입 신청
    static async applyForStudy(studyProjectId: number, userId: string): Promise<StudyApplication | null> {
        try {
            console.log('스터디 가입 신청 시작:', { studyProjectId, userId });
            const response = await fetch(`${this.baseURL}/study-applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studyProjectId,
                    userId,
                    status: 'pending'
                })
            });

            console.log('HTTP 응답 상태:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('백엔드 응답 데이터:', responseData);

            if (!responseData || !responseData.data) {
                console.warn('가입 신청 API data 필드가 없습니다. 전체 응답:', responseData);
                return null;
            }

            console.log('성공적으로 가입 신청 완료:', responseData.data);
            return responseData.data;
        } catch (error) {
            console.error('스터디 가입 신청 실패:', error);
            console.error('에러 상세 정보:', error);
            return null;
        }
    }

    // 가입 신청 취소
    static async cancelApplication(applicationId: number): Promise<boolean> {
        try {
            console.log('가입 신청 취소 시작:', applicationId);
            const response = await fetch(`${this.baseURL}/study-applications/${applicationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('HTTP 응답 상태:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('성공적으로 가입 신청 취소 완료');
            return true;
        } catch (error) {
            console.error('가입 신청 취소 실패:', error);
            console.error('에러 상세 정보:', error);
            return false;
        }
    }

    // 스터디장이 가입 신청 승인/거절
    static async processApplication(applicationId: number, status: 'approved' | 'rejected'): Promise<StudyApplication | null> {
        try {
            console.log('가입 신청 처리 시작:', { applicationId, status });
            const response = await fetch(`${this.baseURL}/study-applications/${applicationId}/process`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status,
                    processedAt: new Date().toISOString()
                })
            });

            console.log('HTTP 응답 상태:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('백엔드 응답 데이터:', responseData);

            if (!responseData || !responseData.data) {
                console.warn('가입 신청 처리 API data 필드가 없습니다. 전체 응답:', responseData);
                return null;
            }

            console.log('성공적으로 가입 신청 처리 완료:', responseData.data);
            return responseData.data;
        } catch (error) {
            console.error('가입 신청 처리 실패:', error);
            console.error('에러 상세 정보:', error);
            return null;
        }
    }

    // 특정 스터디/프로젝트의 모든 가입 신청 목록 조회 (스터디장용)
    static async getApplicationsByStudy(studyProjectId: number): Promise<StudyApplication[]> {
        try {
            console.log('스터디 가입 신청 목록 조회 시작:', studyProjectId);
            const response = await fetch(`${this.baseURL}/study-applications/study/${studyProjectId}`, {
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
                console.warn('가입 신청 목록 API data 필드가 없습니다. 전체 응답:', responseData);
                return [];
            }

            console.log('성공적으로 가입 신청 목록 추출:', responseData.data);
            return responseData.data;
        } catch (error) {
            console.error('가입 신청 목록 조회 실패:', error);
            console.error('에러 상세 정보:', error);
            return [];
        }
    }
}

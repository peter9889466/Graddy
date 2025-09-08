// 사용되지 않는 import 제거됨

// 스터디 가입 신청 데이터 타입
export interface StudyApplication {
    applicationId: number;
    studyProjectId: number;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: string;
    processedAt?: string;
}

// API 응답 타입
export interface StudyApplicationResponse {
    status: number;
    message: string;
    data: StudyApplication;
}

// 스터디 가입 신청 API 서비스
export class StudyApplicationApiService {
    // 특정 사용자의 가입 신청 상태 조회
    static async getApplicationStatus(studyProjectId: number, userId: string): Promise<StudyApplication | null> {
        try {
            console.log('가입 신청 상태 조회 시작:', { studyProjectId, userId });

            const response = await fetch(`/api/study-applications/status?studyProjectId=${studyProjectId}&userId=${encodeURIComponent(userId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
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
            console.log('가입 신청 상태 응답:', responseData);

            if (!responseData || !responseData.data) {
                console.warn('가입 신청 상태 API data 필드가 없습니다.');
                return null;
            }

            return responseData.data;
        } catch (error) {
            console.error('가입 신청 상태 조회 실패:', error);
            return null;
        }
    }

    // 스터디 가입 신청
    static async applyForStudy(studyProjectId: number, userId: string): Promise<StudyApplication | null> {
        try {
            console.log('스터디 가입 신청 시작:', { studyProjectId, userId });

            const response = await fetch('/api/study-applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({
                    studyProjectId,
                    userId
                })
            });

            console.log('HTTP 응답 상태:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('가입 신청 응답:', responseData);

            if (!responseData || !responseData.data) {
                console.warn('가입 신청 API data 필드가 없습니다.');
                return null;
            }

            return responseData.data;
        } catch (error) {
            console.error('가입 신청 실패:', error);
            return null;
        }
    }

    // 가입 신청 취소
    static async cancelApplication(applicationId: number): Promise<boolean> {
        try {
            console.log('가입 신청 취소 시작:', applicationId);

            const response = await fetch(`/api/study-applications/${applicationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });

            console.log('HTTP 응답 상태:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('가입 신청 취소 실패:', error);
            return false;
        }
    }

    // 가입 신청 처리 (승인/거절) - 스터디장/프로젝트장만 가능
    static async processApplication(applicationId: number, status: 'approved' | 'rejected'): Promise<boolean> {
        try {
            console.log('가입 신청 처리 시작:', { applicationId, status });

            const response = await fetch(`/api/study-applications/${applicationId}/process`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
                body: JSON.stringify({ status })
            });

            console.log('HTTP 응답 상태:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('가입 신청 처리 실패:', error);
            return false;
        }
    }

    // 특정 스터디/프로젝트의 모든 가입 신청 조회 - 스터디장/프로젝트장만 가능
    static async getApplicationsByStudy(studyProjectId: number): Promise<StudyApplication[]> {
        try {
            console.log('스터디 가입 신청 목록 조회 시작:', studyProjectId);

            const response = await fetch(`/api/study-applications/study/${studyProjectId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });

            console.log('HTTP 응답 상태:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('가입 신청 목록 응답:', responseData);

            if (!responseData || !responseData.data) {
                console.warn('가입 신청 목록 API data 필드가 없습니다.');
                return [];
            }

            return responseData.data;
        } catch (error) {
            console.error('가입 신청 목록 조회 실패:', error);
            return [];
        }
    }
}




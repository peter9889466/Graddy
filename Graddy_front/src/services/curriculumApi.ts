import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from './api';

// 커리큘럼 데이터 타입
export interface CurriculumData {
    curriculumId: number;
    studyProjectId: number;
    title: string;
    content: string;
    week: number;
    order: number;
    createdAt: string;
    updatedAt: string;
}

// API 응답 타입
export interface CurriculumResponse {
    status: number;
    message: string;
    data: CurriculumData | CurriculumData[];
}

// 커리큘럼 API 서비스
export class CurriculumApiService {
    // 특정 스터디/프로젝트의 커리큘럼 조회
    static async getCurriculumByStudyProject(studyProjectId: number): Promise<CurriculumData[]> {
        try {
            console.log('커리큘럼 조회 시작:', studyProjectId);
            
            // 먼저 스터디/프로젝트 상세 정보에서 curText 가져오기 시도
            const studyResponse = await fetch(`http://localhost:8080/api/studies-projects/${studyProjectId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (studyResponse.ok) {
                const studyData = await studyResponse.json();
                if (studyData.data && studyData.data.curText) {
                    console.log('curText에서 커리큘럼 데이터 발견:', studyData.data.curText);
                    // curText가 있으면 간단한 커리큘럼 객체로 변환
                    return [{
                        curriculumId: 0,
                        studyProjectId: studyProjectId,
                        title: '커리큘럼',
                        content: studyData.data.curText,
                        week: 1,
                        order: 1,
                        createdAt: studyData.data.createdAt || new Date().toISOString(),
                        updatedAt: studyData.data.createdAt || new Date().toISOString()
                    }];
                }
            }
            
            // curText가 없으면 전용 커리큘럼 API 호출
            const response = await fetch(`http://localhost:8080/api/curriculum/study-project/${studyProjectId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('HTTP 응답 상태:', response.status);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('커리큘럼 데이터가 없습니다.');
                    return [];
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log('커리큘럼 응답:', responseData);
            
            if (!responseData || !responseData.data) {
                console.warn('커리큘럼 API data 필드가 없습니다.');
                return [];
            }
            
            return Array.isArray(responseData.data) ? responseData.data : [responseData.data];
        } catch (error) {
            console.error('커리큘럼 조회 실패:', error);
            return [];
        }
    }

    // 커리큘럼 생성
    static async createCurriculum(curriculumData: Omit<CurriculumData, 'curriculumId' | 'createdAt' | 'updatedAt'>): Promise<CurriculumData | null> {
        try {
            console.log('커리큘럼 생성 시작:', curriculumData);
            
            const response = await fetch('http://localhost:8080/api/curriculum', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(curriculumData)
            });
            
            console.log('HTTP 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log('커리큘럼 생성 응답:', responseData);
            
            if (!responseData || !responseData.data) {
                console.warn('커리큘럼 생성 API data 필드가 없습니다.');
                return null;
            }
            
            return responseData.data;
        } catch (error) {
            console.error('커리큘럼 생성 실패:', error);
            return null;
        }
    }

    // 커리큘럼 수정
    static async updateCurriculum(curriculumId: number, curriculumData: Partial<CurriculumData>): Promise<CurriculumData | null> {
        try {
            console.log('커리큘럼 수정 시작:', { curriculumId, curriculumData });
            
            const response = await fetch(`http://localhost:8080/api/curriculum/${curriculumId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(curriculumData)
            });
            
            console.log('HTTP 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseData = await response.json();
            console.log('커리큘럼 수정 응답:', responseData);
            
            if (!responseData || !responseData.data) {
                console.warn('커리큘럼 수정 API data 필드가 없습니다.');
                return null;
            }
            
            return responseData.data;
        } catch (error) {
            console.error('커리큘럼 수정 실패:', error);
            return null;
        }
    }

    // 커리큘럼 삭제
    static async deleteCurriculum(curriculumId: number): Promise<boolean> {
        try {
            console.log('커리큘럼 삭제 시작:', curriculumId);
            
            const response = await fetch(`http://localhost:8080/api/curriculum/${curriculumId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            console.log('HTTP 응답 상태:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return true;
        } catch (error) {
            console.error('커리큘럼 삭제 실패:', error);
            return false;
        }
    }
}

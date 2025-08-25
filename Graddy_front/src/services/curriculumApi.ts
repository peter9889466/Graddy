// 커리큘럼 API 서비스
import axios from 'axios';

// 커리큘럼 데이터 타입 정의
export interface CurriculumData {
    curriculumId: number;
    studyProjectId: number;
    week: number;
    title: string;
    status: 'completed' | 'in-progress' | 'upcoming';
    topics: string[];
    materials: string[];
    assignments: string[];
    createdAt: string;
    updatedAt: string;
}

// 백엔드 응답 타입
export interface CurriculumResponse {
    status: number;
    message: string;
    data: CurriculumData[];
}

// 커리큘럼 API 서비스 클래스
export class CurriculumApiService {
    private static baseURL = 'http://localhost:8080/api';

    // 특정 스터디/프로젝트의 커리큘럼 목록 조회
    static async getCurriculumByStudyProject(studyProjectId: number): Promise<CurriculumData[]> {
        try {
            console.log('커리큘럼 API 호출 시작:', studyProjectId);
            
            // 먼저 스터디/프로젝트 정보를 가져와서 커리큘럼 텍스트 확인
            const studyResponse = await fetch(`${this.baseURL}/studies-projects/${studyProjectId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (studyResponse.ok) {
                const studyData = await studyResponse.json();
                console.log('스터디/프로젝트 데이터:', studyData);
                
                // 커리큘럼 텍스트가 있는 경우 (curText 필드 사용)
                if (studyData.data && studyData.data.curText) {
                    const curriculumData: CurriculumData = {
                        curriculumId: 1,
                        studyProjectId: studyProjectId,
                        week: 1,
                        title: "커리큘럼",
                        status: "in-progress",
                        topics: [studyData.data.curText],
                        materials: [],
                        assignments: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    console.log('커리큘럼 텍스트 데이터 생성 (curText):', curriculumData);
                    return [curriculumData];
                }
            }

            // 기존 커리큘럼 API 시도
            const response = await fetch(`${this.baseURL}/curriculum/study-project/${studyProjectId}`, {
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
                console.warn('커리큘럼 API data 필드가 없습니다. 전체 응답:', responseData);
                return [];
            }

            // null 값 필터링
            const filteredData = responseData.data.filter((item: any) => item !== null);
            console.log('성공적으로 커리큘럼 데이터 추출:', filteredData);
            return filteredData;
        } catch (error) {
            console.error('커리큘럼 API 호출 실패:', error);
            console.error('에러 상세 정보:', error);
            return [];
        }
    }

    // 커리큘럼 생성
    static async createCurriculum(curriculumData: Omit<CurriculumData, 'curriculumId' | 'createdAt' | 'updatedAt'>): Promise<CurriculumData | null> {
        try {
            const response = await fetch(`${this.baseURL}/curriculum`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(curriculumData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            return responseData.data;
        } catch (error) {
            console.error('커리큘럼 생성 실패:', error);
            return null;
        }
    }

    // 커리큘럼 수정
    static async updateCurriculum(curriculumId: number, curriculumData: Partial<CurriculumData>): Promise<CurriculumData | null> {
        try {
            const response = await fetch(`${this.baseURL}/curriculum/${curriculumId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(curriculumData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const responseData = await response.json();
            return responseData.data;
        } catch (error) {
            console.error('커리큘럼 수정 실패:', error);
            return null;
        }
    }

    // 커리큘럼 삭제
    static async deleteCurriculum(curriculumId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/curriculum/${curriculumId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('커리큘럼 삭제 실패:', error);
            return false;
        }
    }
}

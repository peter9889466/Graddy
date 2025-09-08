import axios from 'axios';

// 백엔드에서 오는 관심사 데이터 타입
export interface Interest {
    interestId: number;
    interestDivision: number;
    interestName: string;
}

// 프론트엔드에서 사용할 관심사 데이터 타입
export interface InterestForFrontend {
    interestId: number;
    interestDivision: number;
    interestName: string;
    categoryName: string;
}

// API 응답 타입
export interface InterestResponse {
    status: number;
    message: string;
    data: Interest[];
}

// 관심사 API 서비스
export class InterestApiService {
    // JWT 토큰을 자동으로 포함하지 않는 axios 인스턴스 생성
    private static interestsAxiosInstance = axios.create({
        baseURL: window.location.hostname === 'localhost' 
            ? 'http://localhost:8080'
            : 'http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        }
    });

    // 모든 관심사 조회
    static async getAllInterests(): Promise<InterestForFrontend[]> {
        try {
            console.log('관심사 데이터 조회 시작');

            const response = await this.interestsAxiosInstance.get('/api/interests');
            console.log('관심사 API 응답:', response.data);

            if (!response.data || !response.data.data) {
                console.warn('관심사 API data 필드가 없습니다.');
                return [];
            }

            const interests: Interest[] = response.data.data;
            console.log('원본 관심사 데이터:', interests);

            // 백엔드 데이터를 프론트엔드 형식으로 변환
            const convertedData = this.convertBackendToFrontend(interests);
            console.log('변환된 관심사 데이터:', convertedData);

            return convertedData;
        } catch (error) {
            console.error('관심사 데이터 조회 실패:', error);
            throw error;
        }
    }

    // 백엔드 데이터를 프론트엔드 형식으로 변환하는 함수
    private static convertBackendToFrontend(interests: Interest[]): InterestForFrontend[] {
        return interests.map(interest => {
            // interestDivision에 따른 카테고리 이름 매핑
            const getCategoryName = (division: number): string => {
                switch (division) {
                    case 1: return '프로그래밍 언어';
                    case 2: return '라이브러리 & 프레임워크';
                    case 3: return '데이터베이스';
                    case 4: return '플랫폼/환경설정';
                    case 5: return 'AI/데이터';
                    case 6: return '기타';
                    case 7: return '포지션';
                    default: return '기타';
                }
            };

            return {
                interestId: interest.interestId,
                interestDivision: interest.interestDivision,
                interestName: interest.interestName,
                categoryName: getCategoryName(interest.interestDivision)
            };
        });
    }

    // 스터디/프로젝트 타입에 따른 관심사 필터링
    static async getInterestsByType(studyType: 'study' | 'project'): Promise<InterestForFrontend[]> {
        try {
            const allInterests = await this.getAllInterests();

            // 스터디: 1-6번 카테고리, 프로젝트: 1-7번 카테고리
            const maxDivision = studyType === 'study' ? 6 : 7;

            return allInterests.filter(interest => interest.interestDivision <= maxDivision);
        } catch (error) {
            console.error('타입별 관심사 조회 실패:', error);
            throw error;
        }
    }
}

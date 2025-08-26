/**
 * 스터디 프로젝트 생성 API 사용 예시
 * 
 * 이 파일은 로그인한 사용자의 JWT 토큰을 헤더에 포함하여
 * POST /api/studies-projects 엔드포인트로 스터디/프로젝트를 생성하는 방법을 보여줍니다.
 */

import { StudyApiService, CreateStudyProjectRequest } from '../services/studyApi';

/**
 * 기본적인 스터디 생성 예시
 */
export const createBasicStudy = async () => {
    try {
        const studyData: CreateStudyProjectRequest = {
            studyProjectName: "JavaScript 기초 스터디",
            studyProjectTitle: "JavaScript ES6+ 기초 학습",
            studyProjectDesc: "JavaScript의 최신 문법과 기능을 함께 학습하는 기초 스터디입니다.",
            studyLevel: 1, // 초급
            typeCheck: "study",
            studyProjectStart: new Date().toISOString(),
            studyProjectEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후
            studyProjectTotal: 6,
            soltStart: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(), // 오후 7시
            soltEnd: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(), // 오후 9시
            interestIds: [1, 2], // JavaScript, React 관련
            dayIds: ["2", "4"] // 화요일, 목요일
        };

        const result = await StudyApiService.createStudyProject(studyData);
        console.log('스터디 생성 성공:', result);
        return result;
    } catch (error) {
        console.error('스터디 생성 실패:', error);
        throw error;
    }
};

/**
 * 프로젝트 생성 예시
 */
export const createProject = async () => {
    try {
        const projectData: CreateStudyProjectRequest = {
            studyProjectName: "웹 포트폴리오 프로젝트",
            studyProjectTitle: "React + TypeScript 포트폴리오 웹사이트 개발",
            studyProjectDesc: "React와 TypeScript를 활용하여 개인 포트폴리오 웹사이트를 개발하는 프로젝트입니다.",
            studyLevel: 2, // 중급
            typeCheck: "project",
            studyProjectStart: new Date().toISOString(),
            studyProjectEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60일 후
            studyProjectTotal: 4,
            soltStart: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(), // 오후 8시
            soltEnd: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(), // 오후 10시
            interestIds: [2, 3], // React, TypeScript 관련
            dayIds: ["1", "3", "5"] // 월요일, 수요일, 금요일
        };

        const result = await StudyApiService.createStudyProject(projectData);
        console.log('프로젝트 생성 성공:', result);
        return result;
    } catch (error) {
        console.error('프로젝트 생성 실패:', error);
        throw error;
    }
};

/**
 * 고급 스터디 생성 예시
 */
export const createAdvancedStudy = async () => {
    try {
        const advancedStudyData: CreateStudyProjectRequest = {
            studyProjectName: "Spring Boot 마이크로서비스",
            studyProjectTitle: "Spring Boot를 활용한 마이크로서비스 아키텍처 구현",
            studyProjectDesc: "Spring Boot, Docker, Kubernetes를 활용하여 마이크로서비스 아키텍처를 구현하는 고급 스터디입니다.",
            studyLevel: 3, // 고급
            typeCheck: "study",
            studyProjectStart: new Date().toISOString(),
            studyProjectEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90일 후
            studyProjectTotal: 8,
            soltStart: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(), // 오후 6시
            soltEnd: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(), // 오후 8시
            interestIds: [4, 5, 6], // Spring Boot, Docker, Kubernetes 관련
            dayIds: ["3", "6"] // 수요일, 토요일
        };

        const result = await StudyApiService.createStudyProject(advancedStudyData);
        console.log('고급 스터디 생성 성공:', result);
        return result;
    } catch (error) {
        console.error('고급 스터디 생성 실패:', error);
        throw error;
    }
};

/**
 * 유틸리티 함수: 날짜를 ISO 8601 형식으로 변환
 */
export const formatDateToISO = (date: Date): string => {
    return date.toISOString();
};

/**
 * 유틸리티 함수: 시간을 ISO 8601 형식으로 변환
 */
export const formatTimeToISO = (hour: number, minute: number = 0): string => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
};

/**
 * 유틸리티 함수: 요일 이름을 ID로 변환
 */
export const getDayId = (dayName: string): string => {
    const dayMapping: { [key: string]: string } = {
        '월요일': '1',
        '화요일': '2',
        '수요일': '3',
        '목요일': '4',
        '금요일': '5',
        '토요일': '6',
        '일요일': '7'
    };
    return dayMapping[dayName] || '1';
};

/**
 * 유틸리티 함수: 난이도를 숫자로 변환
 */
export const getLevelNumber = (level: '초급' | '중급' | '고급'): number => {
    const levelMapping = {
        '초급': 1,
        '중급': 2,
        '고급': 3
    };
    return levelMapping[level];
};

/**
 * 사용 예시
 */
export const exampleUsage = async () => {
    console.log('=== 스터디 프로젝트 생성 API 사용 예시 ===');
    
    try {
        // 기본 스터디 생성
        console.log('\n1. 기본 스터디 생성');
        await createBasicStudy();
        
        // 프로젝트 생성
        console.log('\n2. 프로젝트 생성');
        await createProject();
        
        // 고급 스터디 생성
        console.log('\n3. 고급 스터디 생성');
        await createAdvancedStudy();
        
        console.log('\n모든 생성이 성공적으로 완료되었습니다!');
    } catch (error) {
        console.error('예시 실행 중 오류 발생:', error);
    }
};

// 모듈로 내보내기
export default {
    createBasicStudy,
    createProject,
    createAdvancedStudy,
    formatDateToISO,
    formatTimeToISO,
    getDayId,
    getLevelNumber,
    exampleUsage
};


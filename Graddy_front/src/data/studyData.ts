export interface StudyData {
    id: number;
    title: string;
    description: string;
    period: string;
    tags: string[];
    leader: string;
    isRecruiting: boolean;
    recruitmentStatus: '모집중' | '모집완료';
}

export const studyList: StudyData[] = [
    {
        id: 1,
        title: "Java 스터디",
        description: "프로젝트 스터디! 프로젝트 개발 스터디 인원 front / back 인원 구합니다.",
        period: "25.08.15~25.09.15",
        tags: ["JAVA", "SQL", "Spring", "JavaScript"],
        leader: "김승혁",
        isRecruiting: true,
        recruitmentStatus: "모집중"
    },
    {
        id: 2,
        title: "React 스터디",
        description: "React와 TypeScript를 활용한 프론트엔드 개발 스터디입니다.",
        period: "25.08.20~25.10.20",
        tags: ["React", "TypeScript", "JavaScript", "CSS"],
        leader: "이민수",
        isRecruiting: true,
        recruitmentStatus: "모집중"
    },
    {
        id: 3,
        title: "알고리즘 스터디",
        description: "코딩테스트 대비 알고리즘 문제 해결 스터디입니다.",
        period: "25.08.10~25.12.10",
        tags: ["Algorithm", "Python", "Java", "C++"],
        leader: "박지영",
        isRecruiting: false,
        recruitmentStatus: "모집완료"
    }
];

export const searchSuggestions = [
    "Java", "React", "Spring", "JavaScript", "TypeScript", "Python",
    "알고리즘", "프로젝트", "백엔드", "프론트엔드", "데이터베이스", "웹개발"
];
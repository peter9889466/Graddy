export interface StudyData {
    id: number;
    title: string;
    description: string;
    period: string;
    tags: Array<string | {name: string, difficulty?: string}>;
    leader: string;
    isRecruiting: boolean;
    recruitmentStatus: '모집중' | '모집완료';
    type: '스터디' | '프로젝트';
}

export const studyList: StudyData[] = [
    {
        id: 1,
        title: "Java 스터디",
        description: "프로젝트 스터디! 프로젝트 개발 스터디 인원 front / back 인원 구합니다.",
        period: "25.08.15~25.09.15",
        tags: [
            {name: "JAVA", difficulty: "중급"},
            {name: "SQL", difficulty: "초급"},
            {name: "Spring", difficulty: "고급"},
            {name: "JavaScript", difficulty: "중급"}
        ],
        leader: "김승혁",
        isRecruiting: true,
        recruitmentStatus: "모집중",
        type: "스터디"
    },
    {
        id: 2,
        title: "React 스터디",
        description: "React와 TypeScript를 활용한 프론트엔드 개발 스터디입니다.",
        period: "25.08.20~25.10.20",
        tags: [
            {name: "React", difficulty: "중급"},
            {name: "TypeScript", difficulty: "고급"},
            {name: "JavaScript", difficulty: "중급"},
            {name: "CSS", difficulty: "초급"}
        ],
        leader: "이민수",
        isRecruiting: true,
        recruitmentStatus: "모집중",
        type: "스터디"
    },
    {
        id: 3,
        title: "알고리즘 스터디",
        description: "코딩테스트 대비 알고리즘 문제 해결 스터디입니다.",
        period: "25.08.10~25.12.10",
        tags: [
            {name: "Algorithm", difficulty: "고급"},
            {name: "Python", difficulty: "중급"},
            {name: "Java", difficulty: "중급"},
            {name: "C++", difficulty: "고급"}
        ],
        leader: "박지영",
        isRecruiting: false,
        recruitmentStatus: "모집완료",
        type: "스터디"
    },
    {
        id: 4,
        title: "웹 포트폴리오 프로젝트",
        description: "개인 포트폴리오 웹사이트 제작 프로젝트입니다.",
        period: "25.08.25~25.10.25",
        tags: ["React", "Node.js", "MongoDB", "AWS"],
        leader: "최영희",
        isRecruiting: true,
        recruitmentStatus: "모집중",
        type: "프로젝트"
    },
    {
        id: 5,
        title: "모바일 앱 프로젝트",
        description: "React Native를 활용한 모바일 애플리케이션 개발 프로젝트입니다.",
        period: "25.09.01~25.11.01",
        tags: ["React Native", "Firebase", "TypeScript"],
        leader: "정민호",
        isRecruiting: true,
        recruitmentStatus: "모집중",
        type: "프로젝트"
    }
];

export const searchSuggestions = [
    "Java", "React", "Spring", "JavaScript", "TypeScript", "Python",
    "알고리즘", "프로젝트", "백엔드", "프론트엔드", "데이터베이스", "웹개발"
];
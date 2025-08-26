export interface MyStudyData {
    id: string;
    title: string;
    description: string;
    type: 'study' | 'project';
    role: 'leader' | 'member';
    status: 'active' | 'completed' | 'recruiting';
    startDate: string;
    endDate: string;
    currentMembers: number;
    maxMembers: number;
    tags: string[];
    lastActivity: string;
    leader: string;
    meetingDays?: string[];
    meetingTime?: string;
}

export const myStudyList: MyStudyData[] = [
    {
        id: '1',
        title: 'Java 스터디',
        description: '프로젝트 개발 스터디! 프론트엔드/백엔드 인원 구합니다.',
        type: 'study',
        role: 'leader',
        status: 'active',
        startDate: '2025-08-15',
        endDate: '2025-09-15',
        currentMembers: 8,
        maxMembers: 10,
        tags: ['JAVA', 'Spring', 'SQL', 'JavaScript'],
        lastActivity: '2025-01-15',
        leader: '김승혁',
        meetingDays: ['월', '수', '금'],
        meetingTime: '19:00-21:00'
    },
    {
        id: '2',
        title: 'React 스터디',
        description: 'React와 TypeScript를 활용한 프론트엔드 개발 스터디입니다.',
        type: 'study',
        role: 'member',
        status: 'active',
        startDate: '2025-08-20',
        endDate: '2025-10-20',
        currentMembers: 6,
        maxMembers: 8,
        tags: ['React', 'TypeScript', 'JavaScript', 'CSS'],
        lastActivity: '2025-01-14',
        leader: '이민수',
        meetingDays: ['화', '목'],
        meetingTime: '20:00-22:00'
    },
    {
        id: '3',
        title: '알고리즘 스터디',
        description: '코딩테스트 대비 알고리즘 문제 해결 스터디입니다.',
        type: 'study',
        role: 'member',
        status: 'completed',
        startDate: '2025-08-10',
        endDate: '2025-12-10',
        currentMembers: 12,
        maxMembers: 12,
        tags: ['Algorithm', 'Python', 'Java', 'C++'],
        lastActivity: '2025-01-10',
        leader: '박지영',
        meetingDays: ['월', '수', '금'],
        meetingTime: '18:00-20:00'
    },
    {
        id: '4',
        title: '웹 포트폴리오 프로젝트',
        description: '개인 포트폴리오 웹사이트 제작 프로젝트입니다.',
        type: 'project',
        role: 'leader',
        status: 'active',
        startDate: '2025-08-25',
        endDate: '2025-10-25',
        currentMembers: 4,
        maxMembers: 5,
        tags: ['React', 'Node.js', 'MongoDB', 'AWS'],
        lastActivity: '2025-01-15',
        leader: '최영희'
    },
    {
        id: '5',
        title: 'AI 챗봇 프로젝트',
        description: 'OpenAI API를 활용한 챗봇 개발 프로젝트입니다.',
        type: 'project',
        role: 'member',
        status: 'recruiting',
        startDate: '2025-02-01',
        endDate: '2025-04-01',
        currentMembers: 3,
        maxMembers: 6,
        tags: ['Python', 'OpenAI', 'FastAPI', 'Docker'],
        lastActivity: '2025-01-12',
        leader: '정현우'
    },
    {
        id: '6',
        title: '모바일 앱 개발 스터디',
        description: 'React Native를 사용한 모바일 앱 개발 스터디입니다.',
        type: 'study',
        role: 'member',
        status: 'active',
        startDate: '2025-01-01',
        endDate: '2025-03-01',
        currentMembers: 7,
        maxMembers: 10,
        tags: ['React Native', 'JavaScript', 'Firebase'],
        lastActivity: '2025-01-13',
        leader: '김서연',
        meetingDays: ['화', '목', '토'],
        meetingTime: '14:00-16:00'
    }
];

// 진행 중인 스터디/프로젝트만 필터링
export const getActiveStudies = () => {
    return myStudyList.filter(study => study.status === 'active');
};

// 완료된 스터디/프로젝트만 필터링
export const getCompletedStudies = () => {
    return myStudyList.filter(study => study.status === 'completed');
};

// 내가 리더인 스터디/프로젝트만 필터링
export const getMyLeadingStudies = () => {
    return myStudyList.filter(study => study.role === 'leader');
};

// 내가 멤버인 스터디/프로젝트만 필터링
export const getMyMemberStudies = () => {
    return myStudyList.filter(study => study.role === 'member');
};

// 최근 활동순으로 정렬
export const getStudiesByRecentActivity = () => {
    return [...myStudyList].sort((a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
};

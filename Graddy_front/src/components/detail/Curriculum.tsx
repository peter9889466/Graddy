import React, { useState } from "react";
import { CheckCircle, Circle, Clock, BookOpen, Code, Users, Target, Edit } from "lucide-react";

interface CurriculumItem {
    week: number;
    title: string;
    status: string;
    topics: string[];
    materials: string[];
    assignments: string[];
}

const Curriculum: React.FC = () => {
    // 커리큘럼 데이터
    const curriculumData = [
        {
            week: 1,
            title: "스터디 오리엔테이션 & 환경 설정",
            status: "completed",
            topics: [
                "스터디 규칙 및 목표 설정",
                "개발 환경 설정 (IDE, Git)",
                "기본 Git 명령어 학습",
                "프로젝트 구조 이해"
            ],
            materials: ["Git 기초 강의", "개발 환경 설정 가이드"],
            assignments: ["GitHub 계정 생성 및 첫 커밋", "개발 환경 설정 완료 인증"]
        },
        {
            week: 2,
            title: "기본 문법 및 데이터 구조",
            status: "completed",
            topics: [
                "변수, 상수, 데이터 타입",
                "조건문과 반복문",
                "배열과 객체",
                "함수 정의와 호출"
            ],
            materials: ["기본 문법 강의", "실습 예제"],
            assignments: ["기본 문법 연습 문제 10개", "간단한 계산기 만들기"]
        },
        {
            week: 3,
            title: "객체지향 프로그래밍 기초",
            status: "in-progress",
            topics: [
                "클래스와 객체",
                "상속과 다형성",
                "캡슐화와 추상화",
                "인터페이스와 추상 클래스"
            ],
            materials: ["OOP 개념 강의", "실습 프로젝트"],
            assignments: ["학생 관리 시스템 설계", "OOP 개념 정리 문서"]
        },
        {
            week: 4,
            title: "웹 개발 기초",
            status: "upcoming",
            topics: [
                "HTML/CSS 기초",
                "JavaScript DOM 조작",
                "HTTP 프로토콜 이해",
                "RESTful API 개념"
            ],
            materials: ["웹 개발 기초 강의", "API 문서"],
            assignments: ["간단한 웹페이지 제작", "API 호출 연습"]
        },
        {
            week: 5,
            title: "프레임워크 학습",
            status: "upcoming",
            topics: [
                "프레임워크 선택 및 설치",
                "기본 구조 이해",
                "라우팅과 컴포넌트",
                "상태 관리 기초"
            ],
            materials: ["프레임워크 공식 문서", "튜토리얼"],
            assignments: ["프레임워크로 간단한 앱 만들기", "컴포넌트 설계"]
        },
        {
            week: 6,
            title: "데이터베이스 연동",
            status: "upcoming",
            topics: [
                "데이터베이스 설계",
                "SQL 기초 문법",
                "ORM 사용법",
                "데이터 CRUD 작업"
            ],
            materials: ["SQL 기초 강의", "ORM 문서"],
            assignments: ["데이터베이스 설계", "CRUD 기능 구현"]
        },
        {
            week: 7,
            title: "프로젝트 기획 및 설계",
            status: "upcoming",
            topics: [
                "프로젝트 주제 선정",
                "요구사항 분석",
                "시스템 설계",
                "팀 역할 분담"
            ],
            materials: ["프로젝트 기획 가이드", "설계 패턴"],
            assignments: ["프로젝트 기획서 작성", "시스템 설계도"]
        },
        {
            week: 8,
            title: "최종 프로젝트 개발",
            status: "upcoming",
            topics: [
                "프로젝트 개발 진행",
                "코드 리뷰",
                "버그 수정 및 개선",
                "테스트 및 배포"
            ],
            materials: ["개발 가이드", "배포 문서"],
            assignments: ["최종 프로젝트 완성", "프로젝트 발표"]
        }
    ];

    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    
    // localStorage에서 저장된 데이터를 가져오거나 초기 데이터 사용
    const getSavedCurriculumData = (): CurriculumItem[] => {
        const saved = localStorage.getItem('curriculumData');
        return saved ? JSON.parse(saved) : curriculumData;
    };
    
    const [curriculumDataState, setCurriculumDataState] = useState<CurriculumItem[]>(getSavedCurriculumData);
    const [editingData, setEditingData] = useState(curriculumData[0]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "in-progress":
                return <Clock className="w-5 h-5 text-blue-500" />;
            case "upcoming":
                return <Circle className="w-5 h-5 text-gray-400" />;
            default:
                return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "text-green-600 bg-green-50";
            case "in-progress":
                return "text-blue-600 bg-blue-50";
            case "upcoming":
                return "text-gray-600 bg-gray-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const selectedCurriculum = curriculumDataState.find(c => c.week === selectedWeek);

    const handleEditToggle = () => {
        if (isEditing) {
            // 수정 완료 시 데이터 저장
            const updatedData = curriculumDataState.map((c: CurriculumItem) => c.week === selectedWeek ? editingData : c);
            setCurriculumDataState(updatedData);
            // localStorage에 저장
            localStorage.setItem('curriculumData', JSON.stringify(updatedData));
            setIsEditing(false);
        } else {
            // 수정 시작 시 현재 데이터를 편집 데이터로 복사
            setEditingData({ ...selectedCurriculum! });
            setIsEditing(true);
        }
    };

    const handleInputChange = (value: string) => {
        if (isEditing) {
            setEditingData(prev => {
                const newData = { ...prev };
                // 입력된 텍스트를 그대로 저장
                newData.topics = [value];
                newData.materials = [];
                newData.assignments = [];
                return newData;
            });
        }
    };

    const displayData = isEditing ? editingData : selectedCurriculum;

    return (
        <div className="space-y-4 p-4 pr-10">
            {/* 커리큘럼 제목과 수정 버튼 */}
            <div className="flex items-center justify-between mb-6 -mt-4 -ml-4">
                <h2 className="text-xl font-bold"
                    style={{ color: "#8B85E9" }}>커리큘럼</h2>
                <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A75D8] transition-colors duration-200"
                >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {isEditing ? "수정 완료" : "수정"}
                    </span>
                </button>
            </div>

            {/* 커리큘럼 내용 */}
            <div className="bg-white rounded-xl shadow-sm border-2 p-6">
                {displayData && (
                    <>


                        {isEditing ? (
                            <textarea
                                value={displayData.topics[0] || ''}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="w-full text-gray-700 bg-gray-50 border border-gray-300 rounded px-3 py-2 min-h-[400px] resize-y"
                            />
                        ) : (
                            <div className="whitespace-pre-wrap text-gray-700">
                                {displayData.topics[0] || ''}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Curriculum;

import React from "react";
import { useNavigate } from "react-router-dom";
import { StudyData } from "../../data/studyData";

interface MyStudyListProps {
    userNickname: string;
}

const MyStudyList: React.FC<MyStudyListProps> = ({ userNickname }) => {
    const navigate = useNavigate();

    // 로컬 스토리지에서 사용자가 생성한 스터디 가져오기
    // test
    const userStudies: StudyData[] = JSON.parse(localStorage.getItem('userStudies') || '[]');

    const handleStudyClick = (study: StudyData) => {
        navigate(`/study/${study.id}`, {
            state: {
                title: study.title,
                description: study.description,
                leader: study.leader,
                period: study.period,
                tags: study.tags
            }
        });
    };

    if (userStudies.length === 0) {
        return (
            <div className="space-y-6 sm:space-y-8">
                <h2 className="text-xl sm:text-2xl font-bold">내 스터디 목록</h2>
                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">아직 생성한 스터디가 없습니다</h3>
                        <p className="text-gray-500 mb-6">첫 번째 스터디를 생성해보세요!</p>
                        <button
                            onClick={() => navigate('/study-create')}
                            className="px-6 py-3 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200 font-medium"
                        >
                            스터디 생성하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold">내 스터디 목록</h2>
            
            <div className="space-y-4">
                {userStudies.map((study) => (
                    <div
                        key={study.id}
                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => handleStudyClick(study)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">{study.title}</h3>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            study.isRecruiting
                                                ? "bg-blue-50 text-blue-700"
                                                : "bg-purple-50 text-purple-700"
                                        }`}
                                    >
                                        {study.recruitmentStatus}
                                    </span>
                                </div>
                                
                                <p className="text-gray-600 mb-3 line-clamp-2">{study.description}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <span>스터디장: {study.leader}</span>
                                    <span>기간: {study.period}</span>
                                </div>
                                
                                <div className="flex gap-2 flex-wrap">
                                    {study.tags.map((tag: string, index: number) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="ml-4">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="text-center pt-4">
                <button
                    onClick={() => navigate('/study-create')}
                    className="px-6 py-3 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200 font-medium"
                >
                    새 스터디 생성하기
                </button>
            </div>
        </div>
    );
};

export default MyStudyList;

import React, { useState, useEffect } from "react";
import { CheckCircle, Circle, Clock, BookOpen, Code, Users, Target, Edit } from "lucide-react";
import { CurriculumApiService, CurriculumData } from "../../services/curriculumApi";

interface CurriculumItem {
    week: number;
    title: string;
    status: string;
    topics: string[];
    materials: string[];
    assignments: string[];
}

interface CurriculumProps {
    studyProjectId?: number;
}

const Curriculum: React.FC<CurriculumProps> = ({ studyProjectId }) => {

    const [selectedWeek, setSelectedWeek] = useState<number>(1);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [curriculumDataState, setCurriculumDataState] = useState<CurriculumItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<CurriculumItem | null>(null);

    // 백엔드에서 커리큘럼 데이터 가져오기
    useEffect(() => {
        const fetchCurriculumData = async () => {
            if (!studyProjectId) {
                console.warn('studyProjectId가 없습니다.');
                setCurriculumDataState([]);
                setEditingData(null);
                return;
            }

            setLoading(true);
            setError(null);
            
            try {
                console.log('커리큘럼 데이터 가져오기 시작:', studyProjectId);
                const data = await CurriculumApiService.getCurriculumByStudyProject(studyProjectId);
                
                if (data && data.length > 0) {
                    // 백엔드 데이터를 프론트엔드 형식으로 변환
                    const convertedData: CurriculumItem[] = data.map(item => ({
                        week: item.week,
                        title: item.title,
                        status: item.status,
                        topics: item.topics,
                        materials: item.materials,
                        assignments: item.assignments
                    }));
                    
                    setCurriculumDataState(convertedData);
                    if (convertedData.length > 0) {
                        setEditingData(convertedData[0]);
                    }
                    console.log('커리큘럼 데이터 로드 성공:', convertedData);
                } else {
                    console.log('백엔드에서 커리큘럼 데이터가 없습니다.');
                    setCurriculumDataState([]);
                    setEditingData(null);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : '커리큘럼 데이터를 불러오는데 실패했습니다.';
                setError(errorMessage);
                console.error('커리큘럼 데이터 로드 실패:', err);
                
                // 에러 시 빈 배열로 설정
                setCurriculumDataState([]);
                setEditingData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCurriculumData();
    }, [studyProjectId]);

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

    const handleEditToggle = () => {
        if (isEditing) {
            // 수정 완료 시 데이터 저장
            const updatedData = curriculumDataState.map((c: CurriculumItem) => 
                c.week === selectedWeek && editingData ? editingData : c
            );
            setCurriculumDataState(updatedData);
            // localStorage에 저장
            localStorage.setItem('curriculumData', JSON.stringify(updatedData));
            setIsEditing(false);
        } else {
            // 수정 시작 시 현재 데이터를 편집 데이터로 복사
            const currentCurriculum = curriculumDataState.find(c => c.week === selectedWeek);
            if (currentCurriculum) {
                setEditingData({ ...currentCurriculum });
                setIsEditing(true);
            }
        }
    };

    const handleInputChange = (value: string) => {
        if (isEditing && editingData) {
            setEditingData(prev => {
                if (!prev) return prev;
                const newData = { ...prev };
                // 입력된 텍스트를 그대로 저장
                newData.topics = [value];
                newData.materials = [];
                newData.assignments = [];
                return newData;
            });
        }
    };

    // 로딩 상태 표시
    if (loading) {
        return (
            <div className="space-y-4 p-4 pr-10">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B85E9]"></div>
                    <span className="ml-2 text-gray-600">커리큘럼 데이터를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    // 에러 상태 표시
    if (error) {
        return (
            <div className="space-y-4 p-4 pr-10">
                <div className="flex items-center justify-center py-8">
                    <div className="text-red-600 text-center">
                        <p className="font-medium">커리큘럼 데이터 로드 실패</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const selectedCurriculum = curriculumDataState.find(c => c.week === selectedWeek);
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
                {displayData ? (
                    <>
                        {isEditing ? (
                            <textarea
                                value={displayData.topics[0] || ''}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="w-full text-gray-700 bg-gray-50 border border-gray-300 rounded px-3 py-2 min-h-[400px] resize-y"
                                placeholder="커리큘럼 내용을 입력하세요..."
                            />
                        ) : (
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                {displayData.topics[0] || '커리큘럼 내용이 없습니다.'}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>커리큘럼 데이터가 없습니다.</p>
                        <p className="text-sm mt-2">Spring 백엔드에서 커리큘럼 정보를 가져올 수 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Curriculum;

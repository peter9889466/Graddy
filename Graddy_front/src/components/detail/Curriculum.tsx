import { updateCurriculumText } from "@/services/studyApi";
import { Edit } from "lucide-react";
import { useEffect, useState } from "react";

interface CurriculumProps {
    curriculumText: string;
    isStudyLeader: boolean;
    studyProjectId: number;
    onCurriculumUpdate?: (newText: string) => void;
}

const Curriculum: React.FC<CurriculumProps> = ({ 
    curriculumText, 
    isStudyLeader, 
    studyProjectId,
    onCurriculumUpdate 
}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingText, setEditingText] = useState<string>(curriculumText);

    // props로 받은 curriculumText가 변경될 때 editingText 업데이트
    useEffect(() => {
        setEditingText(curriculumText);
    }, [curriculumText]);

    const handleEditToggle = async () => {
        if (isEditing) {
            try {
                // 백엔드에 curText 업데이트 API 호출
                await updateCurriculumText(studyProjectId, editingText);
                
                if (onCurriculumUpdate) {
                    onCurriculumUpdate(editingText);
                }
                
                setIsEditing(false);
            } catch (error) {
                console.error('커리큘럼 업데이트 실패:', error);
                alert('커리큘럼 업데이트에 실패했습니다.');
            }
        } else {
            setIsEditing(true);
        }
    };

    return (
        <div className="space-y-4 p-4 pr-10">
            <div className="flex items-center justify-between mb-6 -mt-4 -ml-4">
                <h2 className="text-xl font-bold" style={{ color: "#8B85E9" }}>커리큘럼</h2>
                {/* 리더만 수정 버튼 표시 */}
                {isStudyLeader && (
                    <button
                        onClick={handleEditToggle}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A75D8] transition-colors duration-200"
                    >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {isEditing ? "저장" : "수정"}
                        </span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border-2 p-6">
                {isEditing ? (
                    <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full text-gray-700 bg-gray-50 border border-gray-300 rounded px-3 py-2 min-h-[400px] resize-y"
                        placeholder="커리큘럼 내용을 입력하세요"
                    />
                ) : (
                    <div className="whitespace-pre-wrap text-gray-700 min-h-[400px]">
                        {curriculumText || '커리큘럼이 아직 작성되지 않았습니다.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Curriculum;
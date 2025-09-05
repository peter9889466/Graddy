import { updateCurriculumText } from "@/services/studyApi";
import { Edit, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
            console.log('💾 커리큘럼 저장 시작...');
            console.log('   - Study Project ID:', studyProjectId);
            console.log('   - Editing Text:', editingText);
            console.log('   - Is Study Leader:', isStudyLeader);

            if (!isStudyLeader) {
                alert('스터디 리더만 커리큘럼을 수정할 수 있습니다.');
                return;
            }

            try {
                // 백엔드에 curText 업데이트 API 호출
                await updateCurriculumText(studyProjectId, editingText);
                
                if (onCurriculumUpdate) {
                    onCurriculumUpdate(editingText);
                }
                
                setIsEditing(false);
                console.log('✅ 커리큘럼 저장 성공!');
                alert('커리큘럼이 성공적으로 업데이트되었습니다.');

            } catch (error) {
                console.error('❌ 커리큘럼 업데이트 실패:', error);
                alert('커리큘럼 업데이트에 실패했습니다. 자세한 내용은 콘솔을 확인해주세요.');
            }
        } else {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        setEditingText(curriculumText);
        setIsEditing(false);
    };

    return (
        <div className="space-y-4 p-4 pr-10">
            <div className="flex items-center justify-between mb-6 -mt-4 -ml-4">
                <h2 className="text-xl font-bold" style={{ color: "#8B85E9" }}>커리큘럼</h2>
                {/* 리더만 수정 버튼 표시 */}
                {isStudyLeader && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleEditToggle}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                    <Save className="w-4 h-4" />
                                    <span className="text-sm font-medium">저장</span>
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="text-sm font-medium">취소</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleEditToggle}
                                className="flex items-center gap-2 px-4 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A75D8] transition-colors duration-200"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="text-sm font-medium">수정</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border-2 p-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                💡 <strong>마크다운 팁:</strong> 제목은 #, ##, ###로 작성하고, 목록은 - 또는 *로 작성하세요. 
                                <strong>**굵은 글씨**</strong>, <em>*기울임*</em>, `코드` 등도 사용할 수 있습니다.
                            </p>
                        </div>
                        <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full text-gray-700 bg-gray-50 border border-gray-300 rounded px-3 py-2 min-h-[400px] resize-y font-mono text-sm"
                            placeholder="# 커리큘럼 제목&#10;&#10;## 1주차&#10;- 학습 목표: ...&#10;- 주요 내용: ...&#10;&#10;## 2주차&#10;- 학습 목표: ...&#10;- 주요 내용: ..."
                        />
                    </div>
                ) : (
                    <div className="text-gray-700 min-h-[400px] prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 prose-strong:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700">
                        {curriculumText ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {curriculumText}
                            </ReactMarkdown>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 italic text-lg">커리큘럼이 아직 작성되지 않았습니다.</p>
                                <p className="text-gray-400 text-sm mt-2">스터디 리더가 커리큘럼을 작성하면 여기에 표시됩니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Curriculum;
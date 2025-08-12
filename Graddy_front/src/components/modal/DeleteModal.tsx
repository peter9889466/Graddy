import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface DeleteModalProps {
    onClose?: () => void;
}

export default function DeleteModal({ onClose }: DeleteModalProps) {
    return (
        <div
            className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-[200] p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Card 시작 */}
                <div className="bg-white border border-red-200 rounded-xl shadow p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1 ">
                            계정 탈퇴
                        </h1>
                        <p className="text-gray-600 mb-8">
                            이 작업은 계정과 모든 관련 데이터를 영구적으로
                            삭제합니다.
                        </p>
                    </div>
                    {/* 빨간 영역 */}
                    <div className="flex items-center mb-2">
                        <Trash2 className="w-5 h-5 text-red-600 mr-2" />
                        <span className="font-semibold text-red-700">
                            서비스명 계정 탈퇴
                        </span>
                    </div>
                    <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-8">
                        <ul className="text-red-800 text-sm space-y-1 text-left pl-1">
                            <li>• 이 작업은 취소할 수 없습니다</li>
                        </ul>
                    </div>

                    {/* 주의사항 */}
                    <div className="mb-6">
                        <div className="flex items-center text-blue-700 font-semibold mb-2">
                            <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
                            계정 삭제 시 주의사항
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <ul className="text-blue-800 text-sm space-y-1 text-left pl-1">
                                <li>• 사용자 지정 설정 및 구성이 손실됩니다</li>
                            </ul>
                        </div>
                    </div>

                    {/* 확인 입력 및 버튼 */}
                    <div className="mb-4">
                        <div className="font-semibold text-gray-900 mb-1">
                            계정 삭제 확인
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                            "DELETE ACCOUNT" 문구를 정확히 입력해 주세요
                        </div>
                        <input
                            type="text"
                            placeholder="DELETE ACCOUNT"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none text-base disabled:bg-gray-100"
                        />
                    </div>

                    {/* 버튼 그룹 */}
                    <div className="flex gap-3">
                        <Button
                            // onClick={handleDelete}
                            // disabled={!isPhraseValid || isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold flex-1 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            계정 영구 삭제
                            {/* {isDeleting ? "삭제 중..." : "계정 영구 삭제"} */}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 py-3 border-gray-300 hover:bg-gray-50 bg-transparent"
                            onClick={onClose}
                            // disabled={isDeleting}
                        >
                            취소
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

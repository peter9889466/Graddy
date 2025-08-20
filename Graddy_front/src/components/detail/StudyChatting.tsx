import React from "react";

const StudyChatting: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border-2 flex flex-col h-[520px]">
            {/* 헤더 */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-bold" style={{ color: "#8B85E9" }}>
                    스터디 채팅
                </div>
                {/* <div className="text-xs text-gray-500">형태만 구현</div> */}
            </div>

            {/* 메시지 영역 (스크롤) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {/* 상대 메시지 */}
                <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300" />
                    <div>
                        <div className="text-xs text-gray-500">스터디원</div>
                        <div className="bg-white border rounded-2xl px-3 py-2 max-w-[220px] text-sm">
                            안녕하세요! 스터디 진행 관련해서 논의해요.
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">오전 10:20</div>
                    </div>
                </div>

                {/* 내 메시지 */}
                <div className="flex items-end justify-end">
                    <div>
                        <div className="text-white rounded-2xl px-3 py-2 max-w-[220px] text-sm" style={{ backgroundColor: "#8B85E9" }}>
                            네 좋아요. 오늘 저녁 8시에 온라인으로 만나요!
                        </div>
                        <div className="text-[10px] text-gray-400 text-right mt-1">오전 10:22</div>
                    </div>
                </div>

                {/* 더미 메시지 */}
                <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300" />
                    <div>
                        <div className="text-xs text-gray-500">스터디원</div>
                        <div className="bg-white border rounded-2xl px-3 py-2 max-w-[220px] text-sm">
                            과제는 알고리즘 3문제로 할까요?
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">오전 10:25</div>
                    </div>
                </div>
            </div>

            {/* 입력 영역 */}
            <div className="border-t p-3 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="메시지를 입력하세요"
                    className="flex-1 px-3 py-2 border rounded-full text-sm outline-none focus:border-violet-500"
                />
                <button
                    type="button"
                    className="px-4 py-2 rounded-full text-sm text-white"
                    style={{ backgroundColor: "#8B85E9" }}
                >
                    전송
                </button>
            </div>
        </div>
    );
};

export default StudyChatting;



import React, { useState, useContext } from "react";
import {
    StudyApiService,
    CreateStudyProjectRequest,
} from "../../services/studyApi";
import { AuthContext } from "../../contexts/AuthContext";

const StudyCreationExample: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleCreateStudyProject = async () => {
        if (!authContext?.user) {
            setError("로그인이 필요합니다.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // 현재 시간 기준으로 시작/종료 시간 설정
            const now = new Date();
            const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30일 후

            // 스터디 프로젝트 생성 요청 데이터
            const studyProjectData: CreateStudyProjectRequest = {
                studyProjectName: "React 스터디",
                studyProjectTitle: "React와 TypeScript 기초 스터디",
                studyProjectDesc:
                    "React와 TypeScript를 함께 배우는 기초 스터디입니다. 컴포넌트 기반 개발과 타입 안정성을 중점적으로 학습합니다.",
                studyLevel: 2, // 중급
                typeCheck: "study", // "study" 또는 "project"
                studyProjectStart: now.toISOString(),
                studyProjectEnd: endDate.toISOString(),
                studyProjectTotal: 8, // 최대 8명
                soltStart: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    19,
                    0,
                    0
                ).toISOString(), // 오후 7시
                soltEnd: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    21,
                    0,
                    0
                ).toISOString(), // 오후 9시
                interestIds: [1, 2, 3], // 관심사 ID 배열
                dayIds: ["2", "4", "6"], // 화요일, 목요일, 토요일
            };

            console.log("스터디 프로젝트 생성 요청:", studyProjectData);

            // API 호출
            const response = await StudyApiService.createStudyProject(
                studyProjectData
            );

            setResult(response);
            console.log("스터디 프로젝트 생성 성공:", response);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "알 수 없는 오류가 발생했습니다.";
            setError(errorMessage);
            console.error("스터디 프로젝트 생성 실패:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                스터디 프로젝트 생성 API 사용 예시
            </h2>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    현재 로그인 상태
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    {authContext?.user ? (
                        <div>
                            <p>
                                <strong>닉네임:</strong>{" "}
                                {authContext.user.nickname}
                            </p>
                            <p>
                                <strong>토큰:</strong>{" "}
                                {authContext.token ? "있음" : "없음"}
                            </p>
                        </div>
                    ) : (
                        <p className="text-red-600">로그인이 필요합니다.</p>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    API 요청 예시
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
                        {`{
  "studyProjectName": "React 스터디",
  "studyProjectTitle": "React와 TypeScript 기초 스터디",
  "studyProjectDesc": "React와 TypeScript를 함께 배우는 기초 스터디입니다.",
  "studyLevel": 2,
  "typeCheck": "study",
  "studyProjectStart": "2025-01-22T10:00:00.000Z",
  "studyProjectEnd": "2025-02-21T10:00:00.000Z",
  "studyProjectTotal": 8,
  "soltStart": "2025-01-22T10:00:00.000Z",
  "soltEnd": "2025-01-22T12:00:00.000Z",
  "interestIds": [1, 2, 3],
  "dayIds": ["2", "4", "6"]
}`}
                    </pre>
                </div>
            </div>

            <div className="mb-6">
                <button
                    onClick={handleCreateStudyProject}
                    disabled={isLoading || !authContext?.user}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        isLoading || !authContext?.user
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-[#8B85E9] text-white hover:bg-[#7A74D8]"
                    }`}
                >
                    {isLoading ? "생성 중..." : "스터디 프로젝트 생성하기"}
                </button>
            </div>

            {error && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-red-600">
                        오류
                    </h3>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-green-600">
                        성공
                    </h3>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <pre className="text-sm text-green-700 overflow-x-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            <div className="text-sm text-gray-600">
                <h3 className="font-semibold mb-2">참고사항:</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>
                        JWT 토큰은 자동으로 Authorization 헤더에 포함됩니다.
                    </li>
                    <li>
                        userId는 JWT 토큰에서 자동으로 추출되므로 선택적으로
                        전송할 수 있습니다.
                    </li>
                    <li>날짜는 ISO 8601 형식으로 전송해야 합니다.</li>
                    <li>interestIds는 관심사 ID 배열입니다.</li>
                    <li>
                        dayIds는 요일 ID 배열입니다 (1: 월요일 ~ 7: 일요일).
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default StudyCreationExample;

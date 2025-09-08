import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const ApiTestComponent: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [testResult, setTestResult] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const testApiConnection = async () => {
        setIsLoading(true);
        setTestResult("");

        try {
            // 1. 기본 연결 테스트
            const response = await fetch(
                "http://localhost:8080/api/api/studies-projects",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setTestResult(
                `상태 코드: ${response.status}\n상태 텍스트: ${
                    response.statusText
                }\n응답: ${await response.text()}`
            );
        } catch (error) {
            setTestResult(
                `오류: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        } finally {
            setIsLoading(false);
        }
    };

    const testWithAuth = async () => {
        setIsLoading(true);
        setTestResult("");

        try {
            const token = localStorage.getItem("userToken");
            console.log("저장된 토큰:", token);

            const response = await fetch(
                "http://localhost:8080/api/studies-projects",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                }
            );

            setTestResult(
                `인증 포함 - 상태 코드: ${response.status}\n상태 텍스트: ${
                    response.statusText
                }\n응답: ${await response.text()}`
            );
        } catch (error) {
            setTestResult(
                `인증 포함 - 오류: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                API 연결 테스트
            </h2>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                    현재 상태
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p>
                        <strong>로그인 상태:</strong>{" "}
                        {authContext?.isLoggedIn ? "로그인됨" : "로그아웃됨"}
                    </p>
                    <p>
                        <strong>사용자:</strong>{" "}
                        {authContext?.user?.nickname || "없음"}
                    </p>
                    <p>
                        <strong>토큰:</strong>{" "}
                        {authContext?.token ? "있음" : "없음"}
                    </p>
                    <p>
                        <strong>localStorage userToken:</strong>{" "}
                        {localStorage.getItem("userToken") ? "있음" : "없음"}
                    </p>
                </div>
            </div>

            <div className="mb-6 space-y-4">
                <button
                    onClick={testApiConnection}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                >
                    {isLoading ? "테스트 중..." : "기본 API 연결 테스트"}
                </button>

                <button
                    onClick={testWithAuth}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
                >
                    {isLoading ? "테스트 중..." : "인증 포함 API 테스트"}
                </button>
            </div>

            {testResult && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">
                        테스트 결과
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {testResult}
                        </pre>
                    </div>
                </div>
            )}

            <div className="text-sm text-gray-600">
                <h3 className="font-semibold mb-2">문제 해결 가이드:</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>
                        404 오류: 백엔드 서버가 실행되지 않았거나 엔드포인트가
                        잘못됨
                    </li>
                    <li>401 오류: 인증 토큰이 없거나 유효하지 않음</li>
                    <li>
                        CORS 오류: 브라우저에서 다른 도메인으로의 요청이 차단됨
                    </li>
                    <li>네트워크 오류: 서버에 연결할 수 없음</li>
                </ul>
            </div>
        </div>
    );
};

export default ApiTestComponent;

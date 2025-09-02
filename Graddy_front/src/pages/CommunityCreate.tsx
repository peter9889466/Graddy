import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import {
    CommunityProvider,
    useCommunityContext,
} from "../contexts/CommunityContext";

const CommunityCreateInner: React.FC = () => {
    const navigate = useNavigate();
    const { createPost, loading } = useCommunityContext();

    const [postData, setPostData] = useState({
        title: "",
        content: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // 디버깅: 토큰 상태 확인
    React.useEffect(() => {
        const token = localStorage.getItem("userToken");
        console.log("CommunityCreate - 현재 토큰 상태:", {
            userToken: localStorage.getItem("userToken"),
            hasToken: !!token,
        });
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setPostData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // 에러 메시지 제거
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!postData.title.trim()) {
            newErrors.title = "게시글 제목을 입력해주세요!";
        }

        if (!postData.content.trim()) {
            newErrors.content = "게시글 내용을 입력해주세요!";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await createPost({
                title: postData.title.trim(),
                content: postData.content.trim(),
            });

            alert("게시글이 성공적으로 작성되었습니다!");
            navigate("/community");
        } catch (error: any) {
            console.error("게시글 생성 실패:", error);

            let errorMessage = "게시글 작성에 실패했습니다. 다시 시도해주세요.";

            if (error?.response?.status === 401) {
                errorMessage = "로그인이 필요합니다. 다시 로그인해주세요.";
            } else if (error?.response?.status === 403) {
                errorMessage = "권한이 없습니다.";
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            alert(errorMessage);
        }
    };

    const handleCancel = () => {
        if (postData.title || postData.content) {
            if (
                window.confirm(
                    "작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?"
                )
            ) {
                navigate("/community");
            }
        } else {
            navigate("/community");
        }
    };

    return (
        <PageLayout>
            <div className="max-w-3xl mx-auto p-4">
                {/* 헤더 */}
                <div className="relative mb-16">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-0 top-0 flex items-center space-x-2 text-gray-600 hover:text-[#8B85E9] transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>뒤로가기</span>
                    </button>
                </div>

                {/* 게시글 작성 폼 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 제목 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div
                                className="w-1 h-5 rounded-full"
                                style={{ backgroundColor: "#8B85E9" }}
                            ></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                게시글 제목 *
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <input
                                type="text"
                                name="title"
                                value={postData.title}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] placeholder-gray-500 ${
                                    errors.title
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                placeholder="게시글 제목을 입력해주세요."
                                style={{
                                    color: errors.title ? "#dc2626" : "#1f2937",
                                }}
                                disabled={loading}
                            />
                        </div>
                        {errors.title && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* 내용 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div
                                className="w-1 h-5 rounded-full"
                                style={{ backgroundColor: "#8B85E9" }}
                            ></div>
                            <h3 className="text-lg font-bold text-gray-800">
                                게시글 내용 *
                            </h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <textarea
                                name="content"
                                value={postData.content}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] resize-none placeholder-gray-500 ${
                                    errors.content
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                rows={8}
                                placeholder="게시글 내용을 입력해주세요."
                                style={{
                                    color: errors.content
                                        ? "#dc2626"
                                        : "#1f2937",
                                }}
                                disabled={loading}
                            />
                        </div>
                        {errors.content && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? "작성 중..." : "게시글 생성"}
                        </button>
                    </div>
                </form>
            </div>
        </PageLayout>
    );
};

const CommunityCreate: React.FC = () => {
    return (
        <CommunityProvider>
            <CommunityCreateInner />
        </CommunityProvider>
    );
};

export default CommunityCreate;

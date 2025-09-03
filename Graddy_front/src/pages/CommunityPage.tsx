import React, { useMemo, useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import {
    CommunityProvider,
    useCommunityContext,
    PostType,
} from "../contexts/CommunityContext";
import { AuthContext } from "../contexts/AuthContext";
import Comments from "../components/community/Comments";
import CreatePostModal from "../components/community/CreatePostModal";
import { useModal } from "../hooks/useModal";
import { Search } from "lucide-react";
import { getUserFromToken } from "../utils/auth";

const SearchAndCreate: React.FC = () => {
    const { posts, loading, error, deletePost } = useCommunityContext();
    const authContext = useContext(AuthContext);
    const [searchField, setSearchField] = useState<"title" | "author">("title");
    const [query, setQuery] = useState("");
    const { isOpen, openModal, closeModal } = useModal();
    const navigate = useNavigate();
    const currentUser = getUserFromToken();

    // 댓글 확장 상태 관리
    const [expandedComments, setExpandedComments] = useState<Set<string>>(
        new Set()
    );

    // 드롭다운 상태 관리
    const [isFieldOpen, setIsFieldOpen] = useState(false);
    const fieldDropdownRef = useRef<HTMLDivElement>(null);

    const isLoggedIn = authContext?.isLoggedIn || false;

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                fieldDropdownRef.current &&
                !fieldDropdownRef.current.contains(event.target as Node)
            ) {
                setIsFieldOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filtered = useMemo(() => {
        return posts.filter((p) => {
            const field = searchField === "title" ? p.title : p.author;
            const q = query.trim().toLowerCase();
            const fieldOk = q === "" || field.toLowerCase().includes(q);
            return fieldOk;
        });
    }, [posts, searchField, query]);

    const handleDelete = async (postId: string) => {
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            try {
                await deletePost(postId);
            } catch (error) {
                alert("게시글 삭제에 실패했습니다.");
            }
        }
    };

    const toggleComments = (postId: string) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(postId)) {
            newExpanded.delete(postId);
        } else {
            newExpanded.add(postId);
        }
        setExpandedComments(newExpanded);
    };

    const fieldOptions = [
        { value: "title", label: "제목" },
        { value: "author", label: "작성자" },
    ];

    return (
        <div className="max-w-7xl mx-auto p-5 min-h-screen scrollbar-hide">
            <div className="flex gap-5 mb-8 items-center justify-center">
                <div className="flex gap-2.5">
                    {/* 검색 필드 드롭다운 */}
                    <div className="relative" ref={fieldDropdownRef}>
                        <button
                            onClick={() => setIsFieldOpen(!isFieldOpen)}
                            className={`px-4 py-2 rounded-xl bg-white text-gray-700 flex items-center justify-between border ${
                                isFieldOpen
                                    ? "border-2 border-[#8B85E9]"
                                    : "border-2 border-gray-300"
                            } focus:outline-none min-w-[100px]`}
                        >
                            <span>
                                {fieldOptions.find(
                                    (opt) => opt.value === searchField
                                )?.label || "제목"}
                            </span>
                            <svg
                                className={`w-4 h-4 transition-transform ${
                                    isFieldOpen ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {isFieldOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
                                {fieldOptions.map((option, index) => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            setSearchField(option.value as any);
                                            setIsFieldOpen(false);
                                        }}
                                        className={`px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                                            index !== fieldOptions.length - 1
                                                ? "border-b border-gray-100"
                                                : ""
                                        }`}
                                        style={{
                                            backgroundColor:
                                                searchField === option.value
                                                    ? "#E8E6FF"
                                                    : "#FFFFFF",
                                            color:
                                                searchField === option.value
                                                    ? "#8B85E9"
                                                    : "#374151",
                                        }}
                                    >
                                        <div className="font-medium">
                                            {option.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative w-[500px]">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="검색어를 입력하세요"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base outline-none"
                    />
                    <button
                        style={{ color: "#8B85E9" }}
                        className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-lg cursor-pointer"
                    >
                        <Search size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* 게시글 작성 버튼 (로그인 시에만) */}
                {isLoggedIn && (
                    <button
                        onClick={() => navigate("/community/create")}
                        className="px-6 py-2.5 bg-[#8B85E9] text-white rounded-lg font-medium hover:bg-[#7A74D8] transition-colors duration-200 flex items-center gap-2"
                    >
                        작성하기
                    </button>
                )}
            </div>

            {/* 로딩 상태 */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-gray-500 text-lg">로딩 중...</div>
                    </div>
                </div>
            )}

            {/* 에러 상태 */}
            {error && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-red-500 text-lg mb-2">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-[#8B85E9] text-white rounded-lg hover:bg-[#7A74D8] transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            )}

            {/* 게시글 목록 */}
            {!loading && !error && (
                <div className="flex flex-col gap-5">
                    {filtered.map((post) => (
                        <div
                            key={post.id}
                            className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* 게시글 헤더 */}
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="text-xs px-3 py-1 rounded-full font-bold"
                                            style={{
                                                color: "#8B85E9",
                                                backgroundColor: "#E8E6FF",
                                            }}
                                        >
                                            자유게시판
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {post.author}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {post.createdAt}
                                        </span>
                                    </div>

                                    {/* 삭제 버튼 - 본인 게시글만 표시 */}
                                    {currentUser &&
                                        post.author === currentUser.userId && (
                                            <button
                                                onClick={() =>
                                                    handleDelete(post.id)
                                                }
                                                className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        )}
                                </div>

                                {/* 게시글 제목 */}
                                <div className="text-lg font-bold text-gray-800 mb-2 cursor-pointer transition-colors duration-200">
                                    {post.title}
                                </div>

                                {/* 게시글 내용 */}
                                <div className="text-base text-gray-600 mb-4 whitespace-pre-line">
                                    {post.content}
                                </div>
                            </div>

                            {/* 댓글 섹션 */}
                            <Comments
                                postId={post.id}
                                isExpanded={expandedComments.has(post.id)}
                                onToggle={() => toggleComments(post.id)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* 게시글이 없는 경우 */}
            {!loading && !error && filtered.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-gray-400 text-lg mb-2">
                            {query
                                ? "검색 결과가 없습니다"
                                : "게시글이 없습니다"}
                        </div>
                        <div className="text-gray-300 text-sm">
                            {query
                                ? "다른 검색어를 시도해보세요!"
                                : "첫 번째 게시글을 작성해보세요!"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CommunityPageInner: React.FC = () => {
    return <SearchAndCreate />;
};

export const CommunityPage = () => {
    return (
        <PageLayout padding="none">
            <CommunityProvider>
                <CommunityPageInner />
            </CommunityProvider>
        </PageLayout>
    );
};

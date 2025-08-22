import React, { useState } from "react";
import { PostType } from "../../contexts/CommunityContext";
import { keyPress } from "../../utils/keyPress";
import { useDebounce, useThrottle } from "../../utils/eventLimiter";

interface CreatePostData {
    type: PostType;
    title: string;
    author: string;
    content: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: CreatePostData) => void;
}

const CreatePostModal: React.FC<Props> = ({ isOpen, onClose, onCreate }) => {
    const [type, setType] = useState<PostType>("project");
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState("");

    const debouncedSetTitle = useDebounce(setTitle, 150);
    const debouncedSetAuthor = useDebounce(setAuthor, 150);
    const debouncedSetContent = useDebounce(setContent, 150);

    const submit = () => {
        if (!title.trim() || !author.trim() || !content.trim()) {
            alert("제목, 작성자, 상세 내용을 모두 입력해주세요.");
            return;
        }
        onCreate({ type, title, author, content });
        onClose();
        setTitle("");
        setAuthor("");
        setContent("");
        setType("project");
    };

    const throttledSubmit = useThrottle(submit, 800);

    const onKeyDown = keyPress({
        onEnter: () => throttledSubmit(),
        onEscape: () => onClose(),
    });

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={onKeyDown}
                role="dialog"
                aria-modal="true"
            >
                <h2 className="text-lg font-semibold mb-4" style={{ color: "#8B85E9" }}>
                    게시글 생성
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as PostType)}
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="project">프로젝트</option>
                        <option value="study">스터디</option>
                    </select>
                    <input
                        placeholder="작성자"
                        onChange={(e) => debouncedSetAuthor(e.target.value)}
                        className="border rounded-lg px-3 py-2"
                    />
                    <input
                        placeholder="제목"
                        onChange={(e) => debouncedSetTitle(e.target.value)}
                        className="border rounded-lg px-3 py-2 sm:col-span-2"
                    />
                    <textarea
                        placeholder="상세 내용"
                        onChange={(e) => debouncedSetContent(e.target.value)}
                        className="border rounded-lg px-3 py-2 sm:col-span-2 min-h-[120px]"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
                    >
                        취소
                    </button>
                    <button
                        onClick={() => throttledSubmit()}
                        className="px-4 py-2 rounded-lg text-white"
                        style={{ backgroundColor: "#8B85E9" }}
                    >
                        생성하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;



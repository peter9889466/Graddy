import React, { useState } from "react";
import { useCommunityContext } from "../../contexts/CommunityContext";

interface Props {
    postId: string;
}

const Comments: React.FC<Props> = ({ postId }) => {
    const { getCommentsByPost, getRepliesByComment, addComment, addReply } = useCommunityContext();
    const [newComment, setNewComment] = useState("");
    const [newCommentAuthor, setNewCommentAuthor] = useState("");

    const comments = getCommentsByPost(postId);

    const handleAddComment = () => {
        if (!newComment.trim() || !newCommentAuthor.trim()) {
            alert("작성자와 내용을 입력하세요.");
            return;
        }
        addComment(postId, newComment, newCommentAuthor);
        setNewComment("");
        setNewCommentAuthor("");
    };

    return (
        <div className="space-y-4">
            <div className="rounded-xl p-4">
                <h3 className="text-base font-semibold mb-3" style={{ color: "#8B85E9" }}>댓글</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    <input value={newCommentAuthor} onChange={(e) => setNewCommentAuthor(e.target.value)} placeholder="작성자" className= "border rounded-lg px-3 py-2" />
                    <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="댓글 내용" className=" border rounded-lg px-3 py-2 sm:col-span-2" />
                </div>
                <button onClick={handleAddComment} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: "#8B85E9" }}>댓글 등록</button>
            </div>

            <div className="space-y-4">
                {comments.map((c) => (
                    <CommentItem key={c.id} commentId={c.id} postId={postId} />
                ))}
                {comments.length === 0 && (
                    <div className="text-center text-gray-500">아직 댓글이 없습니다.</div>
                )}
            </div>
        </div>
    );
};

const CommentItem: React.FC<{ commentId: string; postId: string }> = ({ commentId, postId }) => {
    const { getRepliesByComment, addReply, getCommentsByPost } = useCommunityContext();
    const comment = getCommentsByPost(postId).find((c) => c.id === commentId);
    const [replyAuthor, setReplyAuthor] = useState("");
    const [replyContent, setReplyContent] = useState("");

    if (!comment) return null;
    const replies = getRepliesByComment(commentId);

    const handleAddReply = () => {
        if (!replyAuthor.trim() || !replyContent.trim()) {
            alert("작성자와 내용을 입력하세요.");
            return;
        }
        addReply(postId, commentId, replyContent, replyAuthor);
        setReplyAuthor("");
        setReplyContent("");
    };

    return (
        <div className="rounded-xl p-4 ">
            <div className="flex items-start justify-between">
                <div>
                    <div className="font-medium">{comment.author}</div>
                    <div className="text-gray-700 whitespace-pre-line">{comment.content}</div>
                </div>
                <div className="text-sm text-gray-500">{comment.createdAt}</div>
            </div>

            {/* 대댓글 입력 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <input value={replyAuthor} onChange={(e) => setReplyAuthor(e.target.value)} placeholder="대댓글 작성자" className="border rounded-lg px-3 py-2" />
                <input value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="대댓글 내용" className="border rounded-lg px-3 py-2 sm:col-span-2" />
            </div>
            <button onClick={handleAddReply} className="mt-2 px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: "#8B85E9" }}>대댓글 등록</button>

            {/* 대댓글 리스트 */}
            <div className="mt-3 pl-4" >
                {replies.map((r) => (
                    <div key={r.id} className="py-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-sm font-medium">{r.author}</div>
                                <div className="text-sm text-gray-700 whitespace-pre-line">{r.content}</div>
                            </div>
                            <div className="text-xs text-gray-500">{r.createdAt}</div>
                        </div>
                    </div>
                ))}
                {replies.length === 0 && (
                    <div className="text-sm text-gray-500">대댓글이 없습니다.</div>
                )}
            </div>
        </div>
    );
};

export default Comments;



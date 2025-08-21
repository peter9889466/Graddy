import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, MoreHorizontal, Send, Edit, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  editedAt?: string;
}

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  comments: Comment[];
}

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: '김개발',
      content: '오늘 알고리즘 스터디에서 배운 내용을 정리해봤어요. 정말 유용한 팁들이 많았습니다!',
      timestamp: '2024-01-15 14:30',
      comments: [
        {
          id: '1-1',
          author: '이코딩',
          content: '정말 도움이 되는 내용이네요! 감사합니다.',
          timestamp: '2024-01-15 15:00'
        },
        {
          id: '1-2',
          author: '나',
          content: '저도 비슷한 경험이 있어서 공감됩니다.',
          timestamp: '2024-01-15 15:30'
        }
      ]
    },
    {
      id: '2',
      author: '이코딩',
      content: '프로젝트 기획서 작성 중인데, 혹시 좋은 아이디어 있으시면 댓글로 공유해주세요!',
      timestamp: '2024-01-15 13:45',
      comments: [
        {
          id: '2-1',
          author: '박스터디',
          content: '사용자 중심의 디자인을 고려해보세요!',
          timestamp: '2024-01-15 14:00'
        }
      ]
    },
    {
      id: '3',
      author: '박스터디',
      content: '다음 주 발표 준비하시는 분들 화이팅! 우리 모두 잘할 수 있을 거예요 💪',
      timestamp: '2024-01-15 12:20',
      comments: []
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // 댓글 관련 상태
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const handleSubmitPost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: '나',
      content: newPost,
      timestamp: new Date().toLocaleString('ko-KR'),
      comments: []
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setEditingPostId(postId);
      setEditContent(post.content);
      setOpenMenuId(null);
    }
  };

  const handleSaveEdit = () => {
    if (!editingPostId || !editContent.trim()) return;

    setPosts(prev => prev.map(post => 
      post.id === editingPostId 
        ? { ...post, content: editContent }
        : post
    ));
    setEditingPostId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
      setOpenMenuId(null);
    }
  };

  const toggleMenu = (postId: string) => {
    setOpenMenuId(openMenuId === postId ? null : postId);
  };

  // 댓글 관련 함수들
  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: '나',
      content: newComment,
      timestamp: new Date().toLocaleString('ko-KR')
    };

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));
    setNewComment('');
  };

  const handleEditComment = (postId: string, commentId: string) => {
    const post = posts.find(p => p.id === postId);
    const comment = post?.comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditCommentContent(comment.content);
    }
  };

  const handleSaveCommentEdit = (postId: string) => {
    if (!editingCommentId || !editCommentContent.trim()) return;

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            comments: post.comments.map(comment => 
              comment.id === editingCommentId 
                ? { 
                    ...comment, 
                    content: editCommentContent,
                    editedAt: new Date().toLocaleString('ko-KR')
                  }
                : comment
            )
          }
        : post
    ));
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
          : post
      ));
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(showComments === postId ? null : postId);
  };

  // 외부 클릭 감지
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-4 h-[61.5vh] overflow-y-auto p-4 pr-10">
      {/* 커뮤니티 제목 */}
      <h2 className="text-xl font-bold mb-6 -mt-4 -ml-4"
        style={{ color: "#8B85E9" }}>커뮤니티</h2>

      {/* 새 게시글 작성 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-[#8B85E9] rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">나</span>
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="스터디원들과 공유하고 싶은 내용을 작성해보세요..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmitPost}
                disabled={!newPost.trim()}
                className="px-4 py-2 bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>게시</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                         {/* 게시글 헤더 */}
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                   <span className="text-gray-600 font-medium text-sm">{post.author[0]}</span>
                 </div>
                 <div>
                   <p className="font-medium text-gray-900">{post.author}</p>
                   <p className="text-sm text-gray-500">{post.timestamp}</p>
                 </div>
               </div>
                               <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => toggleMenu(post.id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {/* 드롭다운 메뉴 */}
                  {openMenuId === post.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => handleEditPost(post.id)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>수정</span>
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>삭제</span>
                      </button>
                    </div>
                  )}
                </div>
             </div>

             {/* 게시글 내용 */}
             <div className="mb-4">
               {editingPostId === post.id ? (
                 <div className="space-y-2">
                   <textarea
                     value={editContent}
                     onChange={(e) => setEditContent(e.target.value)}
                     className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9]"
                     rows={3}
                   />
                   <div className="flex justify-end space-x-2">
                     <button
                       onClick={handleCancelEdit}
                       className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                     >
                       취소
                     </button>
                     <button
                       onClick={handleSaveEdit}
                       disabled={!editContent.trim()}
                       className="px-3 py-1 text-sm bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded transition-colors disabled:cursor-not-allowed"
                     >
                       저장
                     </button>
                   </div>
                 </div>
               ) : (
                 <p className="text-gray-800 leading-relaxed">{post.content}</p>
               )}
             </div>

                                                   {/* 게시글 액션 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments.length}</span>
                  </button>
                </div>
              </div>

              {/* 댓글 섹션 */}
              {showComments === post.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {/* 댓글 목록 */}
                  <div className="space-y-3 mb-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-medium text-xs">{comment.author[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            {comment.editedAt && (
                              <span className="text-xs text-gray-400">(수정됨: {comment.editedAt})</span>
                            )}
                          </div>
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] text-sm"
                                rows={2}
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleCancelCommentEdit}
                                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                                >
                                  취소
                                </button>
                                <button
                                  onClick={() => handleSaveCommentEdit(post.id)}
                                  disabled={!editCommentContent.trim()}
                                  className="px-2 py-1 text-xs bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded transition-colors disabled:cursor-not-allowed"
                                >
                                  저장
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                              {comment.author === '나' && (
                                <div className="flex items-center space-x-1 ml-2">
                                  <button
                                    onClick={() => handleEditComment(post.id, comment.id)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 새 댓글 작성 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-[#8B85E9] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-xs">나</span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 작성하세요..."
                        className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B85E9] focus:border-[#8B85E9] text-sm"
                        rows={2}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment.trim()}
                          className="px-3 py-1 text-sm bg-[#8B85E9] hover:bg-[#7A75D8] disabled:bg-gray-300 text-white rounded transition-colors disabled:cursor-not-allowed"
                        >
                          댓글 작성
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>

      {/* 게시글이 없을 때 */}
      {posts.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">아직 게시글이 없습니다</h3>
          <p className="text-gray-500">첫 번째 게시글을 작성해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default Community;

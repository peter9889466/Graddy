package com.smhrd.graddy.comment.dto;

import com.smhrd.graddy.comment.entity.Comment;
import lombok.Builder;
import lombok.Getter;

import java.sql.Timestamp;

/**
 * 댓글 응답 DTO
 * 클라이언트에게 전달되는 댓글 정보
 * 
 * 포함 정보:
 * - commentId: 댓글 ID
 * - userId: 사용자 ID
 * - nickname: 사용자 닉네임
 * - content: 댓글 내용
 * - createdAt: 댓글 작성일
 * - updatedAt: 댓글 수정일
 */
@Getter
@Builder
public class CommentResponse {

    /**
     * 댓글 ID
     */
    private Long commentId;
    
    /**
     * 사용자 ID
     */
    private String userId;
    
    /**
     * 사용자 닉네임
     */
    private String nickname;
    
    /**
     * 댓글 내용
     */
    private String content;
    
    /**
     * 댓글 작성일
     */
    private Timestamp createdAt;
    
    /**
     * 댓글 수정일
     */
    private Timestamp updatedAt;

    /**
     * Comment 엔티티를 CommentResponse DTO로 변환
     * 
     * @param comment 댓글 엔티티
     * @param nickname 사용자 닉네임
     * @return CommentResponse DTO
     */
    public static CommentResponse from(Comment comment, String nickname) {
        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .userId(comment.getUserId())
                .nickname(nickname)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}

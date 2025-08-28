package com.smhrd.graddy.comment.dto;

import com.smhrd.graddy.comment.entity.Comment;
import lombok.*;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 댓글 응답 DTO
 * 계층 구조를 포함하여 최상위 댓글과 대댓글을 구분
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {

    /**
     * 댓글 ID
     */
    private Long commentId;

    /**
     * 멤버 ID
     */
    private Long memberId;

    /**
     * 댓글 내용
     */
    private String content;

    /**
     * 부모 댓글 ID (대댓글인 경우)
     */
    private Long parentId;

    /**
     * 댓글 타입
     */
    private String commentType;

    /**
     * 게시판 ID
     */
    private Long postId;

    /**
     * 작성 시간
     */
    private Timestamp createdAt;

    /**
     * 수정 시간
     */
    private Timestamp updatedAt;

    /**
     * 대댓글 목록
     */
    private List<CommentResponse> children;

    /**
     * 댓글 엔티티를 DTO로 변환
     * @param comment 댓글 엔티티
     * @return 댓글 응답 DTO
     */
    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .memberId(comment.getMemberId())
                .content(comment.getContent())
                .parentId(comment.getParentId())
                .commentType(comment.getCommentType().getDescription())
                .postId(comment.getPostId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .children(comment.getChildren().stream()
                        .map(CommentResponse::from)
                        .collect(Collectors.toList()))
                .build();
    }
}

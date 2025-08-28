package com.smhrd.graddy.comment.dto;

import lombok.*;

/**
 * 댓글 작성/수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentRequest {

    /**
     * 댓글 내용
     */
    private String content;

    /**
     * 부모 댓글 ID (대댓글인 경우)
     */
    private Long parentId;

    /**
     * 과제 ID (과제 댓글인 경우)
     */
    private Long assignmentId;

    /**
     * 스터디게시판 ID (스터디게시판 댓글인 경우)
     */
    private Long stPrPostId;

    /**
     * 자유게시판 ID (자유게시판 댓글인 경우)
     */
    private Long frPostId;
}

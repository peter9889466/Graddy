package com.smhrd.graddy.comment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

/**
 * 댓글 엔티티
 * 과제, 자유게시판, 스터디게시판에서 모두 사용
 * 
 * 댓글 타입별 구분:
 * - 과제 댓글: assignment_id만 설정, 나머지 NULL
 * - 자유게시판 댓글: fr_post_id만 설정, 나머지 NULL
 * - 스터디게시판 댓글: st_pr_post_id만 설정, 나머지 NULL
 * 
 * 테이블 구조:
 * - comment_id: 댓글 ID (AUTO_INCREMENT, 단일 기본키)
 * - user_id: 사용자 ID (varchar)
 * - assignment_id: 과제 ID (선택적)
 * - st_pr_post_id: 스터디 커뮤니티 ID (선택적)
 * - fr_post_id: 자유 커뮤니티 ID (선택적)
 * - content: 댓글 내용 (TEXT)
 * - created_at: 등록 시간
 * - updated_at: 수정 시간
 */
@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(name = "st_pr_post_id")
    private Long stPrPostId;

    @Column(name = "fr_post_id")
    private Long frPostId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private Timestamp createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private Timestamp updatedAt;

    /**
     * 댓글 타입을 반환
     * @return 댓글 타입 (ASSIGNMENT, FREE_POST, STUDY_POST)
     */
    public CommentType getCommentType() {
        if (assignmentId != null) {
            return CommentType.ASSIGNMENT;
        } else if (frPostId != null) {
            return CommentType.FREE_POST;
        } else if (stPrPostId != null) {
            return CommentType.STUDY_POST;
        }
        return CommentType.UNKNOWN;
    }

    /**
     * 해당 게시판의 ID를 반환
     * @return 게시판 ID
     */
    public Long getPostId() {
        if (assignmentId != null) {
            return assignmentId;
        } else if (frPostId != null) {
            return frPostId;
        } else if (stPrPostId != null) {
            return frPostId;
        }
        return null;
    }

    /**
     * 댓글 타입 enum
     */
    public enum CommentType {
        ASSIGNMENT("과제"),
        FREE_POST("자유게시판"),
        STUDY_POST("스터디게시판"),
        UNKNOWN("알 수 없음");

        private final String description;

        CommentType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}

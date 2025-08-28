package com.smhrd.graddy.comment.repository;

import com.smhrd.graddy.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 댓글 레포지토리
 * 과제, 자유게시판, 스터디게시판의 댓글을 모두 관리
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * 과제의 모든 댓글 조회
     * @param assignmentId 과제 ID
     * @return 댓글 목록 (생성 시간 순)
     */
    @Query("SELECT c FROM Comment c WHERE c.assignmentId = :assignmentId ORDER BY c.createdAt ASC")
    List<Comment> findAllCommentsByAssignmentId(@Param("assignmentId") Long assignmentId);

    /**
     * 자유게시판의 모든 댓글 조회
     * @param frPostId 자유게시판 ID
     * @return 댓글 목록 (생성 시간 순)
     */
    @Query("SELECT c FROM Comment c WHERE c.frPostId = :frPostId ORDER BY c.createdAt ASC")
    List<Comment> findAllCommentsByFrPostId(@Param("frPostId") Long frPostId);

    /**
     * 스터디게시판의 모든 댓글 조회
     * @param stPrPostId 스터디게시판 ID
     * @return 댓글 목록 (생성 시간 순)
     */
    @Query("SELECT c FROM Comment c WHERE c.stPrPostId = :stPrPostId ORDER BY c.createdAt ASC")
    List<Comment> findAllCommentsByStPrPostId(@Param("stPrPostId") Long stPrPostId);

    /**
     * 특정 사용자가 작성한 댓글 목록 조회
     * @param userId 사용자 ID
     * @return 댓글 목록 (생성 시간 순)
     */
    @Query("SELECT c FROM Comment c WHERE c.userId = :userId ORDER BY c.createdAt DESC")
    List<Comment> findCommentsByUserId(@Param("userId") String userId);

    /**
     * 댓글 수 조회 (과제)
     * @param assignmentId 과제 ID
     * @return 댓글 수
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.assignmentId = :assignmentId")
    long countCommentsByAssignmentId(@Param("assignmentId") Long assignmentId);

    /**
     * 댓글 수 조회 (자유게시판)
     * @param frPostId 자유게시판 ID
     * @return 댓글 수
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.frPostId = :frPostId")
    long countCommentsByFrPostId(@Param("frPostId") Long frPostId);

    /**
     * 댓글 수 조회 (스터디게시판)
     * @param stPrPostId 스터디게시판 ID
     * @return 댓글 수
     */
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.stPrPostId = :stPrPostId")
    long countCommentsByStPrPostId(@Param("stPrPostId") Long stPrPostId);
}

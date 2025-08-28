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
     * 과제의 최상위 댓글만 조회 (대댓글 제외)
     * @param assignmentId 과제 ID
     * @return 최상위 댓글 목록
     */
    @Query("SELECT c FROM Comment c WHERE c.assignmentId = :assignmentId AND c.parentId IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findTopLevelCommentsByAssignmentId(@Param("assignmentId") Long assignmentId);

    /**
     * 자유게시판의 최상위 댓글만 조회 (대댓글 제외)
     * @param frPostId 자유게시판 ID
     * @return 최상위 댓글 목록
     */
    @Query("SELECT c FROM Comment c WHERE c.frPostId = :frPostId AND c.parentId IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findTopLevelCommentsByFrPostId(@Param("frPostId") Long frPostId);

    /**
     * 스터디게시판의 최상위 댓글만 조회 (대댓글 제외)
     * @param stPrPostId 스터디게시판 ID
     * @return 최상위 댓글 목록
     */
    @Query("SELECT c FROM Comment c WHERE c.stPrPostId = :stPrPostId AND c.parentId IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findTopLevelCommentsByStPrPostId(@Param("stPrPostId") Long stPrPostId);

    /**
     * 특정 댓글의 대댓글 목록 조회
     * @param parentId 부모 댓글 ID
     * @return 대댓글 목록
     */
    @Query("SELECT c FROM Comment c WHERE c.parentId = :parentId ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentId(@Param("parentId") Long parentId);

    /**
     * 과제의 모든 댓글 조회 (최상위 + 대댓글)
     * @param assignmentId 과제 ID
     * @return 모든 댓글 목록
     */
    @Query("SELECT c FROM Comment c WHERE c.assignmentId = :assignmentId ORDER BY c.parentId ASC NULLS FIRST, c.createdAt ASC")
    List<Comment> findAllCommentsByAssignmentId(@Param("assignmentId") Long assignmentId);

    /**
     * 자유게시판의 모든 댓글 조회 (최상위 + 대댓글)
     * @param frPostId 자유게시판 ID
     * @return 모든 댓글 목록
     */
    @Query("SELECT c FROM Comment c WHERE c.frPostId = :frPostId ORDER BY c.parentId ASC NULLS FIRST, c.createdAt ASC")
    List<Comment> findAllCommentsByFrPostId(@Param("frPostId") Long frPostId);

    /**
     * 스터디게시판의 모든 댓글 조회 (최상위 + 대댓글)
     * @param stPrPostId 스터디게시판 ID
     * @return 모든 댓글 목록
     */
    @Query("SELECT c FROM Comment c WHERE c.stPrPostId = :stPrPostId ORDER BY c.parentId ASC NULLS FIRST, c.createdAt ASC")
    List<Comment> findAllCommentsByStPrPostId(@Param("stPrPostId") Long stPrPostId);

    /**
     * 특정 멤버가 작성한 댓글 목록 조회
     * @param memberId 멤버 ID
     * @return 댓글 목록
     */
    @Query("SELECT c FROM Comment c WHERE c.memberId = :memberId ORDER BY c.createdAt DESC")
    List<Comment> findCommentsByMemberId(@Param("memberId") Long memberId);

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

package com.smhrd.graddy.comment.service;

import com.smhrd.graddy.comment.dto.CommentRequest;
import com.smhrd.graddy.comment.dto.CommentResponse;
import com.smhrd.graddy.comment.entity.Comment;
import com.smhrd.graddy.comment.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 댓글 서비스
 * 과제, 자유게시판, 스터디게시판의 댓글을 모두 관리
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;

    /**
     * 과제 댓글 작성
     * @param memberId 멤버 ID
     * @param request 댓글 요청 DTO
     * @return 작성된 댓글 응답 DTO
     */
    @Transactional
    public CommentResponse createAssignmentComment(Long memberId, CommentRequest request) {
        log.info("과제 댓글 작성 시작: memberId={}, assignmentId={}", memberId, request.getAssignmentId());
        
        Comment comment = Comment.builder()
                .memberId(memberId)
                .assignmentId(request.getAssignmentId())
                .content(request.getContent())
                .parentId(request.getParentId())
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        log.info("과제 댓글 작성 완료: commentId={}", savedComment.getCommentId());
        
        return CommentResponse.from(savedComment);
    }

    /**
     * 자유게시판 댓글 작성
     * @param memberId 멤버 ID
     * @param request 댓글 요청 DTO
     * @return 작성된 댓글 응답 DTO
     */
    @Transactional
    public CommentResponse createFreePostComment(Long memberId, CommentRequest request) {
        log.info("자유게시판 댓글 작성 시작: memberId={}, frPostId={}", memberId, request.getFrPostId());
        
        Comment comment = Comment.builder()
                .memberId(memberId)
                .frPostId(request.getFrPostId())
                .content(request.getContent())
                .parentId(request.getParentId())
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        log.info("자유게시판 댓글 작성 완료: commentId={}", savedComment.getCommentId());
        
        return CommentResponse.from(savedComment);
    }

    /**
     * 스터디게시판 댓글 작성
     * @param memberId 멤버 ID
     * @param request 댓글 요청 DTO
     * @return 작성된 댓글 응답 DTO
     */
    @Transactional
    public CommentResponse createStudyPostComment(Long memberId, CommentRequest request) {
        log.info("스터디게시판 댓글 작성 시작: memberId={}, stPrPostId={}", memberId, request.getStPrPostId());
        
        Comment comment = Comment.builder()
                .memberId(memberId)
                .stPrPostId(request.getStPrPostId())
                .content(request.getContent())
                .parentId(request.getParentId())
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        log.info("스터디게시판 댓글 작성 완료: commentId={}", savedComment.getCommentId());
        
        return CommentResponse.from(savedComment);
    }

    /**
     * 과제 댓글 목록 조회 (계층 구조 포함)
     * @param assignmentId 과제 ID
     * @return 댓글 응답 DTO 목록
     */
    public List<CommentResponse> getAssignmentComments(Long assignmentId) {
        log.info("과제 댓글 목록 조회 시작: assignmentId={}", assignmentId);
        
        List<Comment> topLevelComments = commentRepository.findTopLevelCommentsByAssignmentId(assignmentId);
        
        List<CommentResponse> responses = topLevelComments.stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
        
        log.info("과제 댓글 목록 조회 완료: count={}", responses.size());
        return responses;
    }

    /**
     * 자유게시판 댓글 목록 조회 (계층 구조 포함)
     * @param frPostId 자유게시판 ID
     * @return 댓글 응답 DTO 목록
     */
    public List<CommentResponse> getFreePostComments(Long frPostId) {
        log.info("자유게시판 댓글 목록 조회 시작: frPostId={}", frPostId);
        
        List<Comment> topLevelComments = commentRepository.findTopLevelCommentsByFrPostId(frPostId);
        
        List<CommentResponse> responses = topLevelComments.stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
        
        log.info("자유게시판 댓글 목록 조회 완료: count={}", responses.size());
        return responses;
    }

    /**
     * 스터디게시판 댓글 목록 조회 (계층 구조 포함)
     * @param stPrPostId 스터디게시판 ID
     * @return 댓글 응답 DTO 목록
     */
    public List<CommentResponse> getStudyPostComments(Long stPrPostId) {
        log.info("스터디게시판 댓글 목록 조회 시작: stPrPostId={}", stPrPostId);
        
        List<Comment> topLevelComments = commentRepository.findTopLevelCommentsByStPrPostId(stPrPostId);
        
        List<CommentResponse> responses = topLevelComments.stream()
                .map(CommentResponse::from)
                .collect(Collectors.toList());
        
        log.info("스터디게시판 댓글 목록 조회 완료: count={}", responses.size());
        return responses;
    }

    /**
     * 댓글 수정
     * @param commentId 댓글 ID
     * @param memberId 멤버 ID (권한 확인용)
     * @param content 수정할 내용
     * @return 수정된 댓글 응답 DTO
     */
    @Transactional
    public CommentResponse updateComment(Long commentId, Long memberId, String content) {
        log.info("댓글 수정 시작: commentId={}, memberId={}", commentId, memberId);
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다: " + commentId));
        
        // 권한 확인
        if (!comment.getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("댓글을 수정할 권한이 없습니다.");
        }
        
        comment.setContent(content);
        Comment updatedComment = commentRepository.save(comment);
        
        log.info("댓글 수정 완료: commentId={}", updatedComment.getCommentId());
        return CommentResponse.from(updatedComment);
    }

    /**
     * 댓글 삭제
     * @param commentId 댓글 ID
     * @param memberId 멤버 ID (권한 확인용)
     */
    @Transactional
    public void deleteComment(Long commentId, Long memberId) {
        log.info("댓글 삭제 시작: commentId={}, memberId={}", commentId, memberId);
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다: " + commentId));
        
        // 권한 확인
        if (!comment.getMemberId().equals(memberId)) {
            throw new IllegalArgumentException("댓글을 삭제할 권한이 없습니다.");
        }
        
        commentRepository.delete(comment);
        log.info("댓글 삭제 완료: commentId={}", commentId);
    }

    /**
     * 과제 댓글 수 조회
     * @param assignmentId 과제 ID
     * @return 댓글 수
     */
    public long getAssignmentCommentCount(Long assignmentId) {
        return commentRepository.countCommentsByAssignmentId(assignmentId);
    }

    /**
     * 자유게시판 댓글 수 조회
     * @param frPostId 자유게시판 ID
     * @return 댓글 수
     */
    public long getFreePostCommentCount(Long frPostId) {
        return commentRepository.countCommentsByFrPostId(frPostId);
    }

    /**
     * 스터디게시판 댓글 수 조회
     * @param stPrPostId 스터디게시판 ID
     * @return 댓글 수
     */
    public long getStudyPostCommentCount(Long stPrPostId) {
        return commentRepository.countCommentsByStPrPostId(stPrPostId);
    }
}

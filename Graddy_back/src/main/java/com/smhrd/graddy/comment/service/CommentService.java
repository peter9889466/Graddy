package com.smhrd.graddy.comment.service;

import com.smhrd.graddy.comment.dto.CommentRequest;
import com.smhrd.graddy.comment.dto.CommentResponse;
import com.smhrd.graddy.comment.entity.Comment;
import com.smhrd.graddy.comment.repository.CommentRepository;
import com.smhrd.graddy.user.repository.UserRepository;
import com.smhrd.graddy.study.repository.StudyProjectMemberRepository;
import com.smhrd.graddy.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
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
    private final UserRepository userRepository;
    private final StudyProjectMemberRepository studyProjectMemberRepository;
    private final PostRepository postRepository;

    /**
     * 과제 댓글 작성
     * @param userId 사용자 ID
     * @param assignmentId 과제 ID (URL 경로에서 추출)
     * @param request 댓글 요청 DTO
     * @return 작성된 댓글 응답 DTO
     * @throws IllegalArgumentException 해당 스터디의 멤버가 아닌 경우
     */
    @Transactional
    public CommentResponse createAssignmentComment(String userId, Long assignmentId, CommentRequest request) {
        log.info("과제 댓글 작성 시작: userId={}, assignmentId={}, studyProjectId={}", 
                userId, assignmentId, request.getStudyProjectId());
        
        // 과제 댓글 작성 시 스터디 멤버십 검증
        if (request.getStudyProjectId() != null) {
            validateStudyMembership(userId, request.getStudyProjectId());
            log.info("과제 댓글 작성 - 스터디 멤버십 검증 완료: userId={}, studyProjectId={}", 
                    userId, request.getStudyProjectId());
        } else {
            log.warn("과제 댓글 작성 시 studyProjectId가 제공되지 않음: userId={}, assignmentId={}", 
                    userId, assignmentId);
            throw new IllegalArgumentException("과제 댓글 작성 시 스터디/프로젝트 ID가 필요합니다.");
        }
        
        Comment comment = Comment.builder()
                .userId(userId)
                .assignmentId(assignmentId)
                .content(request.getContent())
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        log.info("과제 댓글 작성 완료: commentId={}", savedComment.getCommentId());
        
        // 닉네임 조회하여 응답 생성
        String nickname = getNicknameByUserId(userId);
        return CommentResponse.from(savedComment, nickname);
    }

    /**
     * 자유게시판 댓글 작성
     * @param userId 사용자 ID
     * @param frPostId 자유게시판 ID (URL 경로에서 추출)
     * @param request 댓글 요청 DTO
     * @return 작성된 댓글 응답 DTO
     */
    @Transactional
    public CommentResponse createFreePostComment(String userId, Long frPostId, CommentRequest request) {
        log.info("자유게시판 댓글 작성 시작: userId={}, frPostId={}", userId, frPostId);
        
        Comment comment = Comment.builder()
                .userId(userId)
                .frPostId(frPostId)
                .content(request.getContent())
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        log.info("자유게시판 댓글 작성 완료: commentId={}", savedComment.getCommentId());
        
        // 닉네임 조회하여 응답 생성
        String nickname = getNicknameByUserId(userId);
        return CommentResponse.from(savedComment, nickname);
    }

    /**
     * 스터디게시판 댓글 작성 (멤버십 검증 포함)
     * @param userId 사용자 ID
     * @param stPrPostId 스터디 커뮤니티 ID (URL 경로에서 추출)
     * @param request 댓글 요청 DTO
     * @return 작성된 댓글 응답 DTO
     * @throws IllegalArgumentException 해당 스터디의 멤버가 아닌 경우
     */
    @Transactional
    public CommentResponse createStudyPostComment(String userId, Long stPrPostId, CommentRequest request) {
        log.info("스터디게시판 댓글 작성 시작: userId={}, stPrPostId={}", userId, stPrPostId);
        
        // 1. 스터디 멤버십 검증
        validateStudyMembership(userId, stPrPostId);
        
        Comment comment = Comment.builder()
                .userId(userId)
                .stPrPostId(stPrPostId)
                .content(request.getContent())
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        log.info("스터디게시판 댓글 작성 완료: commentId={}", savedComment.getCommentId());
        
        // 닉네임 조회하여 응답 생성
        String nickname = getNicknameByUserId(userId);
        return CommentResponse.from(savedComment, nickname);
    }

    /**
     * 스터디 멤버십 검증
     * 해당 사용자가 스터디의 멤버인지 확인
     * 
     * @param userId 사용자 ID
     * @param stPrPostId 스터디 커뮤니티 게시글 ID
     * @throws IllegalArgumentException 멤버가 아닌 경우
     */
    private void validateStudyMembership(String userId, Long stPrPostId) {
        log.info("🔍 스터디 멤버십 검증 시작: userId={}, stPrPostId={}", userId, stPrPostId);
        
        try {
            // 게시글 ID로 스터디 ID 조회
            Long studyProjectId = getStudyProjectIdByPostId(stPrPostId);
            log.info("🔍 게시글 ID {}로 조회된 스터디 ID: {}", stPrPostId, studyProjectId);
            
            if (studyProjectId == null) {
                log.warn("❌ 게시글에 해당하는 스터디를 찾을 수 없음: stPrPostId={}", stPrPostId);
                throw new IllegalArgumentException("해당 게시글의 스터디를 찾을 수 없습니다.");
            }
            
            // 해당 스터디의 모든 멤버 조회 (디버깅용)
            List<com.smhrd.graddy.member.entity.Member> allMembers = 
                    studyProjectMemberRepository.findByStudyProjectIdOrderByJoinedAtAsc(studyProjectId);
            log.info("🔍 스터디 {}의 모든 멤버 수: {}", studyProjectId, allMembers.size());
            for (com.smhrd.graddy.member.entity.Member member : allMembers) {
                log.info("  - 멤버: memberId={}, userId={}, memberType={}, status={}", 
                        member.getMemberId(), member.getUserId(), member.getMemberType(), member.getStudyProjectCheck());
            }
            
            // 스터디 멤버십 확인
            Optional<com.smhrd.graddy.member.entity.Member> memberOpt = 
                    studyProjectMemberRepository.findByUserIdAndStudyProjectId(userId, studyProjectId);
            
            log.info("🔍 사용자 {}의 멤버십 검색 결과: {}", userId, memberOpt.isPresent() ? "존재함" : "존재하지 않음");
            
            if (memberOpt.isEmpty()) {
                log.warn("❌ 스터디 멤버가 아님: userId={}, studyProjectId={}", userId, studyProjectId);
                throw new IllegalArgumentException("해당 스터디의 멤버가 아니므로 댓글을 작성할 수 없습니다.");
            }
            
            com.smhrd.graddy.member.entity.Member member = memberOpt.get();
            log.info("✅ 스터디 멤버십 검증 완료: userId={}, studyProjectId={}, memberId={}, memberType={}, status={}", 
                    userId, studyProjectId, member.getMemberId(), member.getMemberType(), member.getStudyProjectCheck());
            
        } catch (IllegalArgumentException e) {
            // 이미 검증된 예외는 그대로 던지기
            log.error("❌ 멤버십 검증 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ 스터디 멤버십 검증 중 오류 발생: userId={}, stPrPostId={}", userId, stPrPostId, e);
            throw new IllegalArgumentException("스터디 멤버십 확인 중 오류가 발생했습니다.");
        }
    }

    /**
     * 게시글 ID로 스터디 ID 조회
     * 
     * @param stPrPostId 스터디 커뮤니티 게시글 ID
     * @return 스터디 ID
     */
    private Long getStudyProjectIdByPostId(Long stPrPostId) {
        try {
            Optional<com.smhrd.graddy.post.entity.Post> postOpt = postRepository.findById(stPrPostId);
            if (postOpt.isPresent()) {
                return postOpt.get().getStudyProjectId();
            }
            return null;
        } catch (Exception e) {
            log.error("게시글 ID로 스터디 ID 조회 중 오류 발생: stPrPostId={}", stPrPostId, e);
            return null;
        }
    }

    /**
     * 과제 댓글 목록 조회
     * @param assignmentId 과제 ID
     * @return 댓글 응답 DTO 목록 (닉네임 포함)
     */
    public List<CommentResponse> getAssignmentComments(Long assignmentId) {
        log.info("과제 댓글 목록 조회 시작: assignmentId={}", assignmentId);
        
        List<Comment> comments = commentRepository.findAllCommentsByAssignmentId(assignmentId);
        
        List<CommentResponse> responses = comments.stream()
                .map(comment -> {
                    String nickname = getNicknameByUserId(comment.getUserId());
                    return CommentResponse.from(comment, nickname);
                })
                .collect(Collectors.toList());
        
        log.info("과제 댓글 목록 조회 완료: count={}", responses.size());
        return responses;
    }

    /**
     * 자유게시판 댓글 목록 조회
     * @param frPostId 자유게시판 ID
     * @return 댓글 응답 DTO 목록 (닉네임 포함)
     */
    public List<CommentResponse> getFreePostComments(Long frPostId) {
        log.info("자유게시판 댓글 목록 조회 시작: frPostId={}", frPostId);
        
        List<Comment> comments = commentRepository.findAllCommentsByFrPostId(frPostId);
        
        List<CommentResponse> responses = comments.stream()
                .map(comment -> {
                    String nickname = getNicknameByUserId(comment.getUserId());
                    return CommentResponse.from(comment, nickname);
                })
                .collect(Collectors.toList());
        
        log.info("자유게시판 댓글 목록 조회 완료: count={}", responses.size());
        return responses;
    }

    /**
     * 스터디게시판 댓글 목록 조회
     * @param stPrPostId 스터디게시판 ID
     * @return 댓글 응답 DTO 목록 (닉네임 포함)
     */
    public List<CommentResponse> getStudyPostComments(Long stPrPostId) {
        log.info("스터디게시판 댓글 목록 조회 시작: stPrPostId={}", stPrPostId);
        
        List<Comment> comments = commentRepository.findAllCommentsByStPrPostId(stPrPostId);
        
        List<CommentResponse> responses = comments.stream()
                .map(comment -> {
                    String nickname = getNicknameByUserId(comment.getUserId());
                    return CommentResponse.from(comment, nickname);
                })
                .collect(Collectors.toList());
        
        log.info("스터디게시판 댓글 목록 조회 완료: count={}", responses.size());
        return responses;
    }

    /**
     * 댓글 수정
     * @param commentId 댓글 ID
     * @param userId 사용자 ID (권한 확인용)
     * @param content 수정할 내용
     * @return 수정된 댓글 응답 DTO
     */
    @Transactional
    public CommentResponse updateComment(Long commentId, String userId, String content) {
        log.info("댓글 수정 시작: commentId={}, userId={}", commentId, userId);
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다: " + commentId));
        
        // 권한 확인 - 본인이 작성한 댓글만 수정 가능
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("댓글을 수정할 권한이 없습니다.");
        }
        
        // 스터디 댓글인 경우 멤버십 추가 검증
        if (comment.getStPrPostId() != null) {
            validateStudyMembership(userId, comment.getStPrPostId());
        }
        
        comment.setContent(content);
        Comment updatedComment = commentRepository.save(comment);
        
        log.info("댓글 수정 완료: commentId={}", updatedComment.getCommentId());
        
        // 닉네임 조회하여 응답 생성
        String nickname = getNicknameByUserId(userId);
        return CommentResponse.from(updatedComment, nickname);
    }

    /**
     * 댓글 삭제
     * @param commentId 댓글 ID
     * @param userId 사용자 ID (권한 확인용)
     */
    @Transactional
    public void deleteComment(Long commentId, String userId) {
        log.info("댓글 삭제 시작: commentId={}, userId={}", commentId, userId);
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다: " + commentId));
        
        // 권한 확인 - 본인이 작성한 댓글만 삭제 가능
        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("댓글을 삭제할 권한이 없습니다.");
        }
        
        // 스터디 댓글인 경우 멤버십 추가 검증
        // if (comment.getStPrPostId() != null) {
        //     validateStudyMembership(userId, comment.getStPrPostId());
        // }
        
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

    /**
     * 사용자 ID를 통해 닉네임을 조회
     * @param userId 사용자 ID
     * @return 사용자 닉네임, 조회 실패 시 "알 수 없음"
     */
    private String getNicknameByUserId(String userId) {
        try {
            Optional<com.smhrd.graddy.user.entity.User> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                log.warn("사용자 정보를 찾을 수 없음: userId={}", userId);
                return "알 수 없음";
            }
            
            String nickname = userOpt.get().getNick();
            log.debug("사용자 닉네임 조회 성공: userId={}, nickname={}", userId, nickname);
            
            return nickname;
            
        } catch (Exception e) {
            log.error("사용자 닉네임 조회 중 오류 발생: userId={}", userId, e);
            return "알 수 없음";
        }
    }
}

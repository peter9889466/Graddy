package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.SubmissionRequest;
import com.smhrd.graddy.assignment.dto.SubmissionResponse;
import com.smhrd.graddy.assignment.entity.Submission;
import com.smhrd.graddy.assignment.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final FeedbackService feedbackService;

    /**
     * 과제 제출 및 자동 AI 피드백 생성
     */
    @Transactional
    public SubmissionResponse submitAssignment(SubmissionRequest request) {
        try {
            log.info("과제 제출 시작: assignmentId={}, memberId={}", 
                    request.getAssignmentId(), request.getMemberId());

            // 1. 과제 제출 저장
            Submission submission = new Submission();
            submission.setAssignmentId(request.getAssignmentId());
            submission.setMemberId(request.getMemberId());
            submission.setContent(request.getContent());
            submission.setFileUrl(request.getFileUrl());
            submission.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));

            Submission savedSubmission = submissionRepository.save(submission);
            log.info("과제 제출 완료: submissionId={}", savedSubmission.getSubmissionId());

            // 2. 새로 제출된 과제에 대해서만 AI 피드백 생성 (비동기로 처리하여 제출 응답 지연 방지)
            try {
                generateAiFeedbackAsync(savedSubmission);
            } catch (Exception e) {
                log.warn("자동 AI 피드백 생성 실패: submissionId={}, error={}", 
                        savedSubmission.getSubmissionId(), e.getMessage());
            }

            return convertToResponse(savedSubmission);

        } catch (Exception e) {
            log.error("과제 제출 중 오류 발생", e);
            throw new RuntimeException("과제 제출에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 비동기로 AI 피드백 생성 (제출 응답 지연 방지)
     */
    private void generateAiFeedbackAsync(Submission submission) {
        // 별도 스레드에서 AI 피드백 생성
        new Thread(() -> {
            try {
                log.info("AI 피드백 자동 생성 시작: submissionId={}", submission.getSubmissionId());
                
                // FeedbackService를 통해 AI 피드백 생성 및 저장
                feedbackService.generateFeedbackForSubmission(submission);
                
                log.info("AI 피드백 자동 생성 완료: submissionId={}", submission.getSubmissionId());
                
            } catch (Exception e) {
                log.error("AI 피드백 자동 생성 실패: submissionId={}, error={}", 
                        submission.getSubmissionId(), e.getMessage());
            }
        }).start();
    }

    /**
     * 과제별 제출 목록 조회
     */
    public List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId);
        return submissions.stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * 멤버별 제출 목록 조회
     */
    public List<SubmissionResponse> getSubmissionsByMember(Long memberId) {
        List<Submission> submissions = submissionRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
        return submissions.stream()
                .map(this::convertToResponse)
                .toList();
    }

    /**
     * 특정 과제의 특정 멤버 제출 조회
     */
    public SubmissionResponse getSubmissionByAssignmentAndMember(Long assignmentId, Long memberId) {
        Submission submission = submissionRepository.findByAssignmentIdAndMemberId(assignmentId, memberId)
                .orElseThrow(() -> new IllegalArgumentException("제출을 찾을 수 없습니다."));
        return convertToResponse(submission);
    }

    /**
     * 과제별 제출 수 조회
     */
    public Long getSubmissionCountByAssignment(Long assignmentId) {
        return submissionRepository.countByAssignmentId(assignmentId);
    }

    /**
     * Entity를 Response DTO로 변환
     */
    private SubmissionResponse convertToResponse(Submission submission) {
        return new SubmissionResponse(
                submission.getSubmissionId(),
                submission.getAssignmentId(),
                submission.getMemberId(),
                submission.getContent(),
                submission.getFileUrl(),
                submission.getCreatedAt()
        );
    }
}

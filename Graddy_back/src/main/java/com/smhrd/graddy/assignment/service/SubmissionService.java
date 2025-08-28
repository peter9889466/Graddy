package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.SubmissionRequest;
import com.smhrd.graddy.assignment.dto.SubmissionResponse;
import com.smhrd.graddy.assignment.entity.Submission;
import com.smhrd.graddy.assignment.entity.Assignment;
import com.smhrd.graddy.assignment.repository.SubmissionRepository;
import com.smhrd.graddy.assignment.repository.AssignmentRepository;
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
    private final AssignmentRepository assignmentRepository;
    private final FeedbackService feedbackService;

    /**
     * 과제 제출 및 자동 AI 피드백 생성
     */
    @Transactional
    public SubmissionResponse submitAssignment(SubmissionRequest request) {
        try {
            log.info("과제 제출 시작: assignmentId={}, memberId={}", 
                    request.getAssignmentId(), request.getMemberId());

            // 0. 과제 존재 여부 미리 확인
            if (!assignmentRepository.existsById(request.getAssignmentId())) {
                log.error("과제 제출 실패: 존재하지 않는 과제입니다. assignmentId={}", request.getAssignmentId());
                throw new IllegalArgumentException("존재하지 않는 과제입니다: " + request.getAssignmentId());
            }

            // 1. 과제 제출 저장
            Submission submission = new Submission();
            submission.setAssignmentId(request.getAssignmentId());
            submission.setMemberId(request.getMemberId());
            submission.setContent(request.getContent());
            submission.setFileUrl(request.getFileUrl());
            submission.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));

            Submission savedSubmission = submissionRepository.save(submission);
            log.info("과제 제출 완료: submissionId={}", savedSubmission.getSubmissionId());

            // 2. 과제 제출이 성공적으로 저장되었는지 확인
            if (savedSubmission.getSubmissionId() == null) {
                log.error("과제 제출 저장 실패: submissionId가 null입니다.");
                throw new RuntimeException("과제 제출 저장에 실패했습니다.");
            }

            // 3. 과제 제출 완료 후 AI 피드백 생성 (비동기로 처리하여 제출 응답 지연 방지)
            try {
                log.info("과제 제출 완료 확인됨. AI 피드백 생성 시작: submissionId={}", savedSubmission.getSubmissionId());
                generateAiFeedbackAsync(savedSubmission);
            } catch (Exception e) {
                log.warn("자동 AI 피드백 생성 실패: submissionId={}, error={}. 과제 제출은 성공했습니다.", 
                        savedSubmission.getSubmissionId(), e.getMessage());
                // AI 피드백 생성 실패는 과제 제출 실패로 처리하지 않음
            }

            log.info("과제 제출 프로세스 완료: submissionId={}", savedSubmission.getSubmissionId());
            return convertToResponse(savedSubmission);

        } catch (Exception e) {
            log.error("과제 제출 중 오류 발생", e);
            throw new RuntimeException("과제 제출에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 과제 제출 완료 후 AI 피드백 생성 (비동기 처리)
     * 과제 제출이 성공적으로 완료된 후에만 호출됩니다.
     */
    private void generateAiFeedbackAsync(Submission submission) {
        // 과제 제출이 완료된 후에만 AI 피드백 생성
        if (submission == null || submission.getSubmissionId() == null) {
            log.error("AI 피드백 생성 실패: 유효하지 않은 submission 정보");
            return;
        }

        // 별도 스레드에서 AI 피드백 생성 (과제 제출 응답 지연 방지)
        new Thread(() -> {
            try {
                log.info("과제 제출 완료 확인됨. AI 피드백 생성 시작: submissionId={}", submission.getSubmissionId());
                
                // 과제 제출 완료 후 AI 피드백 생성 및 저장
                feedbackService.generateFeedbackForSubmission(submission);
                
                log.info("AI 피드백 생성 완료: submissionId={}", submission.getSubmissionId());
                
            } catch (Exception e) {
                log.error("AI 피드백 생성 실패: submissionId={}, error={}. 과제 제출은 이미 완료되었습니다.", 
                        submission.getSubmissionId(), e.getMessage());
                // AI 피드백 생성 실패는 과제 제출에 영향을 주지 않음
                // 과제 제출은 성공적으로 완료되었으므로 사용자에게는 정상적으로 응답됨
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

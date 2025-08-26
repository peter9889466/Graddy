package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.AssignmentRequest;
import com.smhrd.graddy.assignment.dto.AssignmentResponse;
import com.smhrd.graddy.assignment.dto.AssignmentUpdateRequest;
import com.smhrd.graddy.assignment.entity.Assignment;
import com.smhrd.graddy.assignment.repository.AssignmentRepository;
import com.smhrd.graddy.member.service.MemberService;
import com.smhrd.graddy.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.smhrd.graddy.assignment.dto.AssignmentDetailResponse;
import com.smhrd.graddy.assignment.dto.SubmissionDetailResponse;
import com.smhrd.graddy.assignment.dto.FeedbackDetailResponse;
import com.smhrd.graddy.assignment.entity.Submission;
import com.smhrd.graddy.assignment.entity.Feedback;
import com.smhrd.graddy.assignment.repository.SubmissionRepository;
import com.smhrd.graddy.assignment.repository.FeedbackRepository;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final MemberService memberService;
    private final ScheduleService scheduleService;
    private final SubmissionRepository submissionRepository;
    private final FeedbackRepository feedbackRepository;

    /**
     * 과제 생성 (자동 일정 추가 포함)
     */
    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request, String userId) {
        // 사용자가 해당 스터디/프로젝트의 리더인지 확인
        if (!memberService.isLeader(request.getStudyProjectId(), userId)) {
            throw new IllegalArgumentException("과제 생성은 스터디/프로젝트 리더만 가능합니다.");
        }

        // 사용자의 member_id 조회
        Long memberId = memberService.getMemberIdByUserIdAndStudyProjectId(userId, request.getStudyProjectId());
        if (memberId == null) {
            throw new IllegalArgumentException("해당 스터디/프로젝트의 멤버가 아닙니다.");
        }

        // 마감일이 설정되지 않은 경우 기본값으로 생성일로부터 7일 뒤로 설정
        Timestamp deadline = request.getDeadline();
        if (deadline == null) {
            LocalDateTime defaultDeadline = LocalDateTime.now().plusDays(7);
            deadline = Timestamp.valueOf(defaultDeadline);
        }

        Assignment assignment = new Assignment();
        assignment.setStudyProjectId(request.getStudyProjectId());
        assignment.setMemberId(memberId);
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDeadline(deadline);
        assignment.setFileUrl(request.getFileUrl());

        Assignment savedAssignment = assignmentRepository.save(assignment);

                // 과제 생성 후 자동으로 일정 추가
        try {
            scheduleService.createAssignmentSchedule(
                userId, 
                request.getStudyProjectId(), 
                request.getTitle(), 
                request.getDeadline().toLocalDateTime()
            );
            log.info("과제 제출일 일정 자동 생성 완료: assignmentId={}", savedAssignment.getAssignmentId());
        } catch (Exception e) {
            log.warn("과제 제출일 일정 자동 생성 실패: assignmentId={}", savedAssignment.getAssignmentId(), e);
            // 일정 생성 실패해도 과제 생성은 성공으로 처리
        }

        return convertToResponse(savedAssignment);
    }

    // 과제 조회
    public AssignmentResponse getAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("과제를 찾을 수 없습니다: " + assignmentId));
        return convertToResponse(assignment);
    }

    // 스터디별 과제 목록 조회
    public List<AssignmentResponse> getAssignmentsByStudyProject(Long studyProjectId) {
        List<Assignment> assignments = assignmentRepository.findByStudyProjectIdOrderByCreatedAtDesc(studyProjectId);
        return assignments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 멤버별 과제 목록 조회
    public List<AssignmentResponse> getAssignmentsByMember(Long memberId) {
        List<Assignment> assignments = assignmentRepository.findByMemberIdOrderByCreatedAtDesc(memberId);
        return assignments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 스터디 ID로 과제 전체 정보 조회 (과제, 제출물, 피드백 포함)
     * @param studyProjectId 스터디 프로젝트 ID
     * @return 과제 전체 정보 리스트
     */
    public List<AssignmentDetailResponse> getAssignmentsWithDetailsByStudyProject(Long studyProjectId) {
        log.info("스터디 과제 전체 정보 조회 시작: studyProjectId={}", studyProjectId);
        
        // 1. 해당 스터디의 모든 과제 조회
        List<Assignment> assignments = assignmentRepository.findByStudyProjectId(studyProjectId);
        log.info("과제 조회 완료: {}개", assignments.size());
        
        List<AssignmentDetailResponse> responses = new ArrayList<>();
        
        for (Assignment assignment : assignments) {
            try {
                // 2. 각 과제의 제출물 조회
                List<Submission> submissions = submissionRepository.findByAssignmentId(assignment.getAssignmentId());
                log.info("과제 ID {} 제출물 조회 완료: {}개", assignment.getAssignmentId(), submissions.size());
                
                List<SubmissionDetailResponse> submissionResponses = new ArrayList<>();
                
                for (Submission submission : submissions) {
                    try {
                        // 3. 각 제출물의 피드백 조회
                        List<Feedback> feedbacks = feedbackRepository.findBySubmissionId(submission.getSubmissionId());
                        log.info("제출물 ID {} 피드백 조회 완료: {}개", submission.getSubmissionId(), feedbacks.size());
                        
                        // 피드백 정보 변환
                        List<FeedbackDetailResponse> feedbackResponses = feedbacks.stream()
                                .map(feedback -> FeedbackDetailResponse.builder()
                                        .feedId(feedback.getFeedId())
                                        .memberId(feedback.getMemberId())
                                        .submissionId(feedback.getSubmissionId())
                                        .score(feedback.getScore())
                                        .comment(feedback.getComment())
                                        .createdAt(feedback.getCreatedAt())
                                        .build())
                                .collect(Collectors.toList());
                        
                        // 제출물 정보 변환
                        SubmissionDetailResponse submissionResponse = SubmissionDetailResponse.builder()
                                .submissionId(submission.getSubmissionId())
                                .assignmentId(submission.getAssignmentId())
                                .memberId(submission.getMemberId())
                                .content(submission.getContent())
                                .fileUrl(submission.getFileUrl())
                                .createdAt(submission.getCreatedAt())
                                .feedbacks(feedbackResponses)
                                .feedbackMessage(feedbacks.isEmpty() ? "아직 피드백이 없습니다." : null)
                                .build();
                        
                        submissionResponses.add(submissionResponse);
                        
                    } catch (Exception e) {
                        log.error("제출물 ID {} 피드백 조회 실패: {}", submission.getSubmissionId(), e.getMessage());
                        // 피드백 조회 실패 시에도 제출물은 포함
                        SubmissionDetailResponse submissionResponse = SubmissionDetailResponse.builder()
                                .submissionId(submission.getSubmissionId())
                                .assignmentId(submission.getAssignmentId())
                                .memberId(submission.getMemberId())
                                .content(submission.getContent())
                                .fileUrl(submission.getFileUrl())
                                .createdAt(submission.getCreatedAt())
                                .feedbacks(new ArrayList<>())
                                .feedbackMessage("피드백 조회에 실패했습니다.")
                                .build();
                        
                        submissionResponses.add(submissionResponse);
                    }
                }
                
                // 과제 정보 변환
                AssignmentDetailResponse assignmentResponse = AssignmentDetailResponse.builder()
                        .assignmentId(assignment.getAssignmentId())
                        .studyProjectId(assignment.getStudyProjectId())
                        .memberId(assignment.getMemberId())
                        .title(assignment.getTitle())
                        .description(assignment.getDescription())
                        .deadline(assignment.getDeadline())
                        .fileUrl(assignment.getFileUrl())
                        .createdAt(assignment.getCreatedAt())
                        .submissions(submissionResponses)
                        .submissionMessage(submissions.isEmpty() ? "아직 제출물이 없습니다." : null)
                        .build();
                
                responses.add(assignmentResponse);
                
            } catch (Exception e) {
                log.error("과제 ID {} 제출물 조회 실패: {}", assignment.getAssignmentId(), e.getMessage());
                // 제출물 조회 실패 시에도 과제는 포함
                AssignmentDetailResponse assignmentResponse = AssignmentDetailResponse.builder()
                        .assignmentId(assignment.getAssignmentId())
                        .studyProjectId(assignment.getStudyProjectId())
                        .memberId(assignment.getMemberId())
                        .title(assignment.getTitle())
                        .description(assignment.getDescription())
                        .deadline(assignment.getDeadline())
                        .fileUrl(assignment.getFileUrl())
                        .createdAt(assignment.getCreatedAt())
                        .submissions(new ArrayList<>())
                        .submissionMessage("제출물 조회에 실패했습니다.")
                        .build();
                
                responses.add(assignmentResponse);
            }
        }
        
        log.info("스터디 과제 전체 정보 조회 완료: {}개 과제", responses.size());
        return responses;
    }

    // 과제 수정
    @Transactional
    public AssignmentResponse updateAssignment(Long assignmentId, AssignmentUpdateRequest request, String userId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("과제를 찾을 수 없습니다: " + assignmentId));

        // 사용자가 해당 스터디/프로젝트의 리더인지 확인
        if (!memberService.isLeader(assignment.getStudyProjectId(), userId)) {
            throw new IllegalArgumentException("과제 수정은 스터디/프로젝트 리더만 가능합니다.");
        }

        // 사용자의 member_id 조회
        Long memberId = memberService.getMemberIdByUserIdAndStudyProjectId(userId, assignment.getStudyProjectId());
        if (memberId == null) {
            throw new IllegalArgumentException("해당 스터디/프로젝트의 멤버가 아닙니다.");
        }

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDeadline(request.getDeadline());
        assignment.setFileUrl(request.getFileUrl());

        Assignment updatedAssignment = assignmentRepository.save(assignment);
        return convertToResponse(updatedAssignment);
    }

    // 과제 삭제
    @Transactional
    public void deleteAssignment(Long assignmentId, String userId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("과제를 찾을 수 없습니다: " + assignmentId));

        // 사용자가 해당 스터디/프로젝트의 리더인지 확인
        if (!memberService.isLeader(assignment.getStudyProjectId(), userId)) {
            throw new IllegalArgumentException("과제 삭제는 스터디/프로젝트 리더만 가능합니다.");
        }

        // 사용자의 member_id 조회
        Long memberId = memberService.getMemberIdByUserIdAndStudyProjectId(userId, assignment.getStudyProjectId());
        if (memberId == null) {
            throw new IllegalArgumentException("해당 스터디/프로젝트의 멤버가 아닙니다.");
        }

        assignmentRepository.deleteById(assignmentId);
    }

    // Entity를 Response DTO로 변환
    private AssignmentResponse convertToResponse(Assignment assignment) {
        return new AssignmentResponse(
                assignment.getAssignmentId(),
                assignment.getStudyProjectId(),
                assignment.getMemberId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getDeadline(),
                assignment.getFileUrl(),
                assignment.getCreatedAt()
        );
    }
}

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

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final MemberService memberService;
    private final ScheduleService scheduleService;

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

package com.smhrd.graddy.assignment.service;

import com.smhrd.graddy.assignment.dto.AssignmentRequest;
import com.smhrd.graddy.assignment.dto.AssignmentResponse;
import com.smhrd.graddy.assignment.dto.AssignmentUpdateRequest;
import com.smhrd.graddy.assignment.entity.Assignment;
import com.smhrd.graddy.assignment.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    // 과제 생성
    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        Assignment assignment = new Assignment();
        assignment.setStudyId(request.getStudyId());
        assignment.setUserId(request.getUserId());
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDeadline(request.getDeadline());
        assignment.setFileUrl(request.getFileUrl());

        Assignment savedAssignment = assignmentRepository.save(assignment);
        return convertToResponse(savedAssignment);
    }

    // 과제 조회
    public AssignmentResponse getAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("과제를 찾을 수 없습니다: " + assignmentId));
        return convertToResponse(assignment);
    }

    // 스터디별 과제 목록 조회
    public List<AssignmentResponse> getAssignmentsByStudy(Long studyId) {
        List<Assignment> assignments = assignmentRepository.findByStudyIdOrderByCreatedAtDesc(studyId);
        return assignments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 사용자별 과제 목록 조회
    public List<AssignmentResponse> getAssignmentsByUser(String userId) {
        List<Assignment> assignments = assignmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return assignments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 과제 수정
    @Transactional
    public AssignmentResponse updateAssignment(Long assignmentId, AssignmentUpdateRequest request) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("과제를 찾을 수 없습니다: " + assignmentId));

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDeadline(request.getDeadline());
        assignment.setFileUrl(request.getFileUrl());

        Assignment updatedAssignment = assignmentRepository.save(assignment);
        return convertToResponse(updatedAssignment);
    }

    // 과제 삭제
    @Transactional
    public void deleteAssignment(Long assignmentId) {
        if (!assignmentRepository.existsById(assignmentId)) {
            throw new IllegalArgumentException("과제를 찾을 수 없습니다: " + assignmentId);
        }
        assignmentRepository.deleteById(assignmentId);
    }

    // Entity를 Response DTO로 변환
    private AssignmentResponse convertToResponse(Assignment assignment) {
        return new AssignmentResponse(
                assignment.getAssignmentId(),
                assignment.getStudyId(),
                assignment.getUserId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getDeadline(),
                assignment.getFileUrl(),
                assignment.getCreatedAt()
        );
    }
}

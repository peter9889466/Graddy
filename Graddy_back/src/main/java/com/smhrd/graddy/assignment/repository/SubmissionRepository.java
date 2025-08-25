package com.smhrd.graddy.assignment.repository;

import com.smhrd.graddy.assignment.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    // 과제별 제출 목록 조회
    List<Submission> findByAssignmentIdOrderByCreatedAtDesc(Long assignmentId);
    
    // 멤버별 제출 목록 조회
    List<Submission> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    
    // 특정 과제의 특정 멤버 제출 조회
    Optional<Submission> findByAssignmentIdAndMemberId(Long assignmentId, Long memberId);
    
    // 과제별 제출 수 조회
    long countByAssignmentId(Long assignmentId);
}

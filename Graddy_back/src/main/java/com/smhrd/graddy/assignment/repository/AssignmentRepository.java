package com.smhrd.graddy.assignment.repository;

import com.smhrd.graddy.assignment.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    // 스터디/프로젝트별 과제 목록 조회
    List<Assignment> findByStudyProjectIdOrderByCreatedAtDesc(Long studyProjectId);
    
    // 멤버별 과제 목록 조회
    List<Assignment> findByMemberIdOrderByCreatedAtDesc(Long memberId);
    
    // 스터디/프로젝트와 멤버별 과제 목록 조회
    List<Assignment> findByStudyProjectIdAndMemberIdOrderByCreatedAtDesc(Long studyProjectId, Long memberId);
    
    /**
     * 스터디 프로젝트 ID로 과제 목록 조회
     */
    List<Assignment> findByStudyProjectId(Long studyProjectId);
}

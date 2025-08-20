package com.smhrd.graddy.assignment.repository;

import com.smhrd.graddy.assignment.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    // 스터디별 과제 목록 조회
    List<Assignment> findByStudyIdOrderByCreatedAtDesc(Long studyId);
    
    // 사용자별 과제 목록 조회
    List<Assignment> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // 스터디와 사용자별 과제 목록 조회
    List<Assignment> findByStudyIdAndUserIdOrderByCreatedAtDesc(Long studyId, String userId);
}

package com.smhrd.graddy.study.repository;

import com.smhrd.graddy.study.entity.StudyProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyProjectStatusRepository extends JpaRepository<StudyProjectStatus, StudyProjectStatus.StudyProjectStatusId> {

    // 유저별 신청 상태 조회
    List<StudyProjectStatus> findByUserId(String userId);
    
    // 스터디/프로젝트별 신청 상태 조회
    List<StudyProjectStatus> findByStudyProjectId(Long studyProjectId);
    
    // 특정 상태의 신청 조회
    List<StudyProjectStatus> findByStatus(StudyProjectStatus.Status status);
    
    // 유저와 스터디/프로젝트로 특정 신청 조회
    Optional<StudyProjectStatus> findByUserIdAndStudyProjectId(String userId, Long studyProjectId);
    
    // 승인된 신청 조회
    List<StudyProjectStatus> findByStudyProjectIdAndStatus(Long studyProjectId, StudyProjectStatus.Status status);
    
    // 스터디/프로젝트 ID로 삭제
    void deleteByStudyProjectId(Long studyProjectId);
}

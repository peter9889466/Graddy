package com.smhrd.graddy.study.repository;

import com.smhrd.graddy.study.entity.StudyProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyProjectStatusRepository extends JpaRepository<StudyProjectStatus, StudyProjectStatus.StudyProjectStatusId> {
    
    /**
     * 사용자 ID로 신청 상태 조회
     */
    List<StudyProjectStatus> findByUserId(String userId);
    
    /**
     * 스터디 프로젝트 ID로 모든 신청 상태 조회
     */
    List<StudyProjectStatus> findByStudyProjectId(Long studyProjectId);
    
    /**
     * 사용자 ID와 스터디 프로젝트 ID로 신청 상태 존재 여부 확인
     */
    boolean existsByUserIdAndStudyProjectId(String userId, Long studyProjectId);
    
    /**
     * 사용자 ID와 스터디 프로젝트 ID로 신청 상태 조회
     */
    Optional<StudyProjectStatus> findByUserIdAndStudyProjectId(String userId, Long studyProjectId);
    
    /**
     * 사용자 ID로 신청한 스터디/프로젝트 ID 목록 조회
     */
    List<Long> findStudyProjectIdsByUserId(String userId);
    
    /**
     * 스터디 프로젝트 ID로 신청 상태 삭제
     */
    void deleteByStudyProjectId(Long studyProjectId);
}

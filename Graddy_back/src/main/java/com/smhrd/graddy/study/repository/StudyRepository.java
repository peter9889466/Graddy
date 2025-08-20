package com.smhrd.graddy.study.repository;

import com.smhrd.graddy.study.entity.Study;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyRepository extends JpaRepository<Study, Long> {
    
    // 모집중인 스터디 목록 조회
    List<Study> findByIsRecruitingOrderByCreatedAtDesc(String isRecruiting);
    
    // 사용자가 리더인 스터디 목록 조회
    List<Study> findByUserIdOrderByCreatedAtDesc(String userId);
    

    
    // 레벨별 스터디 목록 조회
    List<Study> findByStudyLevelOrderByCreatedAtDesc(Integer studyLevel);
    
    // 모집중이고 특정 레벨의 스터디 목록 조회
    List<Study> findByIsRecruitingAndStudyLevelOrderByCreatedAtDesc(String isRecruiting, Integer studyLevel);
    
    // 모든 스터디를 생성일 기준 내림차순으로 조회
    List<Study> findAllByOrderByCreatedAtDesc();
    
    // 통합 검색을 위한 메서드들
    // 제목, 스터디명, 설명으로 검색
    List<Study> findByStudyTitleContainingIgnoreCaseOrStudyNameContainingIgnoreCaseOrStudyDescContainingIgnoreCaseOrderByCreatedAtDesc(
            String studyTitle, String studyName, String studyDesc);
    
    // 작성자로 검색
    List<Study> findByUserIdContainingIgnoreCaseOrderByCreatedAtDesc(String userId);
}

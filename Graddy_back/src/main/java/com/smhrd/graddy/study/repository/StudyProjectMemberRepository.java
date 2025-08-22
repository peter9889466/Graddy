package com.smhrd.graddy.study.repository;

import com.smhrd.graddy.study.entity.StudyProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyProjectMemberRepository extends JpaRepository<StudyProjectMember, Long> {

    // 유저별 멤버십 조회
    List<StudyProjectMember> findByUserId(String userId);
    
    // 스터디/프로젝트별 멤버 조회
    List<StudyProjectMember> findByStudyProjectId(Long studyProjectId);
    
    // 특정 유저가 특정 스터디/프로젝트의 멤버인지 확인
    Optional<StudyProjectMember> findByUserIdAndStudyProjectId(String userId, Long studyProjectId);
    
    // 스터디/프로젝트의 멤버 수 조회
    long countByStudyProjectId(Long studyProjectId);
    
    // 스터디/프로젝트 ID로 삭제
    void deleteByStudyProjectId(Long studyProjectId);
    
    // 유저 ID로 삭제
    void deleteByUserId(String userId);
}

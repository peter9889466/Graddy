package com.smhrd.graddy.tag.repository;

import com.smhrd.graddy.tag.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    // 스터디/프로젝트별 태그 목록 조회 (새로운 구조)
    List<Tag> findByStudyProjectId(Long studyProjectId);
    
    // 관심 항목별 태그 목록 조회
    List<Tag> findByInterestId(Long interestId);
    
    // 스터디/프로젝트 ID로 태그 삭제
    void deleteByStudyProjectId(Long studyProjectId);
    
    // 관심 항목 ID로 태그 삭제
    void deleteByInterestId(Long interestId);
    
    /**
     * 특정 스터디/프로젝트의 관심 항목 ID 목록 조회
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 관심 항목 ID 목록
     */
    @Query("SELECT t.interestId FROM Tag t WHERE t.studyProjectId = :studyProjectId")
    List<Long> findInterestIdsByStudyProjectId(@Param("studyProjectId") Long studyProjectId);
    
    /**
     * 특정 관심 항목을 가진 스터디/프로젝트 ID 목록 조회
     * @param interestId 관심 항목 ID
     * @return 스터디/프로젝트 ID 목록
     */
    @Query("SELECT t.studyProjectId FROM Tag t WHERE t.interestId = :interestId")
    List<Long> findStudyProjectIdsByInterestId(@Param("interestId") Long interestId);
}

package com.smhrd.graddy.tag.repository;

import com.smhrd.graddy.tag.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
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
}

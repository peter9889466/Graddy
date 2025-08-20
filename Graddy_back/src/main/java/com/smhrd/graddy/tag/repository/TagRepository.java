package com.smhrd.graddy.tag.repository;

import com.smhrd.graddy.tag.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    
    // 스터디별 태그 목록 조회
    List<Tag> findByStudyIdOrderByTagName(String studyId);
    
    // 태그명으로 검색
    List<Tag> findByTagNameContainingIgnoreCaseOrderByTagName(String tagName);
    
    // 스터디 ID로 태그 삭제
    void deleteByStudyId(String studyId);
}

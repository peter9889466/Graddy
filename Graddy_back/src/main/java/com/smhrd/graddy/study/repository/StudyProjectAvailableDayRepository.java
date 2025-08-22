package com.smhrd.graddy.study.repository;

import com.smhrd.graddy.study.entity.StudyProjectAvailableDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyProjectAvailableDayRepository extends JpaRepository<StudyProjectAvailableDay, StudyProjectAvailableDay.StudyProjectAvailableDayId> {

    // 스터디/프로젝트별 선호 요일 조회
    List<StudyProjectAvailableDay> findByStudyProjectId(Long studyProjectId);
    
    // 요일별 스터디/프로젝트 조회
    List<StudyProjectAvailableDay> findByDayId(Byte dayId);
    
    // 스터디/프로젝트 ID로 삭제
    void deleteByStudyProjectId(Long studyProjectId);
}

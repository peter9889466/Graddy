package com.smhrd.graddy.study.repository;

import com.smhrd.graddy.study.entity.StudyProjectAvailableDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    /**
     * 특정 스터디/프로젝트의 가능 요일 ID 목록 조회
     * @param studyProjectId 스터디/프로젝트 ID
     * @return 해당 스터디/프로젝트의 가능 요일 ID 목록
     */
    @Query("SELECT spad.dayId FROM StudyProjectAvailableDay spad WHERE spad.studyProjectId = :studyProjectId")
    List<Byte> findDayIdsByStudyProjectId(@Param("studyProjectId") Long studyProjectId);
    
    /**
     * 특정 요일을 선호하는 스터디/프로젝트 ID 목록 조회
     * @param dayId 요일 ID
     * @return 해당 요일을 선호하는 스터디/프로젝트 ID 목록
     */
    @Query("SELECT spad.studyProjectId FROM StudyProjectAvailableDay spad WHERE spad.dayId = :dayId")
    List<Long> findStudyProjectIdsByDayId(@Param("dayId") Byte dayId);
}

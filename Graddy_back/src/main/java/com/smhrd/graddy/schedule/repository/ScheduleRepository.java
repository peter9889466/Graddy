package com.smhrd.graddy.schedule.repository;

import com.smhrd.graddy.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    
    // 사용자의 모든 일정 조회 (스터디 + 개인)
    @Query("SELECT s FROM Schedule s WHERE s.userId = :userId ORDER BY s.schTime ASC")
    List<Schedule> findByUserIdOrderBySchTimeAsc(@Param("userId") String userId);
    
    // 사용자의 개인 일정만 조회
    @Query("SELECT s FROM Schedule s WHERE s.userId = :userId AND s.studyProjectId IS NULL ORDER BY s.schTime ASC")
    List<Schedule> findPersonalSchedulesByUserIdOrderBySchTimeAsc(@Param("userId") String userId);
    
    // 사용자의 스터디 일정만 조회
    @Query("SELECT s FROM Schedule s WHERE s.userId = :userId AND s.studyProjectId IS NOT NULL ORDER BY s.schTime ASC")
    List<Schedule> findStudySchedulesByUserIdOrderBySchTimeAsc(@Param("userId") String userId);
    
    // 특정 스터디의 모든 일정 조회
    @Query("SELECT s FROM Schedule s WHERE s.studyProjectId = :studyProjectId ORDER BY s.schTime ASC")
    List<Schedule> findByStudyProjectIdOrderBySchTimeAsc(@Param("studyProjectId") Long studyProjectId);
    
    // 특정 스터디의 특정 사용자 일정 조회
    @Query("SELECT s FROM Schedule s WHERE s.studyProjectId = :studyProjectId AND s.userId = :userId ORDER BY s.schTime ASC")
    List<Schedule> findByStudyProjectIdAndUserIdOrderBySchTimeAsc(
            @Param("studyProjectId") Long studyProjectId, 
            @Param("userId") String userId);
    
    // 특정 기간의 일정 조회
    @Query("SELECT s FROM Schedule s WHERE s.userId = :userId AND s.schTime BETWEEN :startTime AND :endTime ORDER BY s.schTime ASC")
    List<Schedule> findByUserIdAndSchTimeBetweenOrderBySchTimeAsc(
            @Param("userId") String userId, 
            @Param("startTime") Timestamp startTime, 
            @Param("endTime") Timestamp endTime);
    
    // 스터디 일정 중 특정 기간의 일정 조회
    @Query("SELECT s FROM Schedule s WHERE s.studyProjectId = :studyProjectId AND s.schTime BETWEEN :startTime AND :endTime ORDER BY s.schTime ASC")
    List<Schedule> findByStudyProjectIdAndSchTimeBetweenOrderBySchTimeAsc(
            @Param("studyProjectId") Long studyProjectId, 
            @Param("startTime") Timestamp startTime, 
            @Param("endTime") Timestamp endTime);
    
    // content가 특정 문자열로 시작하고 N시간 이내에 있는 스케줄 조회
    @Query("SELECT s FROM Schedule s WHERE s.content LIKE :contentPrefix% AND s.schTime <= :endTime ORDER BY s.schTime ASC")
    List<Schedule> findByContentStartingWithAndSchTimeBefore(
            @Param("contentPrefix") String contentPrefix,
            @Param("endTime") Timestamp endTime);
    
    // content가 특정 문자열로 시작하고 N시간 이내에 있고 아직 알림을 보내지 않은 스케줄 조회
    @Query("SELECT s FROM Schedule s WHERE s.content LIKE :contentPrefix% AND s.schTime <= :endTime AND s.aramChk = false ORDER BY s.schTime ASC")
    List<Schedule> findByContentStartingWithAndSchTimeBeforeAndAramChkFalse(
            @Param("contentPrefix") String contentPrefix,
            @Param("endTime") Timestamp endTime);
    
    // 사용자의 이미 처리된 스케줄 조회 (재활성화용)
    @Query("SELECT s FROM Schedule s WHERE s.userId = :userId AND s.aramChk = true ORDER BY s.schTime ASC")
    List<Schedule> findByUserIdAndAramChkTrue(@Param("userId") String userId);
    
    // 특정 사용자에게 동일한 스케줄이 이미 존재하는지 확인
    @Query("SELECT COUNT(s) > 0 FROM Schedule s WHERE s.userId = :userId AND s.studyProjectId = :studyProjectId AND s.content = :content AND s.schTime = :schTime")
    boolean existsByUserIdAndStudyProjectIdAndContentAndSchTime(
            @Param("userId") String userId, 
            @Param("studyProjectId") Long studyProjectId, 
            @Param("content") String content, 
            @Param("schTime") Timestamp schTime);
}

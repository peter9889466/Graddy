package com.smhrd.graddy.user.repository;

import com.smhrd.graddy.user.entity.UserAvailableDays;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAvailableDaysRepository extends JpaRepository<UserAvailableDays, UserAvailableDays.UserAvailableDaysId> {
    
    // userId로 UserAvailableDays 목록 조회
    List<UserAvailableDays> findByIdUserId(String userId);
    
    // userId로 UserAvailableDays 삭제
    @Modifying
    @Query("DELETE FROM UserAvailableDays uad WHERE uad.id.userId = :userId")
    void deleteByIdUserId(@Param("userId") String userId);
    
    /**
     * 사용자의 가능 요일 ID 목록 조회
     * @param userId 사용자 ID
     * @return 가능 요일 ID 목록
     */
    @Query("SELECT uad.id.dayId FROM UserAvailableDays uad WHERE uad.id.userId = :userId")
    List<Byte> findDayIdsByUserId(@Param("userId") String userId);
    
    /**
     * 특정 요일을 선호하는 사용자 ID 목록 조회
     * @param dayId 요일 ID
     * @return 해당 요일을 선호하는 사용자 ID 목록
     */
    @Query("SELECT uad.id.userId FROM UserAvailableDays uad WHERE uad.id.dayId = :dayId")
    List<String> findUserIdsByDayId(@Param("dayId") Byte dayId);
}

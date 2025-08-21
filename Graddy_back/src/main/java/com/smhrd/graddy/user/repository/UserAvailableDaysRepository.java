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
}

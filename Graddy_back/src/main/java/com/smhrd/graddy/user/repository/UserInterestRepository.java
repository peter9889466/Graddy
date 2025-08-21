package com.smhrd.graddy.user.repository;

import com.smhrd.graddy.user.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInterestRepository extends JpaRepository<UserInterest, UserInterest.UserInterestId> {
    
    // userId로 UserInterest 목록 조회
    List<UserInterest> findByIdUserId(String userId);
    
    // userId로 UserInterest 삭제
    @Modifying
    @Query("DELETE FROM UserInterest ui WHERE ui.id.userId = :userId")
    void deleteByIdUserId(@Param("userId") String userId);
}

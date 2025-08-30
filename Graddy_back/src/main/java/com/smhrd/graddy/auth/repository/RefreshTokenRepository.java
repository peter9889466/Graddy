package com.smhrd.graddy.auth.repository;

import com.smhrd.graddy.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // 사용자 ID로 Refresh Token 조회
    Optional<RefreshToken> findByUserId(String userId);

    // 토큰 값으로 Refresh Token 조회
    Optional<RefreshToken> findByTokenValue(String tokenValue);

    // 사용자 ID로 Refresh Token 존재 여부 확인
    boolean existsByUserId(String userId);

    // 만료된 토큰들 삭제
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :currentTime")
    void deleteExpiredTokens(@Param("currentTime") LocalDateTime currentTime);

    // 사용자 ID로 Refresh Token 삭제
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.userId = :userId")
    void deleteByUserId(@Param("userId") String userId);
}

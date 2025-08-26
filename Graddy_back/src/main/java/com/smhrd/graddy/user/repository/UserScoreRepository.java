package com.smhrd.graddy.user.repository;

import com.smhrd.graddy.user.entity.UserScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 점수 Repository
 * SQL 스키마의 scores 테이블과 매핑
 */
@Repository
public interface UserScoreRepository extends JpaRepository<UserScore, Long> {

    /**
     * 사용자 ID로 점수 정보 조회
     * @param userId 사용자 ID
     * @return 사용자 점수 정보
     */
    Optional<UserScore> findByUserId(String userId);

    /**
     * 사용자 ID로 점수 정보 존재 여부 확인
     * @param userId 사용자 ID
     * @return 존재 여부
     */
    boolean existsByUserId(String userId);

    /**
     * 사용자 ID로 점수 정보 삭제
     * @param userId 사용자 ID
     */
    @Modifying
    @Query("DELETE FROM UserScore us WHERE us.userId = :userId")
    void deleteByUserId(@Param("userId") String userId);

    /**
     * 특정 점수 이상의 사용자들 조회
     * @param minScore 최소 점수
     * @return 점수 정보 목록
     */
    @Query("SELECT us FROM UserScore us WHERE us.userScore >= :minScore ORDER BY us.userScore DESC")
    List<UserScore> findByUserScoreGreaterThanEqualOrderByUserScoreDesc(@Param("minScore") Integer minScore);

    /**
     * 상위 N명의 사용자 점수 조회
     * @param limit 조회할 상위 사용자 수
     * @return 상위 사용자 점수 목록
     */
    @Query("SELECT us FROM UserScore us ORDER BY us.userScore DESC")
    List<UserScore> findTopUsersByScore(@Param("limit") int limit);
}

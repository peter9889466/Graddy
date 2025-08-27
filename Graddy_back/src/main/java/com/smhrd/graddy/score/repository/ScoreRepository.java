package com.smhrd.graddy.score.repository;

import com.smhrd.graddy.score.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    
    /**
     * 사용자 ID로 점수 조회
     */
    Optional<Score> findByUserId(String userId);
    
    /**
     * 점수 내림차순으로 모든 사용자 랭킹 조회 (TOP 100)
     */
    @Query("SELECT s FROM Score s ORDER BY s.userScore DESC")
    List<Score> findTop100ByOrderByUserScoreDesc();
    
    /**
     * 특정 점수 이상의 사용자들 조회
     */
    List<Score> findByUserScoreGreaterThanEqualOrderByUserScoreDesc(Integer minScore);
    
    /**
     * 특정 점수 범위의 사용자들 조회
     */
    @Query("SELECT s FROM Score s WHERE s.userScore BETWEEN :minScore AND :maxScore ORDER BY s.userScore DESC")
    List<Score> findByUserScoreBetweenOrderByUserScoreDesc(@Param("minScore") Integer minScore, @Param("maxScore") Integer maxScore);
    
    /**
     * 사용자의 현재 랭킹 조회
     */
    @Query("SELECT COUNT(s) + 1 FROM Score s WHERE s.userScore > (SELECT s2.userScore FROM Score s2 WHERE s2.userId = :userId)")
    Long findUserRank(@Param("userId") String userId);
    
    /**
     * 전체 사용자 수 조회
     */
    @Query("SELECT COUNT(s) FROM Score s")
    Long countTotalUsers();
}

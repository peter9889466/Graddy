package com.smhrd.graddy.score.service;

import com.smhrd.graddy.score.dto.ScoreResponse;
import com.smhrd.graddy.score.dto.RankingResponse;
import com.smhrd.graddy.score.entity.Score;
import com.smhrd.graddy.score.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScoreService {
    
    private final ScoreRepository scoreRepository;
    
    /**
     * 사용자 점수 조회
     */
    public ScoreResponse getUserScore(String userId) {
        log.info("사용자 점수 조회: userId={}", userId);
        
        // 먼저 해당 사용자가 scores 테이블에 존재하는지 확인
        Score score = scoreRepository.findByUserId(userId).orElse(null);
        if (score == null) {
            log.warn("사용자 점수가 존재하지 않음: userId={}", userId);
            return null; // 점수가 없는 사용자는 null 반환
        }
        
        Long rank = scoreRepository.findUserRank(userId);
        Long totalUsers = scoreRepository.countTotalUsers();
        
        return ScoreResponse.builder()
                .scoreId(score.getScoreId())
                .userId(score.getUserId())
                .userScore(score.getUserScore())
                .rank(rank)
                .totalUsers(totalUsers)
                .lastUpdated(timestampToLocalDateTime(score.getLastUpdated()))
                .build();
    }
    
    /**
     * TOP 100 랭킹 조회
     */
    public RankingResponse getTop100Ranking() {
        log.info("TOP 100 랭킹 조회");
        
        List<Score> topScores = scoreRepository.findTop100ByOrderByUserScoreDesc();
        Long totalUsers = scoreRepository.countTotalUsers();
        
        List<ScoreResponse> rankings = topScores.stream()
                .map(this::convertToScoreResponse)
                .filter(response -> response != null) // null 응답 필터링
                .collect(Collectors.toList());
        
        return RankingResponse.builder()
                .rankings(rankings)
                .totalUsers(totalUsers)
                .rankingCount((long) rankings.size())
                .criteria("TOP 100")
                .build();
    }
    
    /**
     * 특정 점수 이상 랭킹 조회
     */
    public RankingResponse getRankingByMinScore(Integer minScore) {
        log.info("최소 점수 {} 이상 랭킹 조회", minScore);
        
        List<Score> scores = scoreRepository.findByUserScoreGreaterThanEqualOrderByUserScoreDesc(minScore);
        Long totalUsers = scoreRepository.countTotalUsers();
        
        List<ScoreResponse> rankings = scores.stream()
                .map(this::convertToScoreResponse)
                .filter(response -> response != null) // null 응답 필터링
                .collect(Collectors.toList());
        
        return RankingResponse.builder()
                .rankings(rankings)
                .totalUsers(totalUsers)
                .rankingCount((long) rankings.size())
                .criteria("점수 " + minScore + " 이상")
                .build();
    }
    
    /**
     * 점수 범위별 랭킹 조회
     */
    public RankingResponse getRankingByScoreRange(Integer minScore, Integer maxScore) {
        log.info("점수 범위 {} ~ {} 랭킹 조회", minScore, maxScore);
        
        List<Score> scores = scoreRepository.findByUserScoreBetweenOrderByUserScoreDesc(minScore, maxScore);
        Long totalUsers = scoreRepository.countTotalUsers();
        
        List<ScoreResponse> rankings = scores.stream()
                .map(this::convertToScoreResponse)
                .filter(response -> response != null) // null 응답 필터링
                .collect(Collectors.toList());
        
        return RankingResponse.builder()
                .rankings(rankings)
                .totalUsers(totalUsers)
                .rankingCount((long) rankings.size())
                .criteria("점수 " + minScore + " ~ " + maxScore)
                .build();
    }
    
    /**
     * 사용자 점수 업데이트
     */
    @Transactional
    public ScoreResponse updateUserScore(String userId, Integer newScore) {
        log.info("사용자 점수 업데이트: userId={}, newScore={}", userId, newScore);
        
        // 먼저 해당 사용자가 scores 테이블에 존재하는지 확인
        Score score = scoreRepository.findByUserId(userId).orElse(null);
        if (score == null) {
            log.warn("업데이트할 사용자 점수가 존재하지 않음: userId={}", userId);
            return null; // 점수가 없는 사용자는 null 반환
        }
        
        score.setUserScore(newScore);
        score.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        
        Score updatedScore = scoreRepository.save(score);
        
        Long rank = scoreRepository.findUserRank(userId);
        Long totalUsers = scoreRepository.countTotalUsers();
        
        return ScoreResponse.builder()
                .scoreId(updatedScore.getScoreId())
                .userId(updatedScore.getUserId())
                .userScore(updatedScore.getUserScore())
                .rank(rank)
                .totalUsers(totalUsers)
                .lastUpdated(timestampToLocalDateTime(updatedScore.getLastUpdated()))
                .build();
    }
    
    /**
     * 사용자 점수 증가
     */
    @Transactional
    public ScoreResponse increaseUserScore(String userId, Integer points) {
        log.info("사용자 점수 증가: userId={}, points={}", userId, points);
        
        // 먼저 해당 사용자가 scores 테이블에 존재하는지 확인
        Score score = scoreRepository.findByUserId(userId).orElse(null);
        if (score == null) {
            log.warn("증가할 사용자 점수가 존재하지 않음: userId={}", userId);
            return null; // 점수가 없는 사용자는 null 반환
        }
        
        int newScore = score.getUserScore() + points;
        score.setUserScore(newScore);
        score.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        
        Score updatedScore = scoreRepository.save(score);
        
        Long rank = scoreRepository.findUserRank(userId);
        Long totalUsers = scoreRepository.countTotalUsers();
        
        return ScoreResponse.builder()
                .scoreId(updatedScore.getScoreId())
                .userId(updatedScore.getUserId())
                .userScore(updatedScore.getUserScore())
                .rank(rank)
                .totalUsers(totalUsers)
                .lastUpdated(timestampToLocalDateTime(updatedScore.getLastUpdated()))
                .build();
    }
    
    /**
     * 사용자 점수 감소
     */
    @Transactional
    public ScoreResponse decreaseUserScore(String userId, Integer points) {
        log.info("사용자 점수 감소: userId={}, points={}", userId, points);
        
        // 먼저 해당 사용자가 scores 테이블에 존재하는지 확인
        Score score = scoreRepository.findByUserId(userId).orElse(null);
        if (score == null) {
            log.warn("감소할 사용자 점수가 존재하지 않음: userId={}", userId);
            return null; // 점수가 없는 사용자는 null 반환
        }
        
        int newScore = Math.max(0, score.getUserScore() - points); // 최소 0점
        score.setUserScore(newScore);
        score.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        
        Score updatedScore = scoreRepository.save(score);
        
        Long rank = scoreRepository.findUserRank(userId);
        Long totalUsers = scoreRepository.countTotalUsers();
        
        return ScoreResponse.builder()
                .scoreId(updatedScore.getScoreId())
                .userId(updatedScore.getUserId())
                .userScore(updatedScore.getUserScore())
                .rank(rank)
                .totalUsers(totalUsers)
                .lastUpdated(timestampToLocalDateTime(updatedScore.getLastUpdated()))
                .build();
    }
    
    /**
     * Score 엔티티를 ScoreResponse로 변환
     */
    private ScoreResponse convertToScoreResponse(Score score) {
        try {
            Long rank = scoreRepository.findUserRank(score.getUserId());
            Long totalUsers = scoreRepository.countTotalUsers();
            
            return ScoreResponse.builder()
                    .scoreId(score.getScoreId())
                    .userId(score.getUserId())
                    .userScore(score.getUserScore())
                    .rank(rank)
                    .totalUsers(totalUsers)
                    .lastUpdated(timestampToLocalDateTime(score.getLastUpdated()))
                    .build();
        } catch (Exception e) {
            log.error("ScoreResponse 변환 실패: userId={}, error={}", score.getUserId(), e.getMessage());
            return null; // 변환 실패 시 null 반환
        }
    }
    
    /**
     * Timestamp를 LocalDateTime으로 변환
     */
    private LocalDateTime timestampToLocalDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime();
    }
}

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
     * 새 사용자 점수 생성 (기본값 1000점)
     */
    @Transactional
    public ScoreResponse createUserScore(String userId) {
        log.info("새 사용자 점수 생성: userId={}", userId);
        
        // 이미 존재하는지 확인
        if (scoreRepository.findByUserId(userId).isPresent()) {
            log.warn("이미 존재하는 사용자 점수: userId={}", userId);
            return getUserScore(userId);
        }
        
        // 새 점수 생성 (기본값 1000점)
        Score newScore = Score.builder()
                .userId(userId)
                .userScore(1000) // 기본 점수 1000점
                .lastUpdated(new Timestamp(System.currentTimeMillis()))
                .build();
        
        Score savedScore = scoreRepository.save(newScore);
        
        Long rank = scoreRepository.findUserRank(userId);
        Long totalUsers = scoreRepository.countTotalUsers();
        
        log.info("사용자 점수 생성 완료: userId={}, score=1000", userId);
        
        return ScoreResponse.builder()
                .scoreId(savedScore.getScoreId())
                .userId(savedScore.getUserId())
                .userScore(savedScore.getUserScore())
                .rank(rank)
                .totalUsers(totalUsers)
                .lastUpdated(timestampToLocalDateTime(savedScore.getLastUpdated()))
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
            log.warn("사용자 점수가 존재하지 않음. 기본 점수로 생성: userId={}", userId);
            // 점수가 없으면 기본 점수 1000으로 생성한 후 점수 증가
            ScoreResponse newScore = createUserScore(userId);
            if (newScore == null) {
                log.error("사용자 점수 생성 실패: userId={}", userId);
                return null;
            }
            score = scoreRepository.findByUserId(userId).orElse(null);
            if (score == null) {
                log.error("생성된 사용자 점수 조회 실패: userId={}", userId);
                return null;
            }
        }
        
        int previousScore = score.getUserScore();
        int newScore = score.getUserScore() + points;
        score.setUserScore(newScore);
        score.setLastUpdated(new Timestamp(System.currentTimeMillis()));
        
        Score updatedScore = scoreRepository.save(score);
        
        log.info("💾 [DEBUG] 점수 증가 완료: userId={}, 이전점수={}, 증가점수={}, 최종점수={}", 
                userId, previousScore, points, updatedScore.getUserScore());
        
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
            log.warn("사용자 점수가 존재하지 않음. 기본 점수로 생성: userId={}", userId);
            // 점수가 없으면 기본 점수 1000으로 생성한 후 점수 감소
            ScoreResponse newScore = createUserScore(userId);
            if (newScore == null) {
                log.error("사용자 점수 생성 실패: userId={}", userId);
                return null;
            }
            score = scoreRepository.findByUserId(userId).orElse(null);
            if (score == null) {
                log.error("생성된 사용자 점수 조회 실패: userId={}", userId);
                return null;
            }
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
     * 기존 사용자들을 위한 점수 마이그레이션 (관리자용)
     * 점수가 없는 모든 사용자에게 기본 점수 1000점 부여
     */
    @Transactional
    public void migrateExistingUsersScore() {
        log.info("기존 사용자들을 위한 점수 마이그레이션 시작");
        
        // 이 메서드는 필요 시 관리자가 호출할 수 있도록 준비
        // 실제 사용 시에는 UserRepository를 주입받아 모든 사용자를 조회한 후
        // 점수가 없는 사용자들에게 기본 점수를 부여하는 로직을 구현
        
        log.info("점수 마이그레이션은 수동으로 실행해야 합니다.");
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

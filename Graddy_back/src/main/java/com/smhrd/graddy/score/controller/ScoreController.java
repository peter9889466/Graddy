package com.smhrd.graddy.score.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.score.dto.ScoreResponse;
import com.smhrd.graddy.score.dto.RankingResponse;
import com.smhrd.graddy.score.service.ScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/scores")
@RequiredArgsConstructor
@Tag(name = "유저 점수", description = "사용자 점수 및 랭킹 관리 API")
public class ScoreController {
    
    private final ScoreService scoreService;
    
    /**
     * 사용자 점수 조회
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "사용자 점수 조회", description = "특정 사용자의 점수와 랭킹을 조회합니다.")
    public ResponseEntity<ApiResponse<ScoreResponse>> getUserScore(
            @Parameter(description = "사용자 ID", required = true)
            @PathVariable String userId) {
        try {
            ScoreResponse response = scoreService.getUserScore(userId);
            if (response == null) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "해당 사용자의 점수 정보를 찾을 수 없습니다.", null);
            }
            
            return ApiResponse.success("사용자 점수 조회가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("사용자 점수 조회 실패: userId={}, error={}", userId, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "사용자 점수 조회에 실패했습니다.", null);
        }
    }
    
    /**
     * TOP 100 랭킹 조회
     */
    @GetMapping("/ranking/top100")
    @Operation(summary = "TOP 100 랭킹 조회", description = "점수 기준 TOP 100 사용자 랭킹을 조회합니다.")
    public ResponseEntity<ApiResponse<RankingResponse>> getTop100Ranking() {
        try {
            RankingResponse response = scoreService.getTop100Ranking();
            return ApiResponse.success("TOP 100 랭킹 조회가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("TOP 100 랭킹 조회 실패: error={}", e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "TOP 100 랭킹 조회에 실패했습니다.", null);
        }
    }
    
    /**
     * 최소 점수 이상 랭킹 조회
     */
    @GetMapping("/ranking/min-score/{minScore}")
    @Operation(summary = "최소 점수 이상 랭킹 조회", description = "특정 점수 이상의 사용자 랭킹을 조회합니다.")
    public ResponseEntity<ApiResponse<RankingResponse>> getRankingByMinScore(
            @Parameter(description = "최소 점수", required = true)
            @PathVariable Integer minScore) {
        try {
            RankingResponse response = scoreService.getRankingByMinScore(minScore);
            return ApiResponse.success("최소 점수 이상 랭킹 조회가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("최소 점수 이상 랭킹 조회 실패: minScore={}, error={}", minScore, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "최소 점수 이상 랭킹 조회에 실패했습니다.", null);
        }
    }
    
    /**
     * 점수 범위별 랭킹 조회
     */
    @GetMapping("/ranking/range")
    @Operation(summary = "점수 범위별 랭킹 조회", description = "특정 점수 범위의 사용자 랭킹을 조회합니다.")
    public ResponseEntity<ApiResponse<RankingResponse>> getRankingByScoreRange(
            @Parameter(description = "최소 점수", required = true)
            @RequestParam Integer minScore,
            @Parameter(description = "최대 점수", required = true)
            @RequestParam Integer maxScore) {
        try {
            RankingResponse response = scoreService.getRankingByScoreRange(minScore, maxScore);
            return ApiResponse.success("점수 범위별 랭킹 조회가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("점수 범위별 랭킹 조회 실패: minScore={}, maxScore={}, error={}", minScore, maxScore, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "점수 범위별 랭킹 조회에 실패했습니다.", null);
        }
    }
    
    /**
     * 사용자 점수 업데이트
     */
    @PutMapping("/user/{userId}")
    @Operation(summary = "사용자 점수 업데이트", description = "특정 사용자의 점수를 새로운 값으로 업데이트합니다.")
    public ResponseEntity<ApiResponse<ScoreResponse>> updateUserScore(
            @Parameter(description = "사용자 ID", required = true)
            @PathVariable String userId,
            @Parameter(description = "새로운 점수", required = true)
            @RequestParam Integer newScore) {
        try {
            ScoreResponse response = scoreService.updateUserScore(userId, newScore);
            if (response == null) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "업데이트할 사용자의 점수 정보를 찾을 수 없습니다.", null);
            }
            
            return ApiResponse.success("사용자 점수 업데이트가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("사용자 점수 업데이트 실패: userId={}, newScore={}, error={}", userId, newScore, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "사용자 점수 업데이트에 실패했습니다.", null);
        }
    }
    
    /**
     * 사용자 점수 증가
     */
    @PostMapping("/user/{userId}/increase")
    @Operation(summary = "사용자 점수 증가", description = "특정 사용자의 점수를 증가시킵니다.")
    public ResponseEntity<ApiResponse<ScoreResponse>> increaseUserScore(
            @Parameter(description = "사용자 ID", required = true)
            @PathVariable String userId,
            @Parameter(description = "증가할 점수", required = true)
            @RequestParam Integer points) {
        try {
            ScoreResponse response = scoreService.increaseUserScore(userId, points);
            if (response == null) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "증가할 사용자의 점수 정보를 찾을 수 없습니다.", null);
            }
            
            return ApiResponse.success("사용자 점수 증가가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("사용자 점수 증가 실패: userId={}, points={}, error={}", userId, points, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "사용자 점수 증가에 실패했습니다.", null);
        }
    }
    
    /**
     * 사용자 점수 감소
     */
    @PostMapping("/user/{userId}/decrease")
    @Operation(summary = "사용자 점수 감소", description = "특정 사용자의 점수를 감소시킵니다.")
    public ResponseEntity<ApiResponse<ScoreResponse>> decreaseUserScore(
            @Parameter(description = "사용자 ID", required = true)
            @PathVariable String userId,
            @Parameter(description = "감소할 점수", required = true)
            @RequestParam Integer points) {
        try {
            ScoreResponse response = scoreService.decreaseUserScore(userId, points);
            if (response == null) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "감소할 사용자의 점수 정보를 찾을 수 없습니다.", null);
            }
            
            return ApiResponse.success("사용자 점수 감소가 성공했습니다.", response);
        } catch (Exception e) {
            log.error("사용자 점수 감소 실패: userId={}, points={}, error={}", userId, points, e.getMessage());
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "사용자 점수 감소에 실패했습니다.", null);
        }
    }
}

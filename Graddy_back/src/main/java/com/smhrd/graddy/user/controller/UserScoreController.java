package com.smhrd.graddy.user.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.user.entity.UserScore;
import com.smhrd.graddy.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 사용자 점수 관리 컨트롤러
 */
@Tag(name = "User Score", description = "사용자 점수 관리 API")
@RestController
@RequestMapping("/api/user-scores")
@RequiredArgsConstructor
public class UserScoreController {

    private final UserService userService;

    /**
     * 사용자 점수 조회
     * @param userId 사용자 ID
     * @return 사용자 점수 정보
     */
    @Operation(summary = "사용자 점수 조회", description = "특정 사용자의 점수 정보를 조회합니다.")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserScore>> getUserScore(
            @Parameter(description = "사용자 ID", example = "user123")
            @PathVariable String userId) {
        try {
            UserScore userScore = userService.getUserScore(userId);
            return ApiResponse.success("사용자 점수 조회 성공", userScore);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    /**
     * 상위 사용자 점수 조회
     * @param limit 조회할 상위 사용자 수
     * @return 상위 사용자 점수 목록
     */
    @Operation(summary = "상위 사용자 점수 조회", description = "점수가 높은 상위 사용자들의 점수 정보를 조회합니다.")
    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<UserScore>>> getTopUsersByScore(
            @Parameter(description = "조회할 상위 사용자 수", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<UserScore> topUsers = userService.getTopUsersByScore(limit);
            return ApiResponse.success("상위 사용자 점수 조회 성공", topUsers);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    /**
     * 특정 점수 이상의 사용자들 조회
     * @param minScore 최소 점수
     * @return 점수 정보 목록
     */
    @Operation(summary = "최소 점수 이상 사용자 조회", description = "특정 점수 이상의 사용자들의 점수 정보를 조회합니다.")
    @GetMapping("/by-min-score")
    public ResponseEntity<ApiResponse<List<UserScore>>> getUsersByMinScore(
            @Parameter(description = "최소 점수", example = "1000")
            @RequestParam int minScore) {
        try {
            List<UserScore> users = userService.getUsersByMinScore(minScore);
            return ApiResponse.success("최소 점수 이상 사용자 조회 성공", users);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    /**
     * 사용자 점수 증가 (관리자용)
     * @param userId 사용자 ID
     * @param amount 증가할 점수
     * @return 업데이트된 점수 정보
     */
    @Operation(summary = "사용자 점수 증가", description = "특정 사용자의 점수를 증가시킵니다. (관리자용)")
    @PostMapping("/{userId}/add")
    public ResponseEntity<ApiResponse<UserScore>> addUserScore(
            @Parameter(description = "사용자 ID", example = "user123")
            @PathVariable String userId,
            @Parameter(description = "증가할 점수", example = "100")
            @RequestParam int amount) {
        try {
            UserScore updatedScore = userService.addUserScore(userId, amount);
            return ApiResponse.success("사용자 점수 증가 성공", updatedScore);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    /**
     * 사용자 점수 감소 (관리자용)
     * @param userId 사용자 ID
     * @param amount 감소할 점수
     * @return 업데이트된 점수 정보
     */
    @Operation(summary = "사용자 점수 감소", description = "특정 사용자의 점수를 감소시킵니다. (관리자용)")
    @PostMapping("/{userId}/subtract")
    public ResponseEntity<ApiResponse<UserScore>> subtractUserScore(
            @Parameter(description = "사용자 ID", example = "user123")
            @PathVariable String userId,
            @Parameter(description = "감소할 점수", example = "50")
            @RequestParam int amount) {
        try {
            UserScore updatedScore = userService.subtractUserScore(userId, amount);
            return ApiResponse.success("사용자 점수 감소 성공", updatedScore);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }
}

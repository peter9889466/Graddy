package com.smhrd.graddy.recommendation.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.recommendation.dto.StudyRecommendationDto;
import com.smhrd.graddy.recommendation.service.StudyMatchingService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 스터디 매칭 추천 컨트롤러
 * 사용자에게 맞는 스터디/프로젝트를 추천하는 API 엔드포인트 제공
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/recommendation")
@Tag(name = "스터디 추천", description = "하이브리드 추천 알고리즘을 통한 스터디/프로젝트 매칭 API")
public class StudyMatchingController {
    
    private final StudyMatchingService studyMatchingService;
    private final JwtUtil jwtUtil;
    
    /**
     * 사용자에게 맞는 스터디 추천 (프로젝트 제외)
     * @param authorizationHeader JWT 인증 헤더
     * @param limit 추천 개수 제한 (기본값: 10)
     * @return 추천된 스터디 목록
     */
    @Operation(
        summary = "스터디 추천",
        description = "하이브리드 추천 알고리즘을 사용하여 현재 로그인한 사용자에게 맞는 스터디를 추천합니다. (프로젝트 제외)"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "추천 성공",
            content = @Content(schema = @Schema(implementation = StudyRecommendationDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "인증 실패",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "서버 내부 오류",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        )
    })
    @GetMapping("/studies")
    public ResponseEntity<ApiResponse<List<StudyRecommendationDto>>> recommendStudies(
        @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiJ9...")
        @RequestHeader("Authorization") String authorizationHeader,
        @Parameter(description = "추천 개수 제한", example = "10")
        @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        try {
            log.info("스터디 추천 요청 시작, limit: {}", limit);
            
            // JWT 토큰에서 사용자 ID 추출
            String token = authorizationHeader.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            log.info("사용자 {}에 대한 스터디 추천 시작", userId);
            
            // 추천 서비스 호출
            List<StudyRecommendationDto> recommendations = studyMatchingService.recommendStudies(userId, limit);
            
            log.info("사용자 {}에게 {}개의 스터디를 추천했습니다", userId, recommendations.size());
            
            return ApiResponse.success("스터디 추천이 완료되었습니다.", recommendations);
            
        } catch (IllegalArgumentException e) {
            log.warn("스터디 추천 중 잘못된 요청: {}", e.getMessage());
            return ApiResponse.error(org.springframework.http.HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            log.error("스터디 추천 중 오류 발생: {}", e.getMessage(), e);
            return ApiResponse.error(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, 
                "스터디 추천 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
    
    /**
     * 특정 사용자에게 맞는 스터디 추천 (관리자용, 프로젝트 제외)
     * @param targetUserId 추천 대상 사용자 ID
     * @param limit 추천 개수 제한 (기본값: 10)
     * @return 추천된 스터디 목록
     */
    @Operation(
        summary = "특정 사용자 스터디 추천 (관리자용)",
        description = "관리자가 특정 사용자에게 맞는 스터디를 추천합니다. (프로젝트 제외)"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "추천 성공",
            content = @Content(schema = @Schema(implementation = StudyRecommendationDto.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "권한 없음",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "서버 내부 오류",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
        )
    })
    @GetMapping("/studies/{userId}")
    public ResponseEntity<ApiResponse<List<StudyRecommendationDto>>> recommendStudiesForUser(
        @Parameter(description = "추천 대상 사용자 ID", example = "user123")
        @PathVariable("userId") String targetUserId,
        @Parameter(description = "추천 개수 제한", example = "10")
        @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        try {
            log.info("사용자 {}에 대한 스터디 추천 요청 시작, limit: {}", targetUserId, limit);
            
            // 추천 서비스 호출
            List<StudyRecommendationDto> recommendations = studyMatchingService.recommendStudies(targetUserId, limit);
            
            log.info("사용자 {}에게 {}개의 스터디를 추천했습니다", targetUserId, recommendations.size());
            
            return ApiResponse.success("스터디 추천이 완료되었습니다.", recommendations);
            
        } catch (IllegalArgumentException e) {
            log.warn("스터디 추천 중 잘못된 요청: {}", e.getMessage());
            return ApiResponse.error(org.springframework.http.HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            log.error("스터디 추천 중 오류 발생: {}", e.getMessage(), e);
            return ApiResponse.error(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, 
                "스터디 추천 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
} 

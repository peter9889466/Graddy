package com.smhrd.graddy.assignment.controller;

import com.smhrd.graddy.assignment.dto.AssignmentGenerationResponse;
import com.smhrd.graddy.assignment.service.AssignmentGenerationService;
import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/assignment-generation")
@RequiredArgsConstructor
@Tag(name = "AI 과제 생성", description = "GPT를 활용한 스터디/프로젝트 과제 자동 생성 API")
public class AssignmentGenerationController {

    private final AssignmentGenerationService assignmentGenerationService;
    private final JwtUtil jwtUtil;

    /**
     * GPT를 사용하여 스터디/프로젝트에 맞는 과제 자동 생성
     */
    @PostMapping("/{studyProjectId}")
    @Operation(summary = "AI 과제 생성",
              description = "OpenAI GPT를 사용하여 스터디/프로젝트 정보와 태그를 기반으로 과제를 자동 생성합니다.\n\n" +
                           "**생성되는 과제 정보:**\n" +
                           "• 제목, 설명, 마감일, 난이도\n" +
                           "• 주차별 구성, 학습 목표\n" +
                           "• 필요한 기술, 평가 기준\n" +
                           "• 스터디/프로젝트 레벨과 관심 분야에 맞춤형 과제\n\n" +
                           "**권한:** 스터디/프로젝트 리더만 과제 생성 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<AssignmentGenerationResponse>> generateAssignments(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @PathVariable Long studyProjectId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            // JWT 토큰에서 userId 추출
            String userId = jwtUtil.extractUserId(authorization);
            if (userId == null) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }

            AssignmentGenerationResponse response = assignmentGenerationService.generateAssignments(studyProjectId, userId);
            return ApiResponse.success("AI 과제 생성이 성공했습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "과제 생성에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 생성된 과제를 데이터베이스에 저장 (선택사항)
     */
    @PostMapping("/{studyProjectId}/save")
    @Operation(summary = "생성된 과제 저장",
              description = "AI로 생성된 과제를 데이터베이스에 저장합니다.\n\n" +
                           "**권한:** 스터디/프로젝트 리더만 과제 저장 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> saveGeneratedAssignments(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @PathVariable Long studyProjectId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            // JWT 토큰에서 userId 추출
            String userId = jwtUtil.extractUserId(authorization);
            if (userId == null) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }

            // 먼저 과제를 생성하고 저장
            AssignmentGenerationResponse response = assignmentGenerationService.generateAssignments(studyProjectId, userId);
            assignmentGenerationService.saveGeneratedAssignments(studyProjectId, response.getAssignments(), userId);
            
            return ApiResponse.success("과제가 성공적으로 생성되고 저장되었습니다.", 
                response.getAssignments().size() + "개의 과제가 저장되었습니다.");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "과제 저장에 실패했습니다: " + e.getMessage(), null);
        }
    }
}

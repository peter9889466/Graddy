package com.smhrd.graddy.study.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.study.dto.StudyApplicationRequest;
import com.smhrd.graddy.study.dto.StudyApplicationResponse;
import com.smhrd.graddy.study.dto.StudyApplicationApprovalRequest;
import com.smhrd.graddy.study.service.StudyApplicationService;
import com.smhrd.graddy.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/study-applications")
@RequiredArgsConstructor
@Tag(name = "스터디/프로젝트 신청", description = "스터디/프로젝트 가입 신청 및 관리 API")
public class StudyApplicationController {

    private final StudyApplicationService applicationService;
    private final JwtUtil jwtUtil;

    /**
     * 스터디/프로젝트 신청
     */
    @PostMapping("/apply")
    @Operation(summary = "스터디/프로젝트 신청",
              description = "스터디/프로젝트에 가입 신청을 합니다.\n\n" +
                           "**사용법:**\n" +
                           "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
                           "2. Request Body에 studyProjectId와 message 입력\n" +
                           "3. 신청 상태는 자동으로 'PENDING'으로 설정")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<StudyApplicationResponse>> applyToStudyProject(
            @RequestBody StudyApplicationRequest request,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            StudyApplicationResponse response = applicationService.applyToStudyProject(userId, request);
            return ApiResponse.success("스터디/프로젝트 신청이 완료되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "신청 처리에 실패했습니다.", null);
        }
    }

    /**
     * 신청 승인/거부 처리 (리더만)
     */
    @PutMapping("/{studyProjectId}/process")
    @Operation(summary = "신청 승인/거부 처리",
              description = "스터디/프로젝트 신청을 승인하거나 거부합니다.\n\n" +
                           "**권한:** 해당 스터디/프로젝트의 리더만 가능\n" +
                           "**상태 옵션:**\n" +
                           "• APPROVED: 승인 (자동으로 멤버로 추가하고 신청 상태 삭제)\n" +
                           "• REJECTED: 거부 (신청 상태를 REJECTED로 변경)\n\n" +
                           "**사용법:**\n" +
                           "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
                           "2. JWT 토큰의 사용자가 해당 스터디/프로젝트의 리더여야 함")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> processApplication(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @PathVariable Long studyProjectId,
            @RequestBody StudyApplicationApprovalRequest request,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String leaderId = jwtUtil.extractUserId(token);
            
            applicationService.processApplication(studyProjectId, request, leaderId);
            
            String message = "APPROVED".equals(request.getStatus()) ? 
                "신청이 승인되었습니다." : "신청이 거부되었습니다.";
            return ApiResponse.success(message, "SUCCESS");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "신청 처리에 실패했습니다.", null);
        }
    }

    /**
     * 스터디/프로젝트의 신청 목록 조회 (리더만)
     */
    @GetMapping("/{studyProjectId}/applications")
    @Operation(summary = "신청 목록 조회",
              description = "스터디/프로젝트의 모든 신청 목록을 조회합니다.\n\n" +
                           "**권한:** 해당 스터디/프로젝트의 리더만 가능\n" +
                           "**반환 정보:**\n" +
                           "• 신청자 ID, 스터디/프로젝트 ID\n" +
                           "• 신청 상태 (PENDING/APPROVED/REJECTED)\n" +
                           "• 신청 메시지, 신청일시")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<List<StudyApplicationResponse>>> getApplicationsByStudyProject(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @PathVariable Long studyProjectId,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            // TODO: 리더 권한 확인 로직 추가
            List<StudyApplicationResponse> applications = applicationService.getApplicationsByStudyProject(studyProjectId);
            return ApiResponse.success("신청 목록 조회가 성공했습니다.", applications);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "신청 목록 조회에 실패했습니다.", null);
        }
    }

    /**
     * 사용자의 신청 목록 조회
     */
    @GetMapping("/my-applications")
    @Operation(summary = "내 신청 목록 조회",
              description = "현재 로그인한 사용자의 모든 신청 목록을 조회합니다.\n\n" +
                           "**사용법:**\n" +
                           "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
                           "2. JWT 토큰에서 사용자 ID를 자동으로 추출")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<List<StudyApplicationResponse>>> getMyApplications(
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            List<StudyApplicationResponse> applications = applicationService.getApplicationsByUser(userId);
            return ApiResponse.success("내 신청 목록 조회가 성공했습니다.", applications);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "신청 목록 조회에 실패했습니다.", null);
        }
    }

    /**
     * 신청 취소
     */
    @DeleteMapping("/{studyProjectId}/cancel")
    @Operation(summary = "신청 취소",
              description = "PENDING 상태인 신청을 취소합니다.\n\n" +
                           "**주의:** 이미 처리된 신청(APPROVED/REJECTED)은 취소할 수 없습니다.\n\n" +
                           "**사용법:**\n" +
                           "1. Authorization 헤더에 JWT 토큰 입력 (Bearer 형식)\n" +
                           "2. JWT 토큰의 사용자가 신청자 본인이어야 함")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> cancelApplication(
            @Parameter(description = "스터디/프로젝트 ID", example = "1", required = true)
            @PathVariable Long studyProjectId,
            @Parameter(description = "JWT 토큰 (Bearer 형식)", 
                      example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                      required = true)
            @RequestHeader(name = "Authorization", required = true) String authorization) {
        try {
            String token = authorization.replace("Bearer ", "");
            String userId = jwtUtil.extractUserId(token);
            
            applicationService.cancelApplication(userId, studyProjectId);
            return ApiResponse.success("신청이 취소되었습니다.", "SUCCESS");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "신청 취소에 실패했습니다.", null);
        }
    }
}

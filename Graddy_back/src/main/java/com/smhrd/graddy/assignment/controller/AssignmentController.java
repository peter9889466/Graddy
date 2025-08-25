package com.smhrd.graddy.assignment.controller;

import com.smhrd.graddy.assignment.dto.AssignmentRequest;
import com.smhrd.graddy.assignment.dto.AssignmentResponse;
import com.smhrd.graddy.assignment.dto.AssignmentUpdateRequest;
import com.smhrd.graddy.assignment.service.AssignmentService;
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

import java.net.URI;
import java.util.List;
import com.smhrd.graddy.member.service.MemberService;

/**
 * 과제 관리 API 컨트롤러
 * 과제의 생성, 조회, 수정, 삭제 기능을 제공합니다.
 */
@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
@Tag(name = "과제 관리", description = "과제 생성, 조회, 수정, 삭제 API")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final JwtUtil jwtUtil;
    private final MemberService memberService;

    /**
     * 과제 생성
     * 새로운 과제를 생성하고 데이터베이스에 저장합니다.
     * AI가 생성한 과제 내용도 이 엔드포인트를 통해 생성할 수 있습니다.
     * 
     * @param request 과제 생성에 필요한 정보 (스터디ID, 제목, 설명, 마감일, 파일URL)
     * @return 생성된 과제 정보
     */
    @PostMapping
    @Operation(summary = "과제 생성", 
              description = "새로운 과제를 생성하고 데이터베이스에 저장합니다.\n\n" +
                           "**권한:** 스터디/프로젝트 리더만 과제 생성 가능\n" +
                           "**특징:** 마감일이 설정되지 않은 경우 자동으로 생성일로부터 7일 뒤로 설정\n" +
                           "**AI 과제:** GPT 등 AI가 생성한 과제 내용도 이 엔드포인트를 통해 생성 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @RequestBody AssignmentRequest request,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            // JWT 토큰에서 userId 추출 (Bearer 접두사 제거 및 공백 정리)
            String token = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7).trim(); // 공백 제거
            }
            
            if (token == null || token.isEmpty()) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }
            
            String userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }

            AssignmentResponse response = assignmentService.createAssignment(request, userId);
            URI location = URI.create("/api/assignments/" + response.getAssignmentId());
            return ApiResponse.created(location, "과제가 성공적으로 생성되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "과제 생성에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 과제 조회
     * 특정 과제ID로 과제 정보를 조회합니다.
     * 
     * @param assignmentId 조회할 과제의 ID
     * @return 과제 정보
     */
    @GetMapping("/{assignmentId}")
    @Operation(summary = "과제 조회", description = "특정 과제ID로 과제 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignment(@PathVariable Long assignmentId) {
        try {
            AssignmentResponse response = assignmentService.getAssignment(assignmentId);
            return ApiResponse.success("과제 조회가 성공했습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "과제를 찾을 수 없습니다.", null);
        }
    }

    /**
     * 스터디/프로젝트별 과제 목록 조회
     * 특정 스터디/프로젝트에 속한 모든 과제 목록을 조회합니다.
     */
    @GetMapping("/study-project/{studyProjectId}")
    @Operation(summary = "스터디/프로젝트별 과제 목록", description = "특정 스터디/프로젝트에 속한 모든 과제 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByStudyProject(@PathVariable Long studyProjectId) {
        List<AssignmentResponse> assignments = assignmentService.getAssignmentsByStudyProject(studyProjectId);
        return ApiResponse.success("스터디/프로젝트별 과제 목록 조회가 성공했습니다.", assignments);
    }

    /**
     * 멤버별 과제 목록 조회
     * 로그인한 사용자가 선택된 스터디 프로젝트에서 자신의 과제 목록을 조회합니다.
     */
    @GetMapping("/member/current")
    @Operation(summary = "현재 사용자의 과제 목록", 
              description = "로그인한 사용자가 선택된 스터디 프로젝트에서 자신의 과제 목록을 조회합니다.\n\n" +
                           "**권한:** 로그인한 사용자만 조회 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getCurrentUserAssignments(
            @Parameter(description = "스터디 프로젝트 ID", example = "14", required = true)
            @RequestParam(name = "studyProjectId", required = true) Long studyProjectId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            // JWT 토큰에서 userId 추출 (Bearer 접두사 제거 및 공백 정리)
            String token = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7).trim(); // 공백 제거
            }
            
            if (token == null || token.isEmpty()) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }
            
            String userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }

            // 사용자의 memberId 조회
            Long memberId = memberService.getMemberIdByUserIdAndStudyProjectId(userId, studyProjectId);
            if (memberId == null) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "해당 스터디/프로젝트의 멤버가 아닙니다.", null);
            }

            List<AssignmentResponse> assignments = assignmentService.getAssignmentsByMember(memberId);
            return ApiResponse.success("현재 사용자의 과제 목록 조회가 성공했습니다.", assignments);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "과제 목록 조회에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 특정 멤버의 과제 목록 조회 (관리자용)
     * 특정 멤버가 작성한 모든 과제 목록을 조회합니다.
     */
    @GetMapping("/member/{memberId}")
    @Operation(summary = "특정 멤버의 과제 목록", 
              description = "특정 멤버가 작성한 모든 과제 목록을 조회합니다.\n\n" +
                           "**권한:** 스터디/프로젝트 리더만 조회 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByMember(
            @PathVariable Long memberId,
            @Parameter(description = "스터디 프로젝트 ID", example = "14", required = true)
            @RequestParam(name = "studyProjectId", required = true) Long studyProjectId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            // JWT 토큰에서 userId 추출 (Bearer 접두사 제거 및 공백 정리)
            String token = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7).trim(); // 공백 제거
            }
            
            if (token == null || token.isEmpty()) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }
            
            String userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }

            // 사용자가 해당 스터디/프로젝트의 리더인지 확인
            if (!memberService.isLeader(studyProjectId, userId)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, "해당 멤버의 과제 목록을 조회할 권한이 없습니다.", null);
            }

            List<AssignmentResponse> assignments = assignmentService.getAssignmentsByMember(memberId);
            return ApiResponse.success("멤버별 과제 목록 조회가 성공했습니다.", assignments);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "과제 목록 조회에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 과제 수정
     * 기존 과제 정보를 수정합니다.
     * 
     * @param assignmentId 수정할 과제의 ID
     * @param request 수정할 과제 정보 (제목, 설명, 마감일, 파일URL)
     * @return 수정된 과제 정보
     */
    @PutMapping("/{assignmentId}")
    @Operation(summary = "과제 수정", 
              description = "기존 과제 정보를 수정합니다.\n\n" +
                           "**권한:** 스터디/프로젝트 리더만 과제 수정 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @PathVariable Long assignmentId,
            @RequestBody AssignmentUpdateRequest request,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            // JWT 토큰에서 userId 추출 (Bearer 접두사 제거 및 공백 정리)
            String token = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7).trim(); // 공백 제거
            }
            
            if (token == null || token.isEmpty()) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }
            
            String userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }

            AssignmentResponse response = assignmentService.updateAssignment(assignmentId, request, userId);
            return ApiResponse.success("과제가 성공적으로 수정되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "과제 수정에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 과제 삭제
     * 특정 과제를 데이터베이스에서 삭제합니다.
     * 
     * @param assignmentId 삭제할 과제의 ID
     * @return 삭제 성공 시 204 No Content
     */
    @DeleteMapping("/{assignmentId}")
    @Operation(summary = "과제 삭제", 
              description = "특정 과제를 데이터베이스에서 삭제합니다.\n\n" +
                           "**권한:** 스터디/프로젝트 리더만 과제 삭제 가능")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> deleteAssignment(
            @PathVariable Long assignmentId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            // JWT 토큰에서 userId 추출 (Bearer 접두사 제거 및 공백 정리)
            String token = null;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7).trim(); // 공백 제거
            }
            
            if (token == null || token.isEmpty()) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }
            
            String userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ApiResponse.error(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.", null);
            }

            assignmentService.deleteAssignment(assignmentId, userId);
            return ApiResponse.success("과제가 성공적으로 삭제되었습니다.", "삭제 완료");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "과제 삭제에 실패했습니다: " + e.getMessage(), null);
        }
    }
}

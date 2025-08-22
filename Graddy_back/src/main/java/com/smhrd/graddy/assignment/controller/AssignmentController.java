package com.smhrd.graddy.assignment.controller;

import com.smhrd.graddy.assignment.dto.AssignmentRequest;
import com.smhrd.graddy.assignment.dto.AssignmentResponse;
import com.smhrd.graddy.assignment.dto.AssignmentUpdateRequest;
import com.smhrd.graddy.assignment.service.AssignmentService;
import com.smhrd.graddy.api.dto.ApiResponse;
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

    /**
     * 과제 생성
     * 새로운 과제를 생성하고 데이터베이스에 저장합니다.
     * 
     * @param request 과제 생성에 필요한 정보 (스터디ID, 사용자ID, 제목, 설명, 마감일, 파일URL)
     * @return 생성된 과제 정보
     */
    @PostMapping
    @Operation(summary = "과제 생성", description = "새로운 과제를 생성하고 데이터베이스에 저장합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @RequestBody AssignmentRequest request,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            AssignmentResponse response = assignmentService.createAssignment(request);
            URI location = URI.create("/api/assignments/" + response.getAssignmentId());
            return ApiResponse.created(location, "과제가 성공적으로 생성되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "과제 생성에 실패했습니다.", null);
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
     * 스터디별 과제 목록 조회
     * 특정 스터디에 속한 모든 과제 목록을 조회합니다.
     */
    @GetMapping("/study/{studyId}")
    @Operation(summary = "스터디별 과제 목록", description = "특정 스터디에 속한 모든 과제 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByStudy(@PathVariable Long studyId) {
        List<AssignmentResponse> assignments = assignmentService.getAssignmentsByStudy(studyId);
        return ApiResponse.success("스터디별 과제 목록 조회가 성공했습니다.", assignments);
    }

    /**
     * 사용자별 과제 목록 조회
     * 특정 사용자가 작성한 모든 과제 목록을 조회합니다.
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "사용자별 과제 목록", description = "특정 사용자가 작성한 모든 과제 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> getAssignmentsByUser(@PathVariable String userId) {
        List<AssignmentResponse> assignments = assignmentService.getAssignmentsByUser(userId);
        return ApiResponse.success("사용자별 과제 목록 조회가 성공했습니다.", assignments);
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
    @Operation(summary = "과제 수정", description = "기존 과제 정보를 수정합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @PathVariable Long assignmentId,
            @RequestBody AssignmentUpdateRequest request,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            AssignmentResponse response = assignmentService.updateAssignment(assignmentId, request);
            return ApiResponse.success("과제가 성공적으로 수정되었습니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "과제를 찾을 수 없습니다.", null);
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
    @Operation(summary = "과제 삭제", description = "특정 과제를 데이터베이스에서 삭제합니다.")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> deleteAssignment(
            @PathVariable Long assignmentId,
            @Parameter(description = "JWT 토큰", example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
            @RequestHeader(name = "Authorization", required = false) String authorization) {
        try {
            assignmentService.deleteAssignment(assignmentId);
            return ApiResponse.success("과제가 성공적으로 삭제되었습니다.", "삭제 완료");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "과제를 찾을 수 없습니다.", null);
        }
    }
}

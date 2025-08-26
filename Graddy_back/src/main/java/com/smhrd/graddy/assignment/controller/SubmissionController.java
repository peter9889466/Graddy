package com.smhrd.graddy.assignment.controller;

import com.smhrd.graddy.assignment.dto.SubmissionRequest;
import com.smhrd.graddy.assignment.dto.SubmissionResponse;
import com.smhrd.graddy.assignment.service.SubmissionService;
import com.smhrd.graddy.api.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.util.List;

@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
@Tag(name = "과제 제출", description = "과제 제출 및 관리 API")
public class SubmissionController {

    private final SubmissionService submissionService;

    /**
     * 과제 제출 (자동 AI 피드백 생성 포함)
     */
    @PostMapping("/submit")
    @Operation(summary = "과제 제출",
              description = "과제를 제출하고 자동으로 AI 피드백을 생성합니다.\n\n" +
                           "**자동 기능:**\n" +
                           "• 과제 제출 시 자동으로 AI 피드백 생성\n" +
                           "• 비동기 처리로 제출 응답 지연 없음\n" +
                           "• 피드백 생성 실패 시에도 제출은 정상 처리")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitAssignment(
            @RequestBody SubmissionRequest request) {
        try {
            SubmissionResponse response = submissionService.submitAssignment(request);
            return ApiResponse.success("과제가 성공적으로 제출되었습니다. AI 피드백이 자동으로 생성됩니다.", response);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "과제 제출에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 과제별 제출 목록 조회
     */
    @GetMapping("/assignment/{assignmentId}")
    @Operation(summary = "과제별 제출 목록",
              description = "특정 과제에 대한 모든 제출을 조회합니다.")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByAssignment(
            @Parameter(description = "과제 ID", example = "1", required = true)
            @PathVariable Long assignmentId) {
        try {
            List<SubmissionResponse> submissions = submissionService.getSubmissionsByAssignment(assignmentId);
            return ApiResponse.success("과제별 제출 목록 조회가 성공했습니다.", submissions);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "제출 목록 조회에 실패했습니다.", null);
        }
    }

    /**
     * 멤버별 제출 목록 조회
     */
    @GetMapping("/member/{memberId}")
    @Operation(summary = "멤버별 제출 목록",
              description = "특정 멤버가 제출한 모든 과제를 조회합니다.")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmissionsByMember(
            @Parameter(description = "멤버 ID", example = "1", required = true)
            @PathVariable Long memberId) {
        try {
            List<SubmissionResponse> submissions = submissionService.getSubmissionsByMember(memberId);
            return ApiResponse.success("멤버별 제출 목록 조회가 성공했습니다.", submissions);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "제출 목록 조회에 실패했습니다.", null);
        }
    }

    /**
     * 특정 과제의 특정 멤버 제출 조회
     */
    @GetMapping("/assignment/{assignmentId}/member/{memberId}")
    @Operation(summary = "특정 제출 조회",
              description = "특정 과제에 대한 특정 멤버의 제출을 조회합니다.")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmissionByAssignmentAndMember(
            @Parameter(description = "과제 ID", example = "1", required = true)
            @PathVariable Long assignmentId,
            @Parameter(description = "멤버 ID", example = "1", required = true)
            @PathVariable Long memberId) {
        try {
            SubmissionResponse submission = submissionService.getSubmissionByAssignmentAndMember(assignmentId, memberId);
            return ApiResponse.success("제출 조회가 성공했습니다.", submission);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "제출 조회에 실패했습니다.", null);
        }
    }

    /**
     * 과제별 제출 수 조회
     */
    @GetMapping("/assignment/{assignmentId}/count")
    @Operation(summary = "과제별 제출 수",
              description = "특정 과제에 대한 제출 수를 조회합니다.")
    public ResponseEntity<ApiResponse<Long>> getSubmissionCountByAssignment(
            @Parameter(description = "과제 ID", example = "1", required = true)
            @PathVariable Long assignmentId) {
        try {
            Long count = submissionService.getSubmissionCountByAssignment(assignmentId);
            return ApiResponse.success("과제별 제출 수 조회가 성공했습니다.", count);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "제출 수 조회에 실패했습니다.", null);
        }
    }
}

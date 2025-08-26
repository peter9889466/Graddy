package com.smhrd.graddy.assignment.controller;

import com.smhrd.graddy.assignment.dto.FeedbackRequest;
import com.smhrd.graddy.assignment.dto.FeedbackResponse;
import com.smhrd.graddy.assignment.service.FeedbackService;
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
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
@Tag(name = "과제 피드백", description = "GPT를 활용한 과제 제출 피드백 생성 및 관리 API")
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * GPT를 사용하여 과제 제출에 대한 피드백 생성
     */
    @PostMapping("/generate")
    @Operation(summary = "GPT 피드백 생성",
              description = "OpenAI GPT를 사용하여 과제 제출에 대한 자동 피드백을 생성합니다.\n\n" +
                           "**평가 기준:**\n" +
                           "• 내용의 완성도, 창의성, 논리적 구조, 기술적 정확성, 표현력\n" +
                           "• 점수 범위: -5 ~ 10점\n" +
                           "• 상세한 피드백과 개선 방안 제공")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<FeedbackResponse>> generateFeedback(
            @RequestBody FeedbackRequest request) {
        try {
            FeedbackResponse response = feedbackService.generateFeedback(request);
            return ApiResponse.success("GPT 피드백이 성공적으로 생성되었습니다.", response);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "피드백 생성에 실패했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * 제출별 피드백 목록 조회
     */
    @GetMapping("/submission/{submissionId}")
    @Operation(summary = "제출별 피드백 목록",
              description = "특정 과제 제출에 대한 모든 피드백을 조회합니다.")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedbacksBySubmission(
            @Parameter(description = "제출 ID", example = "1", required = true)
            @PathVariable Long submissionId) {
        try {
            List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksBySubmission(submissionId);
            return ApiResponse.success("제출별 피드백 조회가 성공했습니다.", feedbacks);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "피드백 조회에 실패했습니다.", null);
        }
    }

    /**
     * 멤버별 피드백 목록 조회
     */
    @GetMapping("/member/{memberId}")
    @Operation(summary = "멤버별 피드백 목록",
              description = "특정 멤버가 받은 모든 피드백을 조회합니다.")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getFeedbacksByMember(
            @Parameter(description = "멤버 ID", example = "1", required = true)
            @PathVariable Long memberId) {
        try {
            List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByMember(memberId);
            return ApiResponse.success("멤버별 피드백 조회가 성공했습니다.", feedbacks);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "피드백 조회에 실패했습니다.", null);
        }
    }

    /**
     * 특정 제출의 특정 멤버 피드백 조회
     */
    @GetMapping("/submission/{submissionId}/member/{memberId}")
    @Operation(summary = "특정 피드백 조회",
              description = "특정 제출에 대한 특정 멤버의 피드백을 조회합니다.")
    public ResponseEntity<ApiResponse<FeedbackResponse>> getFeedbackBySubmissionAndMember(
            @Parameter(description = "제출 ID", example = "1", required = true)
            @PathVariable Long submissionId,
            @Parameter(description = "멤버 ID", example = "1", required = true)
            @PathVariable Long memberId) {
        try {
            FeedbackResponse feedback = feedbackService.getFeedbackBySubmissionAndMember(submissionId, memberId);
            return ApiResponse.success("피드백 조회가 성공했습니다.", feedback);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage(), null);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "피드백 조회에 실패했습니다.", null);
        }
    }

    /**
     * 제출별 평균 점수 조회
     */
    @GetMapping("/submission/{submissionId}/average-score")
    @Operation(summary = "평균 점수 조회",
              description = "특정 과제 제출에 대한 모든 피드백의 평균 점수를 조회합니다.")
    public ResponseEntity<ApiResponse<Double>> getAverageScoreBySubmission(
            @Parameter(description = "제출 ID", example = "1", required = true)
            @PathVariable Long submissionId) {
        try {
            Double averageScore = feedbackService.getAverageScoreBySubmission(submissionId);
            return ApiResponse.success("평균 점수 조회가 성공했습니다.", averageScore);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, 
                "평균 점수 조회에 실패했습니다.", null);
        }
    }
}

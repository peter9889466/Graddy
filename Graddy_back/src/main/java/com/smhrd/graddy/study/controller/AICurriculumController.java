package com.smhrd.graddy.study.controller;

import com.smhrd.graddy.study.dto.AICurriculumResponse;
import com.smhrd.graddy.study.service.AICurriculumService;
import com.smhrd.graddy.api.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * AI 커리큘럼 생성 API 컨트롤러
 * OpenAI GPT를 활용하여 스터디/프로젝트 커리큘럼을 자동 생성합니다.
 * 
 * @author Graddy Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/ai-curriculum")
@RequiredArgsConstructor
@Tag(
    name = "AI 커리큘럼 생성", 
    description = "OpenAI GPT를 활용한 스터디/프로젝트 커리큘럼 자동 생성 API",
    externalDocs = @io.swagger.v3.oas.annotations.ExternalDocumentation(
        description = "AI 커리큘럼 시스템 가이드",
        url = "https://github.com/graddy/ai-curriculum-guide"
    )
)
public class AICurriculumController {

    private final AICurriculumService aiCurriculumService;

    /**
     * AI 커리큘럼 생성
     * FastAPI 서버를 통해 OpenAI GPT로 커리큘럼을 생성합니다.
     * 
     * @param studyProjectId 커리큘럼을 생성할 스터디/프로젝트의 ID
     * @return 생성된 AI 커리큘럼 정보
     */
    @PostMapping("/generate/{studyProjectId}")
    @Operation(
        summary = "AI 커리큘럼 생성", 
        description = "OpenAI GPT를 활용하여 스터디/프로젝트 커리큘럼을 자동 생성합니다.\n\n" +
                     "**주요 기능:**\n" +
                     "• 스터디/프로젝트 정보 기반 맞춤형 커리큘럼 생성\n" +
                     "• 관심 분야 태그를 반영한 전문적인 내용 구성\n" +
                     "• 레벨별(초급/중급/고급) 난이도 조정\n" +
                     "• 주차별 학습 목표, 주요 내용, 실습 과제 포함\n" +
                     "• 생성된 커리큘럼은 자동으로 데이터베이스에 저장\n\n" +
                     "**처리 과정:**\n" +
                     "1. 스터디/프로젝트 정보 및 태그 조회\n" +
                     "2. FastAPI AI 서버로 요청 전송\n" +
                     "3. OpenAI GPT를 통한 커리큘럼 생성\n" +
                     "4. 결과를 데이터베이스에 저장 및 반환\n\n" +
                     "**주의사항:**\n" +
                     "• FastAPI AI 서버가 실행 중이어야 함 (포트 8000)\n" +
                     "• OpenAI API 키가 설정되어 있어야 함\n" +
                     "• 스터디/프로젝트 ID가 유효해야 함",
        operationId = "generateAICurriculum"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "커리큘럼 생성 성공",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    name = "성공 응답 예시",
                    summary = "AI 커리큘럼 생성 성공",
                    description = "OpenAI GPT를 통해 생성된 커리큘럼 정보",
                    value = """
                    {
                        "status": 200,
                        "message": "AI 커리큘럼이 성공적으로 생성되었습니다.",
                        "data": {
                            "studyId": 1,
                            "curriculum": "# 웹개발 스터디 커리큘럼\\n\\n## 1주차\\n- **학습 목표:** HTML/CSS 기초\\n- **주요 내용:** HTML 구조, CSS 스타일링\\n- **실습 과제:** 개인 포트폴리오 페이지 제작",
                            "message": "AI 커리큘럼이 성공적으로 생성되었습니다.",
                            "success": true
                        }
                    }
                    """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "잘못된 요청",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    name = "잘못된 요청 예시",
                    summary = "스터디/프로젝트 ID 오류",
                    value = """
                    {
                        "status": 400,
                        "message": "스터디/프로젝트를 찾을 수 없습니다.",
                        "data": null
                    }
                    """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500",
            description = "서버 내부 오류",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    name = "서버 오류 예시",
                    summary = "AI 서버 연결 실패",
                    value = """
                    {
                        "status": 500,
                        "message": "AI 서버에 연결할 수 없습니다.",
                        "data": null
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<AICurriculumResponse>> generateCurriculum(
            @Parameter(
                description = "커리큘럼을 생성할 스터디/프로젝트의 ID",
                example = "1",
                required = true,
                schema = @Schema(
                    type = "integer",
                    minimum = "1",
                    description = "데이터베이스에 존재하는 유효한 스터디/프로젝트 ID"
                )
            )
            @PathVariable Long studyProjectId) {
        try {
            AICurriculumResponse response = aiCurriculumService.generateCurriculum(studyProjectId);
            
            if (response.isSuccess()) {
                return ApiResponse.success("AI 커리큘럼이 성공적으로 생성되었습니다.", response);
            } else {
                return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, response.getMessage(), response);
            }
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "커리큘럼 생성 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }

    /**
     * FastAPI 서버 상태 확인
     * AI 커리큘럼 생성 서버의 상태를 확인합니다.
     * 
     * @return 서버 상태 정보
     */
    @GetMapping("/health")
    @Operation(
        summary = "AI 서버 상태 확인", 
        description = "FastAPI 기반 AI 커리큘럼 생성 서버의 상태를 확인합니다.\n\n" +
                     "**확인 항목:**\n" +
                     "• AI 서버 연결 상태\n" +
                     "• 네트워크 응답성\n" +
                     "• 서비스 가용성\n\n" +
                     "**사용 시나리오:**\n" +
                     "• 시스템 모니터링\n" +
                     "• 문제 진단\n" +
                     "• 서비스 상태 확인",
        operationId = "checkAIServerHealth"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "AI 서버 상태 확인 성공",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    name = "서버 정상 예시",
                    summary = "AI 서버 정상 동작",
                    value = """
                    {
                        "status": 200,
                        "message": "AI 서버가 정상적으로 동작하고 있습니다.",
                        "data": "healthy"
                    }
                    """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "503",
            description = "AI 서버 연결 실패",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    name = "서버 연결 실패 예시",
                    summary = "AI 서버 연결 불가",
                    value = """
                    {
                        "status": 503,
                        "message": "AI 서버에 연결할 수 없습니다.",
                        "data": null
                    }
                    """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<String>> checkAIServerHealth() {
        try {
            boolean isHealthy = aiCurriculumService.checkAIServerHealth();
            
            if (isHealthy) {
                return ApiResponse.success("AI 서버가 정상적으로 동작하고 있습니다.", "healthy");
            } else {
                return ApiResponse.error(HttpStatus.SERVICE_UNAVAILABLE, "AI 서버에 연결할 수 없습니다.", "unhealthy");
            }
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.SERVICE_UNAVAILABLE, "AI 서버 상태 확인 중 오류가 발생했습니다: " + e.getMessage(), null);
        }
    }
}

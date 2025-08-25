package com.smhrd.graddy.study.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

/**
 * AI 커리큘럼 생성 응답 DTO
 * OpenAI GPT를 통해 생성된 커리큘럼 정보를 담습니다.
 * 
 * @author Graddy Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Schema(
    name = "AICurriculumResponse",
    description = "AI 커리큘럼 생성 응답 데이터",
    example = """
    {
        "studyId": 1,
        "curriculum": "# 웹개발 스터디 커리큘럼\\n\\n## 1주차\\n- **학습 목표:** HTML/CSS 기초\\n- **주요 내용:** HTML 구조, CSS 스타일링\\n- **실습 과제:** 개인 포트폴리오 페이지 제작",
        "message": "AI 커리큘럼이 성공적으로 생성되었습니다.",
        "success": true
    }
    """
)
public class AICurriculumResponse {
    
    @Schema(
        description = "스터디/프로젝트 ID",
        example = "1",
        type = "integer",
//        minimum = 1,
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Long studyId;
    
    @Schema(
        description = "AI가 생성한 커리큘럼 내용 (마크다운 형식)",
        example = "# 웹개발 스터디 커리큘럼\\n\\n## 1주차\\n- **학습 목표:** HTML/CSS 기초\\n- **주요 내용:** HTML 구조, CSS 스타일링\\n- **실습 과제:** 개인 포트폴리오 페이지 제작",
        type = "string",
        requiredMode = Schema.RequiredMode.REQUIRED,
        maxLength = 10000
    )
    private String curriculum;
    
    @Schema(
        description = "응답 메시지",
        example = "AI 커리큘럼이 성공적으로 생성되었습니다.",
        type = "string",
        requiredMode = Schema.RequiredMode.REQUIRED,
        maxLength = 500
    )
    private String message;
    
    @Schema(
        description = "커리큘럼 생성 성공 여부",
        example = "true",
        type = "boolean",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private boolean success;

    // 기본 생성자
    public AICurriculumResponse() {
        this.success = false;
    }

    // 전체 생성자
    public AICurriculumResponse(Long studyId, String curriculum, String message, boolean success) {
        this.studyId = studyId;
        this.curriculum = curriculum;
        this.message = message;
        this.success = success;
    }

    // 빌더 패턴
    public static Builder builder() {
        return new Builder();
    }

    // Getter와 Setter
    public Long getStudyId() { return studyId; }
    public void setStudyId(Long studyId) { this.studyId = studyId; }

    public String getCurriculum() { return curriculum; }
    public void setCurriculum(String curriculum) { this.curriculum = curriculum; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    /**
     * 빌더 클래스
     * AICurriculumResponse 객체를 체이닝 방식으로 생성할 수 있습니다.
     */
    @Schema(description = "AICurriculumResponse 빌더 클래스")
    public static class Builder {
        
        @Schema(description = "스터디/프로젝트 ID")
        private Long studyId;
        
        @Schema(description = "AI가 생성한 커리큘럼 내용")
        private String curriculum;
        
        @Schema(description = "응답 메시지")
        private String message;
        
        @Schema(description = "커리큘럼 생성 성공 여부")
        private boolean success = false;

        public Builder studyId(Long studyId) {
            this.studyId = studyId;
            return this;
        }

        public Builder curriculum(String curriculum) {
            this.curriculum = curriculum;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public AICurriculumResponse build() {
            return new AICurriculumResponse(studyId, curriculum, message, success);
        }
    }
}

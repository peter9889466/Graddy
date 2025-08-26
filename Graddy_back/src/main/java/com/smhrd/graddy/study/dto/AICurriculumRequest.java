package com.smhrd.graddy.study.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * AI 커리큘럼 생성 요청 DTO
 * AI 커리큘럼 생성을 위해 필요한 스터디/프로젝트 정보를 담습니다.
 * 
 * @author Graddy Team
 * @version 1.0.0
 * @since 2024-01-01
 */
@Getter
@Setter
@NoArgsConstructor
@Schema(
    name = "AICurriculumRequest",
    description = "AI 커리큘럼 생성 요청 데이터",
    example = """
    {
        "studyId": 1,
        "studyName": "웹개발 스터디",
        "studyTitle": "React와 Spring Boot로 풀스택 개발하기",
        "studyDesc": "풀스택 웹 개발을 배우는 스터디입니다.",
        "studyLevel": 2,
        "interestTags": ["React", "Spring Boot", "웹개발"],
        "studyStart": "2024-01-01",
        "studyEnd": "2024-03-31"
    }
    """
)
public class AICurriculumRequest {
    
    @Schema(
        description = "스터디/프로젝트 ID",
        example = "1",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Long studyId;
    
    @Schema(
        description = "스터디/프로젝트 이름",
        example = "웹개발 스터디",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String studyName;
    
    @Schema(
        description = "스터디/프로젝트 제목",
        example = "React와 Spring Boot로 풀스택 개발하기",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String studyTitle;
    
    @Schema(
        description = "스터디/프로젝트 설명",
        example = "풀스택 웹 개발을 배우는 스터디입니다.",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String studyDesc;
    
    @Schema(
        description = "스터디/프로젝트 레벨 (1: 초급, 2: 중급, 3: 고급)",
        example = "2",
        allowableValues = {"1", "2", "3"},
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private Integer studyLevel;
    
    @Schema(
        description = "관심 분야 태그 목록",
        example = "[\"React\", \"Spring Boot\", \"웹개발\"]",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private List<String> interestTags;
    
    @Schema(
        description = "스터디/프로젝트 시작일 (YYYY-MM-DD 형식)",
        example = "2024-01-01",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String studyStart;
    
    @Schema(
        description = "스터디/프로젝트 종료일 (YYYY-MM-DD 형식)",
        example = "2024-03-31",
        requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String studyEnd;
}

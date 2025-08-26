package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "과제 생성 요청")
public class AssignmentRequest {

    @Schema(description = "스터디/프로젝트 ID", example = "14", required = true)
    private Long studyProjectId;
    
    @Schema(description = "과제 제목", example = "AI 과제 생성 테스트", required = true)
    private String title;
    
    @Schema(description = "과제 설명", example = "AI가 생성한 과제입니다.", required = true)
    private String description;
    
    @Schema(description = "과제 마감일 (설정하지 않으면 생성일로부터 7일 뒤로 자동 설정)", example = "2025-08-31 23:59:59")
    private Timestamp deadline;
    
    @Schema(description = "과제 첨부 파일 URL", example = "https://example.com/file.pdf")
    private String fileUrl;
}

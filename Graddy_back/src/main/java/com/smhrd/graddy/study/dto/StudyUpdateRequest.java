package com.smhrd.graddy.study.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "스터디/프로젝트 수정 요청 DTO")
public class StudyUpdateRequest {

    @Schema(description = "스터디/프로젝트 명", example = "웹개발 스터디")
    private String studyProjectName;
    
    @Schema(description = "스터디/프로젝트 제목", example = "React와 Spring Boot로 풀스택 개발하기")
    private String studyProjectTitle;
    
    @Schema(description = "스터디/프로젝트 설명", example = "풀스택 웹 애플리케이션 개발 스터디")
    private String studyProjectDesc;
    
    @Schema(description = "스터디 레벨", example = "2")
    private Integer studyLevel; // null 체크를 위해 Integer로 변경
    
    @Schema(description = "타입 구분", example = "study", allowableValues = {"study", "project"})
    private String typeCheck; // "study" 또는 "project"
    
    @Schema(description = "모집 상태", example = "recruitment", allowableValues = {"recruitment", "complete", "end"})
    private String isRecruiting; // "recruitment", "complete", "end" (소문자로 전송)
    
    @Schema(description = "스터디/프로젝트 시작일")
    private LocalDateTime studyProjectStart;
    
    @Schema(description = "스터디/프로젝트 종료일")
    private LocalDateTime studyProjectEnd;
    
    @Schema(description = "스터디/프로젝트 총원", example = "5")
    private Integer studyProjectTotal; // null 체크를 위해 Integer로 변경
    
    @Schema(description = "선호 시작 시간")
    private LocalDateTime soltStart;
    
    @Schema(description = "선호 종료 시간")
    private LocalDateTime soltEnd;
    
    @Schema(description = "Git 저장소 URL", example = "https://github.com/username/project-name")
    private String gitUrl;
    
    @Schema(description = "관심 항목 ID 리스트")
    private List<Long> interestIds;
    
    @Schema(description = "선호 요일 ID 리스트")
    private List<Byte> dayIds;
}

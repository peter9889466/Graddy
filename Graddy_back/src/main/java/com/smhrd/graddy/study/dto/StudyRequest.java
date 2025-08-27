package com.smhrd.graddy.study.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "스터디/프로젝트 생성 요청 DTO")
public class StudyRequest {

    @Schema(description = "스터디/프로젝트 명", required = true)
    private String studyProjectName;
    
    @Schema(description = "스터디/프로젝트 제목", required = true)
    private String studyProjectTitle;
    
    @Schema(description = "스터디/프로젝트 설명",  required = true)
    private String studyProjectDesc;
    
    @Schema(description = "스터디 레벨", required = true)
    private Integer studyLevel;
    
    @Schema(description = "타입 구분", example = "study", allowableValues = {"study", "project"}, required = true)
    private String typeCheck;
    
    @Schema(description = "리더 아이디",  required = true)
    private String userId;
    
    @Schema(description = "스터디/프로젝트 시작일", required = true)
    private LocalDateTime studyProjectStart;
    
    @Schema(description = "스터디/프로젝트 종료일", required = true)
    private LocalDateTime studyProjectEnd;
    
    @Schema(description = "스터디/프로젝트 총원",  required = true)
    private Integer studyProjectTotal;
    
    @Schema(description = "선호 시작 시간")
    private LocalDateTime soltStart;
    
    @Schema(description = "선호 종료 시간")
    private LocalDateTime soltEnd;
    
    @Schema(description = "Git 저장소 URL")
    private String gitUrl;
    
    @Schema(description = "관심 항목 ID 리스트")
    private List<Long> interestIds;
    
    @Schema(description = "선호 요일 ID 리스트")
    private List<Byte> dayIds;
}

package com.smhrd.graddy.study.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyProjectStatusInfo {
    
    @Schema(description = "사용자 ID")
    private String userId;
    
    @Schema(description = "스터디 프로젝트 ID")
    private Long studyProjectId;
    
    @Schema(description = "상태", example = "PENDING", allowableValues = {"PENDING", "REJECTED"})
    private String status;
    
    @Schema(description = "가입 시간")
    private LocalDateTime joinedAt;
}

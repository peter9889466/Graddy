package com.smhrd.graddy.assignment.dto;

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
public class AiAssignmentRequest {
    
    private Long studyProjectId; // 스터디 프로젝트 ID
    
    @Builder.Default
    private String assignmentType = "과제"; // 과제 유형: 기본값 "과제"
    
    private LocalDateTime deadline; // 마감일 (null이면 7일 후 자동 설정)
}

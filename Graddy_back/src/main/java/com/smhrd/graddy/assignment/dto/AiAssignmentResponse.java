package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAssignmentResponse {
    
    private Long assignmentId;
    private Long studyProjectId;
    private Long memberId;
    private String title;
    private String description;
    private Timestamp deadline;
    private String fileUrl;
    private Timestamp createdAt;
}

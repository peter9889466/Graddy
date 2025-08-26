package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentDetailResponse {
    
    // 과제 정보
    private Long assignmentId;
    private Long studyProjectId;
    private Long memberId;
    private String title;
    private String description;
    private Timestamp deadline;
    private String fileUrl;
    private Timestamp createdAt;
    
    // 제출물 정보 리스트
    private List<SubmissionDetailResponse> submissions;
    
    // 제출물이 없는 경우를 위한 메시지
    private String submissionMessage;
}

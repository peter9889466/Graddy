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
public class SubmissionDetailResponse {
    
    // 제출물 정보
    private Long submissionId;
    private Long assignmentId;
    private Long memberId;
    private String content;
    private String fileUrl;
    private Timestamp createdAt;
    
    // 피드백 정보 리스트
    private List<FeedbackDetailResponse> feedbacks;
    
    // 피드백이 없는 경우를 위한 메시지
    private String feedbackMessage;
}

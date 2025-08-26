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
public class FeedbackDetailResponse {
    
    // 피드백 정보
    private Long feedId;
    private Long memberId;
    private Long submissionId;
    private Integer score;
    private String comment;
    private Timestamp createdAt;
}

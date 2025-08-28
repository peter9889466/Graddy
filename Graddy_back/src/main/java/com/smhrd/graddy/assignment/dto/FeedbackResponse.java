package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {

    private Long feedId;
    private Long memberId;
    private Long submissionId;
    private Integer score;
    private String comment;
    private Timestamp createdAt;
}



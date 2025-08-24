package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {

    private Long assignmentId;
    private Long memberId;
    private Long submissionId;
    private String assignmentTitle;
    private String assignmentDescription;
    private String submissionContent;
    private String submissionFileUrl;
}

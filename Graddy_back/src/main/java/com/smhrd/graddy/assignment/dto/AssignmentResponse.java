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
public class AssignmentResponse {

    private Long assignmentId;
    private Long studyProjectId;
    private Long memberId;
    private String title;
    private String description;
    private Timestamp deadline;
    private String fileUrl;
    private Timestamp createdAt;
}

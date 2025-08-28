package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentGenerationRequest {

    private Long studyProjectId;
    private String studyProjectName;
    private String studyProjectTitle;
    private String studyProjectDesc;
    private Integer studyLevel;
    private List<String> interestTags;
    private String studyProjectStart;
    private String studyProjectEnd;
    private String typeCheck = "study";
}



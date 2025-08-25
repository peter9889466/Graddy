package com.smhrd.graddy.assignment.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentGenerationResponse {

    private Long studyProjectId;
    private List<Map<String, Object>> assignments;  // 과제 목록 (JSON 형태)
    private String message;
    private Boolean success;
    private String generatedAt;
}

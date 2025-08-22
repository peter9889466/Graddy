package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyResponse {

    private Long studyProjectId;
    private String studyProjectName;
    private String studyProjectTitle;
    private String studyProjectDesc;
    private Integer studyLevel;
    private String typeCheck;
    private String userId;
    private String isRecruiting;
    private LocalDateTime studyProjectStart;
    private LocalDateTime studyProjectEnd;
    private Integer studyProjectTotal;
    private Timestamp soltStart;
    private Timestamp soltEnd;
    private LocalDateTime createdAt;
    private String curText;
    private List<String> tagNames;
    private List<Byte> availableDays;
}

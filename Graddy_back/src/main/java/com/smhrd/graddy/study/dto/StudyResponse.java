package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyResponse {

    private Long studyId;
    private String studyName;
    private String studyTitle;
    private String studyDesc;
    private Integer studyLevel;
    private String userId;
    private String isRecruiting;
    private Timestamp studyStart;
    private Timestamp studyEnd;
    private Integer studyTotal;
    private Timestamp soltStart;
    private Timestamp soltEnd;
    private Timestamp createdAt;
    
    // 태그 정보
    private List<String> tagNames;
}

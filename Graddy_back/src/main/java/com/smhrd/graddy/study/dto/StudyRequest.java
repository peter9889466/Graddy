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
public class StudyRequest {

    private String studyName;
    private String studyTitle;
    private String studyDesc;
    private Integer studyLevel;
    private String userId;
    private Timestamp studyStart;
    private Timestamp studyEnd;
    private Integer studyTotal;
    private Timestamp soltStart;
    private Timestamp soltEnd;
    
    // 태그 정보 (interest_id 리스트)
    private List<Long> interestIds;
}

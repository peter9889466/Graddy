package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyUpdateRequest {

    private String studyProjectName;
    private String studyProjectTitle;
    private String studyProjectDesc;
    private Integer studyLevel;
    private String typeCheck; // "study" 또는 "project"
    private String isRecruiting; // "recruitment", "complete", "end"
    private LocalDateTime studyProjectStart;
    private LocalDateTime studyProjectEnd;
    private Integer studyProjectTotal;
    private LocalDateTime soltStart;
    private LocalDateTime soltEnd;
    
    // 태그 정보 (interest_id 리스트)
    private List<Long> interestIds;
    
    // 선호 요일 정보 (day_id 리스트)
    private List<Byte> dayIds;
}

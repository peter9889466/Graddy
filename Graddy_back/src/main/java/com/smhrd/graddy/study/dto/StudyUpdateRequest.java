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
    private Integer studyLevel; // null 체크를 위해 Integer로 변경
    private String typeCheck; // "study" 또는 "project"
    private String isRecruiting; // "recruitment", "complete", "end" (소문자로 전송)
    private LocalDateTime studyProjectStart;
    private LocalDateTime studyProjectEnd;
    private Integer studyProjectTotal; // null 체크를 위해 Integer로 변경
    private LocalDateTime soltStart;
    private LocalDateTime soltEnd;
    
    // 태그 정보 (interest_id 리스트)
    private List<Long> interestIds;
    
    // 선호 요일 정보 (day_id 리스트)
    private List<Byte> dayIds;
}

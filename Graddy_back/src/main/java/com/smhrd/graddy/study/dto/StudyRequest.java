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
public class StudyRequest {

    private String studyProjectName;
    private String studyProjectTitle;
    private String studyProjectDesc;
    private Integer studyLevel;
    private String typeCheck; // "study" 또는 "project"
    
    // user_id는 JWT 토큰에서 자동으로 추출되어 설정됩니다.
    // 클라이언트에서는 이 필드를 보내지 않아도 됩니다.
    private String userId;
    
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

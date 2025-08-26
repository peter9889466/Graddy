package com.smhrd.graddy.schedule.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleResponse {
    
    private Long schId;
    private String userId;
    private Long studyProjectId;
    private String content;
    private LocalDateTime schTime;
    private String scheduleType; // "personal" 또는 "study"
    private String studyProjectName; // 스터디 일정인 경우에만
}

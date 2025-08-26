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
public class ScheduleRequest {
    
    private String userId;
    private Long studyProjectId; // null이면 개인 일정, 값이 있으면 스터디 일정
    private String content;
    private LocalDateTime schTime;
}

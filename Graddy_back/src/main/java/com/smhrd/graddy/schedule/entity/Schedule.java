package com.smhrd.graddy.schedule.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;

@Entity
@Table(name = "schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sch_id")
    private Long schId;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "study_project_id")
    private Long studyProjectId;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "sch_time", nullable = false)
    private Timestamp schTime;
    
    // 스터디 일정인지 개인 일정인지 구분하는 메서드
    public boolean isStudySchedule() {
        return studyProjectId != null;
    }
    
    public boolean isPersonalSchedule() {
        return studyProjectId == null;
    }
}

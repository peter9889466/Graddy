package com.smhrd.graddy.study.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "studies_projects")
@Getter
@Setter
@NoArgsConstructor
@ToString
@Schema(description = "스터디/프로젝트 정보")
public class StudyProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "study_project_id")
    @Schema(description = "스터디/프로젝트 ID", example = "1")
    private Long studyProjectId;

    @Column(name = "study_project_name", length = 50, nullable = false)
    @Schema(description = "스터디/프로젝트 명", example = "웹개발 스터디")
    private String studyProjectName;

    @Column(name = "study_project_title", columnDefinition = "TEXT", nullable = false)
    @Schema(description = "스터디/프로젝트 제목", example = "React와 Spring Boot로 풀스택 개발하기")
    private String studyProjectTitle;

    @Column(name = "study_project_desc", columnDefinition = "TEXT", nullable = false)
    @Schema(description = "스터디/프로젝트 설명", example = "React 프론트엔드와 Spring Boot 백엔드를 연동하여 풀스택 웹 애플리케이션을 개발하는 스터디입니다.")
    private String studyProjectDesc;

    @Column(name = "study_level")
    @Schema(description = "스터디 레벨", example = "1")
    private Integer studyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_check", nullable = false)
    @Schema(description = "타입 구분", example = "study")
    private TypeCheck typeCheck;

    @Column(name = "user_id", length = 50, nullable = false)
    @Schema(description = "리더 아이디", example = "user123")
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_recruiting", nullable = false)
    @Schema(description = "모집 상태", example = "recruitment")
    private RecruitingStatus isRecruiting;

    @Column(name = "study_project_start", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @Schema(description = "스터디/프로젝트 시작일")
    private Timestamp studyProjectStart;

    @Column(name = "study_project_end", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @Schema(description = "스터디/프로젝트 마감일")
    private Timestamp studyProjectEnd;

    @Column(name = "study_project_total", nullable = false)
    @Schema(description = "스터디/프로젝트 총원", example = "5")
    private Integer studyProjectTotal;

    @Column(name = "solt_start")
    @Temporal(TemporalType.TIMESTAMP)
    @Schema(description = "선호 시작 시간")
    private Timestamp soltStart;

    @Column(name = "solt_end")
    @Temporal(TemporalType.TIMESTAMP)
    @Schema(description = "선호 끝 시간")
    private Timestamp soltEnd;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @Schema(description = "개설 일자")
    private Timestamp createdAt;

    @Column(name = "cur_text", columnDefinition = "TEXT")
    @Schema(description = "커리큘럼 내용")
    private String curText;

    // 타입 구분 enum
    public enum TypeCheck {
        study, project
    }

    // 모집 상태 enum
    public enum RecruitingStatus {
        recruitment, complete, end
    }

    @PrePersist
    protected void onCreate() {
        createdAt = new Timestamp(System.currentTimeMillis());
    }
}

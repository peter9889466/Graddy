package com.smhrd.graddy.study.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Objects;

@Entity
@Table(name = "study_project_status")
@Getter
@Setter
@NoArgsConstructor
@ToString
@IdClass(StudyProjectStatus.StudyProjectStatusId.class)
@Schema(description = "스터디/프로젝트 신청 상태")
public class StudyProjectStatus {

    @Id
    @Column(name = "user_id", length = 50)
    @Schema(description = "유저 ID", example = "user123")
    private String userId;

    @Id
    @Column(name = "study_project_id")
    @Schema(description = "스터디/프로젝트 ID", example = "1")
    private Long studyProjectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Schema(description = "상태", example = "PENDING")
    private Status status;

    @Column(name = "joined_at", nullable = false, updatable = false)
    @Schema(description = "승인된 일시")
    private Timestamp joinedAt;

    // 상태 enum
    public enum Status {
        PENDING,    // 보류중
        REJECTED    // 거부됨
    }

    // 복합키 클래스
    @Embeddable
    public static class StudyProjectStatusId implements Serializable {
        private String userId;
        private Long studyProjectId;

        public StudyProjectStatusId() {}

        public StudyProjectStatusId(String userId, Long studyProjectId) {
            this.userId = userId;
            this.studyProjectId = studyProjectId;
        }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public Long getStudyProjectId() { return studyProjectId; }
        public void setStudyProjectId(Long studyProjectId) { this.studyProjectId = studyProjectId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            StudyProjectStatusId that = (StudyProjectStatusId) o;
            return Objects.equals(userId, that.userId) && Objects.equals(studyProjectId, that.studyProjectId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, studyProjectId);
        }
    }
}

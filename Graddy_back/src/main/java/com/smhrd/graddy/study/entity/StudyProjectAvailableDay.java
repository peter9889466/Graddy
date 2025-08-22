package com.smhrd.graddy.study.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "study_project_available_days")
@Getter
@Setter
@NoArgsConstructor
@ToString
@IdClass(StudyProjectAvailableDay.StudyProjectAvailableDayId.class)
@Schema(description = "스터디/프로젝트 선호 요일")
public class StudyProjectAvailableDay {

    @Id
    @Column(name = "study_project_id")
    @Schema(description = "스터디/프로젝트 ID", example = "1")
    private Long studyProjectId;

    @Id
    @Column(name = "day_id")
    @Schema(description = "요일 ID", example = "1")
    private Byte dayId;

    // 복합키 클래스
    @Embeddable
    public static class StudyProjectAvailableDayId implements Serializable {
        private Long studyProjectId;
        private Byte dayId;

        public StudyProjectAvailableDayId() {}

        public StudyProjectAvailableDayId(Long studyProjectId, Byte dayId) {
            this.studyProjectId = studyProjectId;
            this.dayId = dayId;
        }

        public Long getStudyProjectId() { return studyProjectId; }
        public void setStudyProjectId(Long studyProjectId) { this.studyProjectId = studyProjectId; }
        public Byte getDayId() { return dayId; }
        public void setDayId(Byte dayId) { this.dayId = dayId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            StudyProjectAvailableDayId that = (StudyProjectAvailableDayId) o;
            return Objects.equals(studyProjectId, that.studyProjectId) && Objects.equals(dayId, that.dayId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(studyProjectId, dayId);
        }
    }
}

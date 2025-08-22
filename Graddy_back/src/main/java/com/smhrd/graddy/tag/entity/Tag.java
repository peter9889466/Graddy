package com.smhrd.graddy.tag.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "tag")
@Getter
@Setter
@NoArgsConstructor
@ToString
@IdClass(TagId.class)
@Schema(description = "스터디/프로젝트 태그")
public class Tag {

    @Id
    @Column(name = "study_project_id")
    @Schema(description = "스터디/프로젝트 ID", example = "1")
    private Long studyProjectId;

    @Id
    @Column(name = "interest_id")
    @Schema(description = "관심 항목 ID", example = "1")
    private Long interestId;
}

// 복합키 클래스
@Embeddable
class TagId implements java.io.Serializable {
    private Long studyProjectId;
    private Long interestId;

    public TagId() {}

    public TagId(Long studyProjectId, Long interestId) {
        this.studyProjectId = studyProjectId;
        this.interestId = interestId;
    }

    public Long getStudyProjectId() { return studyProjectId; }
    public void setStudyProjectId(Long studyProjectId) { this.studyProjectId = studyProjectId; }
    public Long getInterestId() { return interestId; }
    public void setInterestId(Long interestId) { this.interestId = interestId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TagId tagId = (TagId) o;
        return Objects.equals(studyProjectId, tagId.studyProjectId) && Objects.equals(interestId, tagId.interestId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(studyProjectId, interestId);
    }
}

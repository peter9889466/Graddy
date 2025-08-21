package com.smhrd.graddy.tag.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Objects;

@Entity
@Table(name = "tag")
@Getter
@Setter
@NoArgsConstructor
@ToString
@IdClass(TagId.class)
public class Tag {

    @Id
    @Column(name = "study_id")
    private Long studyId;

    @Id
    @Column(name = "interest_id")
    private Long interestId;
}

// 복합키 클래스
@Embeddable
class TagId implements java.io.Serializable {
    private Long studyId;
    private Long interestId;

    public TagId() {}

    public TagId(Long studyId, Long interestId) {
        this.studyId = studyId;
        this.interestId = interestId;
    }

    public Long getStudyId() { return studyId; }
    public void setStudyId(Long studyId) { this.studyId = studyId; }
    public Long getInterestId() { return interestId; }
    public void setInterestId(Long interestId) { this.interestId = interestId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TagId tagId = (TagId) o;
        return Objects.equals(studyId, tagId.studyId) && Objects.equals(interestId, tagId.interestId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(studyId, interestId);
    }
}

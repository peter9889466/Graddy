package com.smhrd.graddy.study.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.sql.Timestamp;

@Entity
@Table(name = "study_project_member")
@Getter
@Setter
@NoArgsConstructor
@ToString
@Schema(description = "스터디/프로젝트 멤버")
public class StudyProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    @Schema(description = "멤버 ID", example = "1")
    private Long memberId;

    @Column(name = "user_id", length = 50, nullable = false)
    @Schema(description = "유저 ID", example = "user123")
    private String userId;

    @Column(name = "study_project_id", nullable = false)
    @Schema(description = "스터디/프로젝트 ID", example = "1")
    private Long studyProjectId;

    @Column(name = "joined_at", nullable = false)
    @Schema(description = "가입시간")
    private Timestamp joinedAt;
}

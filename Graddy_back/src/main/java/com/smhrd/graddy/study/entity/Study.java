package com.smhrd.graddy.study.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "studies")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class Study {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "study_id")
    private Long studyId;

    @Column(name = "study_name", length = 50, nullable = false)
    private String studyName;

    @Column(name = "study_title", columnDefinition = "TEXT", nullable = false)
    private String studyTitle;

    @Column(name = "study_desc", columnDefinition = "TEXT", nullable = false)
    private String studyDesc;

    @Column(name = "study_level")
    private Integer studyLevel;

    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_recruiting", nullable = false)
    private StudyStatus isRecruiting = StudyStatus.RECRUITMENT;

    @Column(name = "study_start", nullable = false)
    private Timestamp studyStart;

    @Column(name = "study_end", nullable = false)
    private Timestamp studyEnd;

    @Column(name = "study_total", nullable = false)
    private Integer studyTotal;

    @Column(name = "solt_start", nullable = false)
    private Timestamp soltStart;

    @Column(name = "solt_end", nullable = false)
    private Timestamp soltEnd;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt;

    @Column(name = "cur_text", columnDefinition = "TEXT")
    private String curText;

    // 스터디 상태 enum
    public enum StudyStatus {
        RECRUITMENT("recruitment"),    // 모집중
        COMPLETE("complete"),          // 모집 종료
        END("end");                    // 스터디 종료

        private final String value;

        StudyStatus(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}

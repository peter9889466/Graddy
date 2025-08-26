package com.smhrd.graddy.score.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;

@Entity
@Table(name = "scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Score {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "score_id")
    private Long scoreId;
    
    @Column(name = "user_id", length = 50, nullable = false)
    @Schema(description = "사용자 ID", example = "user123")
    private String userId;
    
    @Column(name = "user_score", nullable = false)
    @Schema(description = "사용자 종합 점수", example = "1000")
    private Integer userScore;
    
    @Column(name = "last_updated", nullable = false)
    @Schema(description = "마지막 갱신 시각")
    private Timestamp lastUpdated;
    
    @PrePersist
    @PreUpdate
    protected void onCreate() {
        if (lastUpdated == null) {
            lastUpdated = new Timestamp(System.currentTimeMillis());
        }
        if (userScore == null) {
            userScore = 1000; // 기본 점수
        }
    }
}

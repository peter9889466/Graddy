package com.smhrd.graddy.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

/**
 * 사용자 점수 엔티티
 * SQL 스키마의 scores 테이블과 매핑
 */
@Entity
@Table(name = "scores")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class UserScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "score_id")
    private Long scoreId;

    @Column(name = "user_id", length = 50, nullable = false, unique = true)
    private String userId;

    @Column(name = "user_score", nullable = false)
    private Integer userScore = 1000; // 기본 점수 1000점

    @Column(name = "last_updated", nullable = false)
    @UpdateTimestamp
    private Timestamp lastUpdated;

    // User와의 관계는 제거 (무한루프 방지)
    // User 정보가 필요한 경우 UserRepository를 통해 별도 조회

    /**
     * 점수 증가
     * @param amount 증가할 점수
     */
    public void addScore(int amount) {
        this.userScore += amount;
    }

    /**
     * 점수 감소
     * @param amount 감소할 점수
     */
    public void subtractScore(int amount) {
        this.userScore = Math.max(0, this.userScore - amount);
    }

    /**
     * 점수 설정
     * @param score 설정할 점수
     */
    public void setScore(int score) {
        this.userScore = Math.max(0, score);
    }
}

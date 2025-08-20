package com.smhrd.graddy.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_interest")
@Getter
@Setter
@NoArgsConstructor
public class UserInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interest_nb")
    private Long interestNb; // 테이블의 PK

    // User 엔티티와의 관계를 설정합니다 (다대일).
    // 한 명의 User는 여러 개의 UserInterest를 가질 수 있습니다.
    // FetchType.LAZY: UserInterest를 조회할 때 연관된 User 정보를 바로 가져오지 않고,
    // 실제로 user 필드를 사용할 때 가져오도록 하여 성능을 최적화합니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "interest_id", nullable = false)
    private int interestId;

    @Column(name = "interst_name", length = 50)
    private String interstName;

    @Column(name = "interest_level", nullable = false)
    private int interestLevel;
}

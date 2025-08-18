package com.smhrd.graddy.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.sql.Timestamp;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class User {

    @Id
    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(length = 50, nullable = false, unique = true)
    private String tel;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(length = 50, nullable = false)
    private String nick;

    @Column(length = 10, nullable = false)
    private String role = "USER";

    @Column(name = "git_url", length = 200)
    private String gitUrl;

    // 유저 소개
    @Column(name = "user_refer", length = 500)
    private String userRefer;

    @Column(name="alarm_type")
    private boolean alarmType = false;

    @Column(name = "solt_start", nullable = false)
    private Timestamp soltStart;

    @Column(name = "solt_end", nullable = false)
    private Timestamp soldEnd;

    @CreationTimestamp // JPA가 엔티티를 저장할 때 현재 시간을 자동으로 기록
    @Column(name = "created_at", nullable = false, updatable = false) // updatable = false : 나중에 User의 다른 정보가 변경되어 수정이 발생해도 이 필드는 업데이트 쿼리에서 제외
    private Timestamp createdAt;
}
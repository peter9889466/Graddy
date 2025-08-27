package com.smhrd.graddy.post.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;

@Entity
@Table(name = "study_project_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "st_pr_post_id")
    private Long stPrPostId;
    
    @Column(name = "study_project_id", nullable = false)
    @Schema(description = "스터디프로젝트 ID", example = "14")
    private Long studyProjectId;
    
    @Column(name = "member_id", length = 50, nullable = false)
    @Schema(description = "작성자 ID", example = "nano1")
    private String memberId;
    
    @Column(name = "title", length = 255, nullable = false)
    @Schema(description = "글 제목", example = "스터디 모임 공지사항")
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    @Schema(description = "글 본문", example = "이번 주 스터디 모임은 토요일 오후 2시에 진행됩니다.")
    private String content;
    
    @Column(name = "created_at", nullable = false)
    @Schema(description = "생성 시간")
    private Timestamp createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new Timestamp(System.currentTimeMillis());
        }
    }
}

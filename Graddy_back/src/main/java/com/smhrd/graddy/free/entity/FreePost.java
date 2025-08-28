package com.smhrd.graddy.free.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;

@Entity
@Table(name = "free_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreePost {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fr_post_id")
    private Long frPostId;
    
    @Column(name = "user_id", length = 50, nullable = false)
    @Schema(description = "작성자 ID", example = "user123")
    private String userId;
    
    @Column(name = "title", length = 255, nullable = false)
    @Schema(description = "글 제목", example = "자유게시판 첫 글입니다!")
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    @Schema(description = "글 본문", example = "안녕하세요! 자유게시판에 글을 남깁니다.")
    private String content;
    
    @Column(name = "views", nullable = false)
    @Schema(description = "조회수", example = "0")
    private Integer views;
    
    @Column(name = "created_at", nullable = false)
    @Schema(description = "생성 시간")
    private Timestamp createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new Timestamp(System.currentTimeMillis());
        }
        if (views == null) {
            views = 0;
        }
    }
}

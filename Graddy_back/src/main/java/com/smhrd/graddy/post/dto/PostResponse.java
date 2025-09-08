package com.smhrd.graddy.post.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
    
    @Schema(description = "게시글 ID", example = "1")
    private Long stPrPostId;
    
    @Schema(description = "스터디프로젝트 ID", example = "14")
    private Long studyProjectId;
    
    @Schema(description = "작성자 ID", example = "nano1")
    private String memberId;
    
    @Schema(description = "작성자 닉네임", example = "개발자킹")
    private String nick;
    
    @Schema(description = "글 제목", example = "스터디 모임 공지사항")
    private String title;
    
    @Schema(description = "글 본문", example = "이번 주 스터디 모임은 토요일 오후 2시에 진행됩니다.")
    private String content;
    
    @Schema(description = "생성 시간")
    private LocalDateTime createdAt;
}

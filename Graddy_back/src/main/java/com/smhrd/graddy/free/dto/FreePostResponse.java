package com.smhrd.graddy.free.dto;

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
public class FreePostResponse {
    
    @Schema(description = "게시글 ID", example = "1")
    private Long frPostId;
    
    @Schema(description = "작성자 ID", example = "user123")
    private String userId;
    
    @Schema(description = "작성자 닉네임", example = "개발자킹")
    private String nick;
    
    @Schema(description = "글 제목", example = "자유게시판 첫 글입니다!")
    private String title;
    
    @Schema(description = "글 본문", example = "안녕하세요! 자유게시판에 글을 남깁니다.")
    private String content;
    
    @Schema(description = "조회수", example = "0")
    private Integer views;
    
    @Schema(description = "생성 시간")
    private LocalDateTime createdAt;
}

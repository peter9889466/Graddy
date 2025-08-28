package com.smhrd.graddy.free.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreePostRequest {
    
    @Schema(description = "글 제목", example = "자유게시판 첫 글입니다!", required = true)
    private String title;
    
    @Schema(description = "글 본문", example = "안녕하세요! 자유게시판에 글을 남깁니다.", required = true)
    private String content;
}

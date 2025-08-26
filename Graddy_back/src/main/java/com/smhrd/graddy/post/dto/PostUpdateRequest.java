package com.smhrd.graddy.post.dto;

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
public class PostUpdateRequest {
    
    @Schema(description = "글 제목", example = "수정된 스터디 모임 공지사항")
    private String title;
    
    @Schema(description = "글 본문", example = "수정된 내용: 이번 주 스터디 모임은 일요일 오후 3시에 진행됩니다.")
    private String content;
}

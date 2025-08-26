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
public class PostRequest {
    
    @Schema(description = "스터디프로젝트 ID", example = "14", required = true)
    private Long studyProjectId;
    
    @Schema(description = "작성자 ID", example = "nano1", required = true)
    private String memberId;
    
    @Schema(description = "글 제목", example = "스터디 모임 공지사항", required = true)
    private String title;
    
    @Schema(description = "글 본문", example = "이번 주 스터디 모임은 토요일 오후 2시에 진행됩니다.", required = true)
    private String content;
}

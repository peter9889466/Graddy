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
public class FreePostUpdateRequest {
    
    @Schema(description = "글 제목", example = "수정된 제목입니다!")
    private String title;
    
    @Schema(description = "글 본문", example = "수정된 내용입니다.")
    private String content;
}

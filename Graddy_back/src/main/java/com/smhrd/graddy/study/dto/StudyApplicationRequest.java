package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "스터디/프로젝트 신청 요청")
public class StudyApplicationRequest {

    @Schema(description = "스터디/프로젝트 ID", example = "1", required = true)
    private Long studyProjectId;

    @Schema(description = "신청 메시지 (선택사항)", example = "열심히 참여하겠습니다!")
    private String message;
}


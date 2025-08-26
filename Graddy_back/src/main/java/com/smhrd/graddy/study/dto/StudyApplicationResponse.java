package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "스터디/프로젝트 신청 응답")
public class StudyApplicationResponse {

    @Schema(description = "신청자 ID", example = "user123")
    private String userId;

    @Schema(description = "스터디/프로젝트 ID", example = "1")
    private Long studyProjectId;

    @Schema(description = "신청 상태", example = "PENDING")
    private String status;

    @Schema(description = "신청 메시지", example = "열심히 참여하겠습니다!")
    private String message;

    @Schema(description = "신청일시")
    private LocalDateTime appliedAt;
}

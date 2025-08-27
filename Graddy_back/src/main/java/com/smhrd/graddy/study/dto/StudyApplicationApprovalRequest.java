package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "스터디/프로젝트 신청 승인/거부 요청")
public class StudyApplicationApprovalRequest {

    @Schema(description = "신청자 ID", example = "user123", required = true)
    private String userId;

    @Schema(description = "승인/거부 상태", example = "APPROVED", required = true, 
            allowableValues = {"APPROVED", "REJECTED"})
    private String status;

    @Schema(description = "거부 사유 (REJECTED인 경우)", example = "인원이 다 찼습니다.")
    private String reason;
}

package com.smhrd.graddy.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 통합 전화번호 인증 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@Schema(description = "통합 전화번호 인증 응답")
public class UnifiedPhoneVerificationResponse {

    @Schema(description = "전화번호 사용 가능 여부", example = "true")
    private boolean isPhoneAvailable;

    @Schema(description = "SMS 인증번호 발송 성공 여부", example = "true")
    private boolean isSmsSent;

    @Schema(description = "응답 메시지", example = "전화번호 사용 가능하며 인증번호가 발송되었습니다.")
    private String message;

    @Schema(description = "전화번호", example = "010-1234-5678")
    private String tel;

    public UnifiedPhoneVerificationResponse(boolean isPhoneAvailable, boolean isSmsSent, String message, String tel) {
        this.isPhoneAvailable = isPhoneAvailable;
        this.isSmsSent = isSmsSent;
        this.message = message;
        this.tel = tel;
    }
}

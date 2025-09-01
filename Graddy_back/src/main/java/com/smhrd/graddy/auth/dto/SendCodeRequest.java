package com.smhrd.graddy.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * SMS 인증번호 발송 요청 DTO
 */
@Getter @Setter @NoArgsConstructor
@Schema(description = "SMS 인증번호 발송 요청")
public class SendCodeRequest {
    
    @Schema(description = "전화번호", example = "010-1234-5678")
    private String phoneNumber;
}

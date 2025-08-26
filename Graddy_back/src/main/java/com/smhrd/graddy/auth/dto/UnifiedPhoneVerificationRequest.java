package com.smhrd.graddy.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 통합 전화번호 인증 요청 DTO
 * 회원가입 시 전화번호 중복 확인과 SMS 인증을 동시에 처리
 */
@Getter
@Setter
@NoArgsConstructor
@Schema(description = "통합 전화번호 인증 요청")
public class UnifiedPhoneVerificationRequest {

    @Schema(description = "전화번호", example = "010-1234-5678")
    private String tel;

    @Schema(description = "사용 목적", example = "JOIN", allowableValues = {"JOIN", "PASSWORD_FIND"})
    private String purpose; // JOIN: 회원가입, PASSWORD_FIND: 비밀번호 찾기
}

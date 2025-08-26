package com.smhrd.graddy.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 비밀번호 찾기 3단계 요청 DTO
 * 새로운 비밀번호를 입력받아 변경
 */
@Getter
@Setter
@NoArgsConstructor
@Schema(description = "비밀번호 찾기 3단계 요청")
public class PasswordResetRequest {

    @Schema(description = "사용자 아이디", example = "user123")
    private String userId;

    @Schema(description = "새로운 비밀번호", example = "newPassword123")
    private String newPassword;
}

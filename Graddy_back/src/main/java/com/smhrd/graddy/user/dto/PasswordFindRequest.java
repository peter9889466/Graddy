package com.smhrd.graddy.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 비밀번호 찾기 1단계 요청 DTO
 * 아이디와 전화번호를 입력받아 사용자 존재 여부를 확인
 */
@Getter
@Setter
@NoArgsConstructor
@Schema(description = "비밀번호 찾기 1단계 요청")
public class PasswordFindRequest {

    @Schema(description = "사용자 아이디", example = "user123")
    private String userId;

    @Schema(description = "사용자 전화번호", example = "010-1234-5678")
    private String tel;
}

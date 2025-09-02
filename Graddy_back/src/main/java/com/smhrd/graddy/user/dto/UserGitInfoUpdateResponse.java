package com.smhrd.graddy.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

/**
 * 사용자 Git 정보 수정 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "사용자 Git 정보 수정 응답")
public class UserGitInfoUpdateResponse {
    
    @Schema(description = "응답 메시지", example = "Git 정보가 성공적으로 수정되었습니다.")
    private String message;
    
    @Schema(description = "수정된 필드 정보")
    private Map<String, String> updatedFields;
}

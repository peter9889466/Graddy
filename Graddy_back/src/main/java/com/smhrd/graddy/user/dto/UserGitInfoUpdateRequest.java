package com.smhrd.graddy.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 사용자 Git 정보 수정 요청 DTO
 * 현재 로그인한 사용자의 git_url과 user_refer를 수정하기 위한 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@Schema(description = "사용자 Git 정보 수정 요청")
public class UserGitInfoUpdateRequest {
    
    @Schema(description = "깃허브 URL", example = "https://github.com/username", nullable = true)
    private String gitUrl;
    
    @Schema(description = "추천인 정보", example = "친구 추천", nullable = true)
    private String userRefer;
    
    /**
     * gitUrl이 새로운 값인지 확인
     * @return gitUrl이 null이 아니고 빈 문자열이 아니면 true
     */
    public boolean hasNewGitUrl() {
        return gitUrl != null && !gitUrl.trim().isEmpty();
    }
    
    /**
     * userRefer가 새로운 값인지 확인
     * @return userRefer가 null이 아니고 빈 문자열이 아니면 true
     */
    public boolean hasNewUserRefer() {
        return userRefer != null && !userRefer.trim().isEmpty();
    }
}

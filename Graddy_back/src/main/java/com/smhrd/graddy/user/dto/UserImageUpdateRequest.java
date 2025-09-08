package com.smhrd.graddy.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserImageUpdateRequest {

    @Schema(description = "프로필 이미지 URL", example = "http://localhost:8080/api/files/general/uuid.png")
    private String imgUrl;

    public boolean hasNewImgUrl() {
        return imgUrl != null && !imgUrl.trim().isEmpty();
    }
}

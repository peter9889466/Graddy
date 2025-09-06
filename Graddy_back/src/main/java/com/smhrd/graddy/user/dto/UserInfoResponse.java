package com.smhrd.graddy.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 사용자 정보 조회 응답 DTO
 * 
 * 포함 정보:
 * - 닉네임 (nick)
 * - 프로필 이미지 URL (imgUrl) - 추후 추가 예정
 * - 깃허브 URL (gitUrl)
 * - 사용자 점수 (userScore)
 * - 관심분야 목록 (interests)
 * - 사용자 소개 (userRefer)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "사용자 정보 조회 응답")
public class UserInfoResponse {
    
    @Schema(description = "사용자 ID", example = "user123")
    private String userId;
    
    @Schema(description = "닉네임", example = "개발자123")
    private String nick;
    
    @Schema(description = "프로필 이미지 URL", example = "https://example.com/profile.jpg")
    private String imgUrl;
    
    @Schema(description = "깃허브 URL", example = "https://github.com/user123")
    private String gitUrl;
    
    @Schema(description = "사용자 점수", example = "1250")
    private Integer userScore;
    
    @Schema(description = "관심분야 목록", example = "[\"웹개발\", \"백엔드\", \"데이터베이스\"]")
    private List<String> interests;
    
    @Schema(description = "사용자 소개", example = "안녕하세요! 백엔드 개발자입니다.")
    private String userRefer;
    
    @Schema(description = "사용자 이름", example = "홍길동")
    private String name;
    
    @Schema(description = "가입일", example = "2024-01-15T10:30:00")
    private String createdAt;
}

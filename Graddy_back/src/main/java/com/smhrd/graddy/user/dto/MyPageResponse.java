package com.smhrd.graddy.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 마이페이지 조회 응답 DTO
 * 
 * 응답 정보:
 * - nick: 사용자 닉네임
 * - gitUrl: 깃허브 URL
 * - userScore: 사용자 점수 (scores 테이블)
 * - interests: 사용자 관심분야 목록
 * - userRefer: 사용자 추천인
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPageResponse {
    
    /**
     * 사용자 닉네임
     */
    private String nick;
    
    /**
     * 깃허브 URL
     */
    private String gitUrl;
    
    /**
     * 프로필 이미지 URL
     */
    private String imgUrl;
    
    /**
     * 사용자 점수 (scores 테이블)
     */
    private Integer userScore;
    
    /**
     * 사용자 관심분야 목록
     */
    private List<String> interests;
    
    /**
     * 사용자 추천인
     */
    private String userRefer;
}

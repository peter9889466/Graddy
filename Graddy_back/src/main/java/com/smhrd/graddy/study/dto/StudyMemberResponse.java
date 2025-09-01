package com.smhrd.graddy.study.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 스터디 멤버 상세 정보 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyMemberResponse {
    
    // Member 테이블 정보
    private Long memberId;
    private String userId;
    private Long studyProjectId;
    
    // Users 테이블 정보
    private String nick;
    private String gitUrl;
    private String userRefer;
    private String imgUrl; // 클라우드 서버 이미지 URL
    
    // Scores 테이블 정보
    private Integer userScore;
    
    // Interests 테이블 정보 (리스트)
    private List<String> interests;
    
    // 추가 정보
    private String joinedAt; // 가입 시간
}

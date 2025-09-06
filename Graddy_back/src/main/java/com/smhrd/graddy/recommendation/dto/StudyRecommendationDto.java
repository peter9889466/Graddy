package com.smhrd.graddy.recommendation.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 스터디 추천 결과 DTO
 * 추천 시스템에서 반환하는 스터디/프로젝트 정보를 담는 클래스
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyRecommendationDto {
    
    /**
     * 스터디/프로젝트 ID
     */
    private Long studyProjectId;
    
    /**
     * 스터디/프로젝트 이름
     */
    private String studyProjectName;
    
    /**
     * 스터디/프로젝트 제목
     */
    private String studyProjectTitle;
    
    /**
     * 스터디/프로젝트 설명
     */
    private String studyProjectDesc;
    
    /**
     * 스터디 레벨 (1: 하, 2: 중, 3: 상)
     */
    private Integer studyLevel;
    
    /**
     * 타입 (study 또는 project)
     */
    private String typeCheck;
    
    /**
     * 리더 사용자 ID
     */
    private String userId;
    
    /**
     * 리더 닉네임
     */
    private String userNickname;
    
    /**
     * 모집 상태 (recruitment, complete, end)
     */
    private String isRecruiting;
    
    /**
     * 스터디 시작일
     */
    private LocalDateTime studyProjectStart;
    
    /**
     * 스터디 마감일
     */
    private LocalDateTime studyProjectEnd;
    
    /**
     * 스터디 총원
     */
    private Integer studyProjectTotal;
    
    /**
     * 선호 시작 시간
     */
    private LocalDateTime soltStart;
    
    /**
     * 선호 끝 시간
     */
    private LocalDateTime soltEnd;
    
    /**
     * 개설 일자
     */
    private LocalDateTime createdAt;
    
    /**
     * 커리큘럼 내용
     */
    private String curText;
    
    /**
     * 최종 추천 점수 (0.0 ~ 1.0)
     */
    private Double finalScore;
    
    /**
     * 콘텐츠 기반 점수 (0.0 ~ 1.0)
     */
    private Double contentBasedScore;
    
    /**
     * 협업 기반 점수 (0.0 ~ 1.0)
     */
    private Double collaborativeScore;
    
    /**
     * 콘텐츠 기반 가중치 (0.0 ~ 1.0)
     */
    private Double contentWeight;
    
    /**
     * 협업 기반 가중치 (0.0 ~ 1.0)
     */
    private Double collaborativeWeight;
    
    /**
     * 요일 일치도 점수 (0.0 ~ 1.0)
     */
    private Double dayMatchScore;
    
    /**
     * 시간 일치도 점수 (0.0 ~ 1.0)
     */
    private Double timeMatchScore;
    
    /**
     * 관심사 일치도 점수 (0.0 ~ 1.0)
     */
    private Double interestMatchScore;
    
    /**
     * 레벨 근접도 점수 (0.0 ~ 1.0)
     */
    private Double levelMatchScore;
    
    /**
     * 스터디 태그 목록
     */
    private List<String> tags;
    
    /**
     * 스터디 가능 요일 목록
     */
    private List<Byte> availableDays;
    
    /**
     * 현재 참여 멤버 수
     */
    private Long currentMemberCount;
} 
package com.smhrd.graddy.user.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;

/**
 * 스터디/프로젝트 목록 응답 DTO
 * 
 * 응답 정보:
 * - studyProjectId: 스터디/프로젝트 ID
 * - studyProjectName: 스터디/프로젝트 이름
 * - studyProjectTitle: 스터디/프로젝트 제목
 * - studyProjectDesc: 스터디/프로젝트 설명
 * - typeCheck: 타입 (STUDY/PROJECT)
 * - userId: 리더 ID
 * - isRecruiting: 모집 상태 (RECRUITING/COMPLETE/END)
 * - studyProjectStart: 시작일
 * - studyProjectEnd: 종료일
 * - studyProjectTotal: 총 인원
 * - soltStart: 시간 시작
 * - soltEnd: 시간 종료
 */
@Getter
@Setter
@Builder
public class StudyProjectListResponse {
    
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
     * 타입 (STUDY/PROJECT)
     */
    private String typeCheck;
    
    /**
     * 리더 ID
     */
    private String userId;
    
    /**
     * 모집 상태 (RECRUITING/COMPLETE/END)
     */
    private String isRecruiting;
    
    /**
     * 시작일
     */
    private Timestamp studyProjectStart;
    
    /**
     * 종료일
     */
    private Timestamp studyProjectEnd;
    
    /**
     * 총 인원
     */
    private Integer studyProjectTotal;
    
    /**
     * 시간 시작
     */
    private String soltStart;
    
    /**
     * 시간 종료
     */
    private String soltEnd;
}

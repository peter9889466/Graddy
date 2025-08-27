package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import com.smhrd.graddy.member.dto.MemberInfo;
import com.smhrd.graddy.study.dto.StudyProjectStatusInfo;
import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyResponse {

    private Long studyProjectId;
    private String studyProjectName;
    private String studyProjectTitle;
    private String studyProjectDesc;
    private Integer studyLevel;
    private String typeCheck;
    private String userId;
    private String isRecruiting;
    private LocalDateTime studyProjectStart;
    private LocalDateTime studyProjectEnd;
    private Integer studyProjectTotal;
    private LocalDateTime soltStart;
    private LocalDateTime soltEnd;
    private LocalDateTime createdAt;
    private String curText;
    private String gitUrl;
    private List<String> tagNames;
    private List<Byte> availableDays;
    private Integer currentMemberCount;
    // 멤버 정보 목록
    private List<MemberInfo> members;

    // 사용자의 참여 상태 ("participating", "applied", "leader")
    private String userParticipationStatus;
    
    // 신청 상태 정보 (study_project_status 테이블에서 가져온 정보)
    private String applicationStatus;  // PENDING, REJECTED, null
    private LocalDateTime applicationDate;  // 신청 일시
    
    // 스터디 상태 ("active": 진행중, "recruitment_completed": 모집완료, "completed": 종료됨)
    @Schema(description = "스터디 상태", example = "active")
    private String studyStatus;
    
    @Schema(description = "스터디 프로젝트 상태 정보")
    private StudyProjectStatusInfo studyProjectStatus;
}

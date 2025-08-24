package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import com.smhrd.graddy.member.dto.MemberInfo;

@Getter
@Setter
@NoArgsConstructor
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
    private List<String> tagNames;
    private List<Byte> availableDays;
    
    // 현재 인원수 (study_project_member 테이블에서 COUNT로 계산)
    private Integer currentMemberCount;
    
    // 멤버 정보 목록
    private List<MemberInfo> members;

    // 명시적 생성자
    public StudyResponse(Long studyProjectId, String studyProjectName, String studyProjectTitle,
                        String studyProjectDesc, Integer studyLevel, String typeCheck, String userId,
                        String isRecruiting, LocalDateTime studyProjectStart, LocalDateTime studyProjectEnd,
                        Integer studyProjectTotal, LocalDateTime soltStart, LocalDateTime soltEnd,
                        LocalDateTime createdAt, String curText, List<String> tagNames,
                        List<Byte> availableDays, Integer currentMemberCount, List<MemberInfo> members) {
        this.studyProjectId = studyProjectId;
        this.studyProjectName = studyProjectName;
        this.studyProjectTitle = studyProjectTitle;
        this.studyProjectDesc = studyProjectDesc;
        this.studyLevel = studyLevel;
        this.typeCheck = typeCheck;
        this.userId = userId;
        this.isRecruiting = isRecruiting;
        this.studyProjectStart = studyProjectStart;
        this.studyProjectEnd = studyProjectEnd;
        this.studyProjectTotal = studyProjectTotal;
        this.soltStart = soltStart;
        this.soltEnd = soltEnd;
        this.createdAt = createdAt;
        this.curText = curText;
        this.tagNames = tagNames;
        this.availableDays = availableDays;
        this.currentMemberCount = currentMemberCount;
        this.members = members;
    }
}

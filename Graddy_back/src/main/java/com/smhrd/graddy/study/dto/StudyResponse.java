package com.smhrd.graddy.study.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import com.smhrd.graddy.member.dto.MemberInfo;

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
    private List<String> tagNames;
    private List<Byte> availableDays;
    private Integer currentMemberCount;
    // 멤버 정보 목록
    private List<MemberInfo> members;

    // 사용자의 참여 상태 ("participating", "applied", "leader")
    private String userParticipationStatus;
}

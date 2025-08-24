package com.smhrd.graddy.member.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberInfo {
    
    private Long memberId;
    private String userId;
    private String memberType;        // "leader" 또는 "member"
    private String memberStatus;      // "approved" 또는 "withdraw"
    private LocalDateTime joinedAt;
}

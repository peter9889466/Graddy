package com.smhrd.graddy.user.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UserInterestRequest {
    // 관심 항목 ID
    private final int interestId;
    // 관심 항목 이름
    private final String interestName;
    // 관심 항목 숙련도
    private final int interestLevel;
}

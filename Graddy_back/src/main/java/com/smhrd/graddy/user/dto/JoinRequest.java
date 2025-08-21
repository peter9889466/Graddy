package com.smhrd.graddy.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.sql.Timestamp;
import java.util.List;


@Getter
@RequiredArgsConstructor
public class JoinRequest {

    private final String userId;
    private final String password;
    private final String name;
    private final String nick;
    private final String tel;
    private final String gitUrl;
    private final String userRefer;
    //알람 수신 여부
    private final boolean alarmType;
    
    // 사용자가 선택한 가능한 요일들 (1: 일요일, 2: 월요일, 3: 화요일, 4: 수요일, 5: 목요일, 6: 금요일, 7: 토요일)
    private final List<Integer> availableDays;
    
    // --- JSON의 날짜 형식을 명시적으로 지정하여 파싱 오류를 방지합니다. ---
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    private final Timestamp soltStart;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    private final Timestamp soltEnd;

    // --- [핵심] 사용자의 관심사 목록 ---
    // API 명세서의 "interests" JSON 배열이 이 List<UserInterestDto> 필드로 매핑됩니다.
    private final List<UserInterestRequest> interests;

}
package com.smhrd.graddy.user.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.sql.Timestamp;


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
    private final Timestamp soltStart;
    private final Timestamp soltEnd;

}
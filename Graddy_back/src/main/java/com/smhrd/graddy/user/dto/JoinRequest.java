package com.smhrd.graddy.user.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


@Getter
@RequiredArgsConstructor
public class JoinRequest {

    // 1. private final 필드 선언
    private final String userId;
    private final String password;
    private final String name;
    private final String nick;
    private final String tel;

}
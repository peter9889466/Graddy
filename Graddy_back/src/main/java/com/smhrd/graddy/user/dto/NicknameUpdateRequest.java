package com.smhrd.graddy.user.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class NicknameUpdateRequest {
    private final String nick;
}

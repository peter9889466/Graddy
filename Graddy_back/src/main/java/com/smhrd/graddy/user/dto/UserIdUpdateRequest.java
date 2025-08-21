package com.smhrd.graddy.user.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UserIdUpdateRequest {
    private final String currentPassword;
    private final String newUserId;
}

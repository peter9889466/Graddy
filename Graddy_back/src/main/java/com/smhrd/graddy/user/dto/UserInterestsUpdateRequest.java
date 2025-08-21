package com.smhrd.graddy.user.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Getter
@RequiredArgsConstructor
public class UserInterestsUpdateRequest {
    private final List<UserInterestRequest> interests;
}

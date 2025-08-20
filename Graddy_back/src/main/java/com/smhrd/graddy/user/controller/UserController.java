package com.smhrd.graddy.user.controller;


import com.smhrd.graddy.user.dto.JoinRequest;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // 회원가입 성공 시 응답 DTO
    public record JoinResponse(String userId) {}

    /**
     * 회원가입 API 엔드포인트
     * @param request 회원가입 요청 정보
     * @return 성공 시 201 Created, 아이디 중복 시 409 Conflict
     */
    @PostMapping("/api/join")
    public ResponseEntity<JoinResponse> join(@RequestBody JoinRequest request) {
        try {
            User savedUser = userService.join(request);
            // 성공 시 생성된 사용자의 ID를 응답 본문에 담아 반환
            return ResponseEntity.created(URI.create("/api/users/" + savedUser.getUserId()))
                    .body(new JoinResponse(savedUser.getUserId()));
        } catch (IllegalArgumentException e) {
            // 아이디 중복 시 409 Conflict 상태 코드 반환
            return ResponseEntity.status(409).build();
        }
    }
}

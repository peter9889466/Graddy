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

    // 회원가입 요청을 처리할 DTO
    // UserService 내에 static record로 정의된 JoinRequest를 사용

    public record JoinResponse(String userId) {}

    @PostMapping("/api/join")
    public ResponseEntity<JoinResponse> join(@RequestBody JoinRequest request) {
        try {
            User savedUser = userService.join(request);
            // 회원가입 성공 시, 생성된 리소스의 위치(URI)와 함께 201 Created 응답 반환
            return ResponseEntity.created(URI.create("/api/users/" + savedUser.getUserId()))
                    .body(new JoinResponse(savedUser.getUserId()));
        } catch (IllegalArgumentException e) {
            // 아이디 중복과 같은 비즈니스 로직 예외 발생 시 409 Conflict 응답 반환
            return ResponseEntity.status(409).build();
        }
    }
}

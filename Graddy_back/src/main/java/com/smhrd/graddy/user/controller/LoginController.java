package com.smhrd.graddy.user.controller;

import com.smhrd.graddy.api.dto.ApiResponse;
import com.smhrd.graddy.security.jwt.JwtUtil;
import com.smhrd.graddy.user.dto.LoginRequest;
import com.smhrd.graddy.user.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class LoginController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        try {
            // 1. 사용자 인증 시도
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPassword())
            );
            // authenticationManager.authenticate() 메소드 인증이 실패하면 그 즉시
            // AuthenticationException이라는 예외를 발생시키고 메소드를 중단해서
            // 2번은 예외가 발생하지 않았을 경우, 즉 인증에 성공했을 경우에만 실행

            // 2. 인증 성공 시, JWT 생성
            final String token = jwtUtil.generateToken(request.getUserId());

            // 3. 생성된 토큰을 응답으로 반환
            LoginResponse loginResponse = new LoginResponse(token);
            return ApiResponse.success("로그인에 성공했습니다.", loginResponse);
            
        } catch (BadCredentialsException e) {
            // 아이디 또는 비밀번호가 잘못된 경우
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다.", null);
        } catch (Exception e) {
            // 기타 예외 발생 시
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "로그인 처리 중 오류가 발생했습니다.", null);
        }
    }
}

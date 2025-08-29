package com.smhrd.graddy.auth.service;

import com.smhrd.graddy.auth.entity.RefreshToken;
import com.smhrd.graddy.security.jwt.JwtUtil;
import com.smhrd.graddy.user.dto.LoginRequest;
import com.smhrd.graddy.user.dto.LoginResponse;
import com.smhrd.graddy.user.entity.User;
import com.smhrd.graddy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenService tokenService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 사용자 조회
        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // Access Token 생성
        String accessToken = jwtUtil.generateAccessToken(user.getUserId());

        // Refresh Token 생성 및 저장
        RefreshToken refreshToken = tokenService.createRefreshToken(user.getUserId());

        // LoginResponse 생성
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getTokenValue())
                .tokenType("Bearer")
                .userId(user.getUserId())
                .nickname(user.getNick())
                .expiresIn(3600L) // 1시간 (3600초)
                .build();
    }
}

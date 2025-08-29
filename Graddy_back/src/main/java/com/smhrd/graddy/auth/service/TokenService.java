package com.smhrd.graddy.auth.service;

import com.smhrd.graddy.auth.entity.RefreshToken;
import com.smhrd.graddy.auth.repository.RefreshTokenRepository;
import com.smhrd.graddy.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    // Refresh Token 생성
    @Transactional
    public RefreshToken createRefreshToken(String userId) {
        // 기존 Refresh Token이 있다면 삭제
        refreshTokenRepository.deleteByUserId(userId);

        // 새로운 Refresh Token 생성
        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .tokenValue(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plusHours(1)) // 1시간 유효
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    // Refresh Token 유효성 검증 (토큰 값만으로)
    public boolean validateRefreshToken(String tokenValue) {
        try {
            return refreshTokenRepository.findByTokenValue(tokenValue)
                    .map(token -> !token.isExpired())
                    .orElse(false);
        } catch (Exception e) {
            log.error("Refresh Token 검증 중 오류 발생", e);
            return false;
        }
    }

    // Refresh Token 유효성 검증 (토큰 값과 사용자 ID로)
    public boolean validateRefreshToken(String tokenValue, String userId) {
        try {
            return refreshTokenRepository.findByTokenValue(tokenValue)
                    .map(token -> token.getUserId().equals(userId) && !token.isExpired())
                    .orElse(false);
        } catch (Exception e) {
            log.error("Refresh Token 검증 중 오류 발생", e);
            return false;
        }
    }

    // Access Token 갱신
    @Transactional
    public String refreshAccessToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenValue(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 Refresh Token입니다."));

        if (refreshToken.isExpired()) {
            throw new IllegalArgumentException("Refresh Token이 만료되었습니다.");
        }

        // 새로운 Access Token 생성
        return jwtUtil.generateAccessToken(refreshToken.getUserId());
    }

    // Refresh Token 삭제
    @Transactional
    public void deleteRefreshToken(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    // 만료된 토큰들 정리 (스케줄링)
    @Scheduled(fixedRate = 3600000) // 1시간마다 실행
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
            log.info("만료된 Refresh Token 정리 완료");
        } catch (Exception e) {
            log.error("만료된 Refresh Token 정리 중 오류 발생", e);
        }
    }

    // 사용자가 Refresh Token을 가지고 있는지 확인
    public boolean hasRefreshToken(String userId) {
        return refreshTokenRepository.existsByUserId(userId);
    }

    // Refresh Token의 남은 시간 조회
    public long getRemainingTime(String tokenValue) {
        return refreshTokenRepository.findByTokenValue(tokenValue)
                .map(RefreshToken::getMinutesUntilExpiry)
                .orElse(0L);
    }

    // Refresh Token에서 사용자 ID 추출 (JWT 파싱 없이)
    public String extractUserIdFromToken(String tokenValue) {
        try {
            return refreshTokenRepository.findByTokenValue(tokenValue)
                    .map(RefreshToken::getUserId)
                    .orElse(null);
        } catch (Exception e) {
            log.error("Refresh Token에서 사용자 ID 추출 중 오류 발생", e);
            return null;
        }
    }

    // Refresh Token 값으로 직접 userId 조회 (로그아웃용)
    public String getUserIdFromRefreshToken(String tokenValue) {
        try {
            return refreshTokenRepository.findByTokenValue(tokenValue)
                    .map(RefreshToken::getUserId)
                    .orElse(null);
        } catch (Exception e) {
            log.error("Refresh Token에서 사용자 ID 조회 중 오류 발생", e);
            return null;
        }
    }
}

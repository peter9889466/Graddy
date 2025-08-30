package com.smhrd.graddy.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // 1. JWT 서명에 사용할 비밀 키 (외부에 노출되면 안됨)
    // 실제에서는 설정 파일 등에서 관리
    private final Key secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // 2. Access Token 만료 시간 (1시간)
    private static final long ACCESS_TOKEN_EXPIRATION_TIME = 1000 * 60 * 60; // 1시간

    // 3. Refresh Token 만료 시간 (1시간)
    private static final long REFRESH_TOKEN_EXPIRATION_TIME = 1000 * 60 * 60; // 1시간

    // 4. Access Token 생성
    public String generateAccessToken(String userId) {
        return Jwts.builder()
                .setSubject(userId) // 토큰의 주체(subject)로 사용자 ID를 설정
                .setIssuedAt(new Date(System.currentTimeMillis())) // 토큰 발급 시간
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION_TIME)) // 토큰 만료 시간
                .claim("type", "access") // 토큰 타입 명시
                .signWith(secretKey, SignatureAlgorithm.HS256) // 사용할 암호화 알고리즘과 비밀키
                .compact(); // JWT 문자열 생성
    }

    // 5. Refresh Token 생성
    public String generateRefreshToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION_TIME))
                .claim("type", "refresh") // 토큰 타입 명시
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // 6. 토큰에서 모든 정보(Claims) 추출
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
    }

    // 7. 토큰에서 특정 정보(Claim) 추출
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 8. 토큰에서 사용자 ID 추출
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 9. 토큰에서 만료 시간 추출
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 10. 토큰에서 타입 추출
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    // 11. Access Token이 만료되었는지 확인
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // 12. Access Token 유효성 검증
    public Boolean validateAccessToken(String token, String userId) {
        final String extractedUserId = extractUserId(token);
        final String tokenType = extractTokenType(token);
        
        // 토큰의 사용자 ID가 일치하고, 토큰이 만료되지 않았으며, Access Token 타입인지 확인
        return (extractedUserId.equals(userId) && !isTokenExpired(token) && "access".equals(tokenType));
    }

    // 13. Refresh Token 유효성 검증
    public Boolean validateRefreshToken(String token, String userId) {
        final String extractedUserId = extractUserId(token);
        final String tokenType = extractTokenType(token);
        
        // 토큰의 사용자 ID가 일치하고, 토큰이 만료되지 않았으며, Refresh Token 타입인지 확인
        return (extractedUserId.equals(userId) && !isTokenExpired(token) && "refresh".equals(tokenType));
    }

    // 14. 기존 메서드 호환성을 위한 validateToken (Access Token 검증으로 위임)
    public Boolean validateToken(String token, String userId) {
        return validateAccessToken(token, userId);
    }

    // 15. 공개적으로 사용할 수 있는 토큰 만료 확인 (필터에서 사용)
    public Boolean isTokenExpiredPublic(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (Exception e) {
            return true; // 파싱 오류 시 만료된 것으로 간주
        }
    }
}

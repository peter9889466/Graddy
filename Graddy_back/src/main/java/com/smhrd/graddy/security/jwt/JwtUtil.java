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

    // 2. 토큰 만료 시간(예 1시간)
    private static final long EXPIRATION_TIME = 1000 * 60 * 60;

    // 3. 사용자 ID를 기반으로 JWT 생성
    public String generateToken(String userId) {
        return Jwts.builder()
                .setSubject(userId) // 토큰의 주체(subject)로 사용자 ID를 설정
                .setIssuedAt(new Date(System.currentTimeMillis())) // 토큰 발급 시간
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 토큰 만료 시간
                .signWith(secretKey, SignatureAlgorithm.HS256) // 사용할 암호화 알고리즘과 비밀키
                .compact(); // JWT 문자열 생성
    }


    // 4. 토큰에서 모든 정보(Claims) 추출
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token).getBody();
    }

    // 5. 토큰에서 특정 정보(Claim) 추출
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 6. 토큰에서 사용자 ID 추출
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 7. 토큰에서 만료 시간 추출
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 8. 토큰이 만료되었는지 확인
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // 9. 토큰의 유효성 검증
    public Boolean validateToken(String token, String userId) {
        final String extractedUserId = extractUserId(token);
        // 토큰의 사용자 ID가 일치하고, 토큰이 만료되지 않았는지 확인
        return (extractedUserId.equals(userId) && !isTokenExpired(token));
    }
}

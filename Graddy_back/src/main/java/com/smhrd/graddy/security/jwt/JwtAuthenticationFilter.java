package com.smhrd.graddy.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smhrd.graddy.user.service.UserDetailsServiceImpl;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UrlPathHelper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
//OncePerRequestFilter 최초 요청 시 단 한번만 실행, 인증/인가와 같이 한 번만 수행하면 되는 작업을 효율적으로 처리
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final ObjectMapper objectMapper;
    private final UrlPathHelper urlPathHelper = new UrlPathHelper();

    // JWT 필터를 적용하지 않을 경로들
    private static final String[] PUBLIC_PATHS = {
        "/api/auth/login",
        "/api/auth/refresh", 
        "/api/auth/logout",
        "/swagger-ui",
        "/v3/api-docs",
        "/api/ws"
    };

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = urlPathHelper.getPathWithinApplication(request);
        
        // PUBLIC_PATHS에 포함된 경로는 JWT 필터를 적용하지 않음
        for (String publicPath : PUBLIC_PATHS) {
            if (path.startsWith(publicPath)) {
                return true;
            }
        }
        
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // 1. Authorization 헤더가 없거나 'Bearer '로 시작하지 않으면 필터 통과
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. 'Bearer ' 다음의 토큰 부분만 추출
        final String token = authHeader.substring(7);
        
        try {
            final String userId = jwtUtil.extractUserId(token);

            // 3. 토큰에서 추출한 userId가 있고, 아직 SecurityContext에 인증 정보가 없는 경우
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userId);

                // 4. 토큰이 유효하다면
                if (jwtUtil.validateToken(token, userDetails.getUsername())) {
                    // Spring Security가 사용할 인증 토큰 생성
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // SecurityContext에 인증 정보 설정
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            
            // 다음 필터로 요청과 응답을 전달
            filterChain.doFilter(request, response);
            
        } catch (ExpiredJwtException e) {
            // Access Token이 만료된 경우
            sendTokenExpiredResponse(response);
        } catch (Exception e) {
            // 기타 JWT 관련 오류
            filterChain.doFilter(request, response);
        }
    }

    // Access Token 만료 시 응답
    private void sendTokenExpiredResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", 401);
        errorResponse.put("message", "Access Token이 만료되었습니다.");
        errorResponse.put("expiredToken", true);
        errorResponse.put("data", null);
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
    }
}
package com.smhrd.graddy.security.config;

import com.smhrd.graddy.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

//Spring의 설정 정보를 담고 있는 클래스
@Configuration
//Spring Security를 활성화하고 웹 보안 설정을 커스터마이징할 수 있게 해주는 어노테이션
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                //1. CSRF(Cross-Site Request Forgery) 보호 비활성화(개발 편의를 위해)
                .csrf(csrf -> csrf.disable())
                
                // CORS 설정 활성화 (WebMvcConfigurer에서 설정됨)
                .cors(cors -> cors.and())

                // 2. HTTP 요청 인증 설정
                .authorizeHttpRequests(authorize -> authorize
                        // 인증 관련 엔드포인트는 JWT 검증 없이 허용
                        .requestMatchers("/auth/login", "/auth/refresh", "/auth/logout", "/interests", "/studies-projects", "/scores/ranking/**" , "/free/posts", "/studies-projects/**").permitAll()

                        // 파일 업로드/다운로드 엔드포인트 허용 (첨부파일 접근용)
                        .requestMatchers("/files/**").permitAll()
                                       
                        // 채팅 관련 엔드포인트 허용 (JWT 인증 필요)
                        .requestMatchers("/chat/**").authenticated()
                        // WebSocket 엔드포인트 허용
                        .requestMatchers("/ws-stomp/**").permitAll()

                        // Swagger UI 관련 경로 허용
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**", "/api/swagger-ui/**", "/api/api-docs/**").permitAll()
                        // 나머지 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> httpBasic.disable())
                // 3. 폼 기반 로그인 설정 (가장 중요한 변경 부분)
                .formLogin(formLogin -> formLogin.disable())// <- 이 부분을 수정!
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // 4. 비밀번호 암호화를 위한 PasswordEncoder 빈 등록
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager를 빈으로 등록하여 LoginController에서 사용할 수 있도록 함
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}

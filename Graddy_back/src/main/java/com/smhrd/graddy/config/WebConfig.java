package com.smhrd.graddy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                    "*", // 모든 Origin 허용 (개발용)
                    "http://localhost:5173", 
                    "http://localhost:3000",
                    "http://127.0.0.1:5173",
                    "http://127.0.0.1:3000",
                    "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com", // 배포 환경 도메인
                    "https://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com"  // HTTPS 지원
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // preflight 요청 캐시 시간 (초)
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

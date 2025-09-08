package com.smhrd.graddy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // CORS 설정은 FileConfig에서 통합 관리하므로 여기서는 제거
    // @Override
    // public void addCorsMappings(CorsRegistry registry) {
    //     // CORS 설정이 FileConfig에서 중복되어 있으므로 제거
    // }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

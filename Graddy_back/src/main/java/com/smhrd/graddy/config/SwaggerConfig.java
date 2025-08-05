package com.smhrd.graddy.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("스터디 매칭 & 관리 플랫폼 API")
                        .version("1.0")
                        .description("스터디 생성, 과제 제출, GPT 피드백 관련 API 문서"));
    }

}

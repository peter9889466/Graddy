package com.smhrd.graddy.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("스터디 매칭 & 관리 플랫폼 API")
                        .description("""
                            스터디 생성, 과제 제출, GPT 피드백 관련 API 문서
                            
                            ## 🚀 주요 기능
                            - **스터디/프로젝트 관리**: 생성, 조회, 수정, 삭제
                            - **AI 커리큘럼 생성**: OpenAI GPT를 활용한 맞춤형 커리큘럼 생성
                            - **사용자 관리**: 회원가입, 로그인, 프로필 관리
                            - **관심 분야 관리**: 태그 기반 스터디 검색 및 매칭
                            
                            ## 🤖 AI 커리큘럼 시스템
                            - FastAPI 기반 AI 서버와 연동
                            - 스터디 레벨별 맞춤형 커리큘럼 생성
                            - 관심 분야 태그를 반영한 전문적인 내용 구성
                            
                            ## 📚 API 그룹
                            - **스터디/프로젝트 관리**: 기본 CRUD 작업
                            - **AI 커리큘럼 생성**: OpenAI GPT 기반 자동 생성
                            - **사용자 관리**: 인증 및 권한 관리
                            - **관심 분야 관리**: 태그 및 카테고리 관리
                            """)
                        .version("1.0")
                        .contact(new Contact()
                                .name("Graddy Team")
                                .email("graddy@example.com")
                                .url("https://github.com/peter9889466/Graddy"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication", 
                            new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT 토큰을 입력하세요. Bearer 접두사는 자동으로 추가됩니다.")))
                .tags(List.of(
                    new Tag()
                        .name("인증 관리")
                        .description("사용자 로그인, 로그아웃, 토큰 갱신 등 인증 관련 API"),
                    new Tag()
                        .name("스터디/프로젝트 관리")
                        .description("스터디와 프로젝트의 생성, 조회, 수정, 삭제 및 태그 관리 API"),
                    new Tag()
                        .name("AI 커리큘럼 생성")
                        .description("OpenAI GPT를 활용한 스터디/프로젝트 커리큘럼 자동 생성 API")
                    // new Tag()
                    //     .name("사용자 관리")
                    //     .description("사용자 회원가입, 로그인, 프로필 관리 API")
                    // new Tag()
                    //     .name("관심 분야 관리")
                    //     .description("관심 분야 조회 및 관리 API")
                ));
    }
}

# 멀티 스테이지 빌드를 사용한 Spring Boot Dockerfile

# 1. 빌드 환경: Gradle을 사용하여 소스코드를 .jar 파일로 빌드
FROM gradle:8.5-jdk17-alpine AS build
WORKDIR /app

# Gradle 설정 파일들을 먼저 복사 (캐싱 최적화)
COPY build.gradle settings.gradle ./
COPY gradle gradle

# 의존성 다운로드 (캐싱 최적화)
RUN gradle dependencies --no-daemon

# 소스코드 복사
COPY src ./src

# 애플리케이션 빌드
RUN gradle bootJar --no-daemon

# 2. 실행 환경: 빌드된 .jar 파일을 최소한의 Java 런타임 환경에서 실행
FROM amazoncorretto:17-alpine-jdk
WORKDIR /app

# 빌드 스테이지에서 생성된 .jar 파일을 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 컨테이너가 시작될 때 8080 포트를 외부에 노출
EXPOSE 8080

# 컨테이너 시작 시 실행할 명령어
ENTRYPOINT ["java", "-jar", "app.jar"]
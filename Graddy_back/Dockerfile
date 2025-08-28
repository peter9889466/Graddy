# Dockerfile for Spring Boot (Gradle & Java 21)

# =============================================
# 1. 빌드(Build) 스테이지
# JDK 21이 포함된 Gradle 이미지로 프로젝트를 빌드합니다.
# =============================================
FROM gradle:jdk17 AS builder

# 작업 디렉토리 설정
WORKDIR /build

# 빌드에 필요한 파일들을 복사합니다.
COPY build.gradle settings.gradle ./
COPY src ./src

# Gradle을 사용하여 빌드를 실행합니다.
RUN gradle build --no-daemon -x test


# =============================================
# 2. 실행(Runtime) 스테이지
# JRE 21만 포함된 경량 이미지로 애플리케이션을 실행합니다.
# =============================================
FROM eclipse-temurin:21-jre-alpine

# 작업 디렉토리 설정
WORKDIR /app

# builder 스테이지에서 생성된 .jar 파일을 app.jar 라는 이름으로 복사합니다.
COPY --from=builder /build/build/libs/*.jar app.jar

# 8080 포트를 외부에 노출합니다. (application.properties에서 포트를 변경했다면 여기도 수정하세요.)
EXPOSE 8080

# 애플리케이션을 실행합니다.
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
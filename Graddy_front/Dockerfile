# Dockerfile for React (Vite)

# =============================================
# 1. 빌드(Build) 스테이지
# Node.js 22 버전 환경에서 프로젝트를 빌드합니다.
# =============================================
FROM node:22-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치 캐싱을 위해 package*.json 파일을 먼저 복사합니다.
COPY package*.json ./

# 의존성 설치
RUN npm install

# 프로젝트 전체 소스 코드 복사
COPY . .

# Vite를 사용하여 프로젝트 빌드 (결과물은 /app/dist 에 생성됨)
RUN npm run build


# =============================================
# 2. 실행(Runtime) 스테이지
# 빌드된 정적 파일을 Nginx 웹서버로 서비스합니다.
# =============================================
FROM nginx:stable-alpine

# builder 스테이지에서 생성된 빌드 결과물(/app/dist)을
# Nginx의 기본 웹 루트 디렉토리로 복사합니다.
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80번 포트를 외부에 노출합니다.
EXPOSE 80

# 컨테이너 시작 시 Nginx 서버를 실행하는 명령어
CMD ["nginx", "-g", "daemon off;"]
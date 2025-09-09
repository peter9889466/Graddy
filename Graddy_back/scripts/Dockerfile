# FastAPI 서버용 최적화된 Dockerfile (멀티스테이지 빌드)
# Stage 1: 의존성 빌드
FROM python:3.11-slim as builder

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 빌드 도구 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 파일 복사
COPY requirements.txt .

# Python 패키지를 사용자 디렉토리에 설치 (더 효율적)
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: 최종 이미지
FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 스테이지에서 설치된 패키지 복사
COPY --from=builder /root/.local /root/.local

# PATH에 사용자 패키지 경로 추가
ENV PATH=/root/.local/bin:$PATH

# 애플리케이션 코드 복사
COPY . .

# 8000 포트 노출
EXPOSE 8000

# FastAPI 서버 실행
CMD ["python", "uvicorn_config.py"]
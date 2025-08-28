# Dockerfile for Python (FastAPI & Python 3.13)

# Python 3.13 경량 이미지를 베이스로 사용합니다.
FROM python:3.13-slim

# 컨테이너 내부의 작업 디렉토리를 설정합니다.
WORKDIR /app

# 의존성 설치를 위해 requirements.txt 파일을 먼저 복사합니다.
COPY requirements.txt .

# pydantic-core 등 C 컴파일이 필요한 라이브러리를 위해 빌드 도구를 설치합니다.
RUN apt-get update && apt-get install -y gcc build-essential

# requirements.txt에 명시된 라이브러리들을 설치합니다.
RUN pip install --no-cache-dir -r requirements.txt

# 나머지 전체 소스 코드를 작업 디렉토리로 복사합니다.
COPY . .

# FastAPI 애플리케이션이 8000번 포트를 사용함을 명시합니다.
EXPOSE 8000

# 컨테이너가 시작될 때 Uvicorn 서버를 실행하여 FastAPI 앱을 구동합니다.
# 'main:app'은 main.py 파일 안에 있는 app 객체를 의미합니다. (파일명과 변수명이 다를 경우 수정)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
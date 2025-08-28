#!/bin/bash

# =======================================================
# Spring Boot & FastAPI Application Deployment Script
# for Tokyo Region (ap-northeast-1)
# with AWS Parameter Store & Docker Compose
# =======================================================

echo "### Deployment script started ###"

# --- 1. AWS 리전(Region) 강제 설정 ---
# 사용자의 요청에 따라 리전을 도쿄(ap-northeast-1)로 고정합니다.
AWS_REGION="ap-northeast-1"
echo "Target Region is set to: ${AWS_REGION}"

# --- 2. AWS Parameter Store에서 환경 변수 값 가져오기 ---
# docker-compose가 자동으로 인식할 .env 파일을 생성합니다.
# 도쿄 리전의 Parameter Store에서 값을 가져옵니다.
echo "Fetching parameters from AWS Parameter Store in ${AWS_REGION} and creating .env file..."
{
    echo "SPRING_DATASOURCE_URL=$(aws ssm get-parameter --name "/graddy/prod/SPRING_DATASOURCE_URL" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "SPRING_DATASOURCE_USERNAME=$(aws ssm get-parameter --name "/graddy/prod/SPRING_DATASOURCE_USERNAME" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "DB_PASSWORD=$(aws ssm get-parameter --name "/graddy/prod/DB_PASSWORD" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "SOLAPI_SENDER_NUMBER=$(aws ssm get-parameter --name "/graddy/prod/SOLAPI_SENDER_NUMBER" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "SOLAPI_API_KEY=$(aws ssm get-parameter --name "/graddy/prod/SOLAPI_API_KEY" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "SOLAPI_API_SECRET=$(aws ssm get-parameter --name "/graddy/prod/SOLAPI_API_SECRET" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "OPENAI_API_KEY=$(aws ssm get-parameter --name "/graddy/prod/OPENAI_API_KEY" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
} > .env
echo ".env file created successfully."

# --- 3. Docker Compose를 사용하여 애플리케이션 실행 ---
# 먼저 기존에 실행 중인 서비스가 있다면 모두 중지하고 네트워크와 함께 제거합니다.
echo "Stopping existing services using docker-compose down..."
docker-compose down

# 최신 이미지를 Docker Hub에서 pull 합니다.
echo "Pulling latest images from Docker Hub..."
docker-compose pull

# docker-compose up 명령어로 서비스를 백그라운드에서 시작합니다.
echo "Starting services with docker-compose up..."
docker-compose up -d

echo "### Deployment completed successfully! ###"
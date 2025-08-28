#!/bin/bash

# ===================================================================
# Spring Boot & FastAPI Application Deployment Script (Revised)
# - Added exit-on-error, removed hardcoded values, and added checks.
# ===================================================================

# --- 0. 오류 발생 시 스크립트 즉시 중단 ---
# 어느 한 명령어라도 실패하면 전체 스크립트 실행을 중단하여 예기치 않은 오류를 방지합니다.
set -e

echo "### Deployment script started ###"

# --- 1. 프로젝트 폴더로 이동 ---
cd /home/ubuntu/app

# --- 2. 배포 환경변수 파일 로드 ---
# GitHub Actions에서 전달한 Docker Hub ID를 환경변수로 로드합니다.
if [ -f ./deploy.env ]; then
    echo "Loading environment variables from deploy.env..."
    source ./deploy.env
else
    echo "> deploy.env file not found. Exiting."
    exit 1
fi

# DOCKER_HUB_ID 변수가 정상적으로 로드되었는지 확인
if [ -z "$DOCKER_HUB_ID" ]; then
    echo "> DOCKER_HUB_ID is not set. Please check deploy.env and GitHub Actions workflow. Exiting."
    exit 1
fi
echo "Docker Hub ID is set to: ${DOCKER_HUB_ID}"

# --- 3. AWS 리전(Region) 설정 ---
AWS_REGION="ap-northeast-1"
echo "Target Region is set to: ${AWS_REGION}"

# --- 4. AWS Parameter Store에서 환경 변수 값 가져오기 ---
echo "Fetching parameters from AWS Parameter Store and creating .env file..."
{
    echo "SPRING_DATASOURCE_URL=$(aws ssm get-parameter --name "/graddy/prod/SPRING_DATASOURCE_URL" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "SPRING_DATASOURCE_USERNAME=$(aws ssm get-parameter --name "/graddy/prod/SPRING_DATASOURCE_USERNAME" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "DB_PASSWORD=$(aws ssm get-parameter --name "/graddy/prod/DB_PASSWORD" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "SOLAPI_SENDER_NUMBER=$(aws ssm get-parameter --name "/graddy/prod/SOLAPI_SENDER_NUMBER" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "SOLAPI_API_KEY=$(aws ssm get-parameter --name "/graddy/prod/SOLAPI_API_KEY" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "SOLAPI_API_SECRET=$(aws ssm get-parameter --name "/graddy/prod/SOLAPI_API_SECRET" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
    echo "OPENAI_API_KEY=$(aws ssm get-parameter --name "/graddy/prod/OPENAI_API_KEY" --with-decryption --query "Parameter.Value" --output text --region $AWS_REGION)"
} > .env

# .env 파일이 정상적으로 생성되었는지 확인
if [ ! -s .env ]; then
    echo "> .env file is empty or not created. Check AWS SSM permissions or parameter names. Exiting."
    exit 1
fi
echo ".env file created successfully."

# --- 5. Docker Compose 파일에 Docker Hub 사용자 이름 설정 ---
# 하드코딩된 ID 대신, deploy.env에서 로드한 변수를 사용합니다.
echo "Replacing placeholder in docker-compose.yml..."
sed -i "s/DOCKER_HUB_USERNAME_PLACEHOLDER/${DOCKER_HUB_ID}/g" docker-compose.yml

# --- 6. Docker Compose를 사용하여 애플리케이션 실행 ---
echo "Stopping existing services using docker-compose down..."
docker-compose down

echo "Pulling latest images from Docker Hub..."
docker-compose pull

echo "Starting services with docker-compose up..."
docker-compose up -d

echo "### Deployment completed successfully! ###"
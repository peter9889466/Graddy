#!/bin/bash
# scripts/start.sh

# ===================================================================
# Application Deployment Script (Best Practice Version)
# ===================================================================

# --- 0. 오류 발생 시 스크립트 즉시 중단 ---
set -e

echo "### Deployment script started ###"

# --- 1. 프로젝트 폴더로 이동 ---
# CodeDeploy에 의해 파일들이 /home/ubuntu/app에 위치하게 됩니다.
cd /home/ubuntu/app

# --- 2. Docker Hub ID 설정 ---
# 환경변수에서 DOCKER_HUB_ID를 가져오거나 기본값 사용
DOCKER_HUB_ID=${DOCKER_HUB_ID:-"peter4855"}

if [ -z "$DOCKER_HUB_ID" ] || [ "$DOCKER_HUB_ID" = "peter4855" ]; then
    echo "> DOCKER_HUB_ID is not set or using default value. Please set the environment variable."
    echo "> You can set it by running: export DOCKER_HUB_ID=peter4855"
    exit 1
fi
echo "Docker Hub ID is set to: ${DOCKER_HUB_ID}"

# --- 3. AWS 리전(Region) 설정 ---
AWS_REGION="ap-northeast-1"
echo "Target Region is set to: ${AWS_REGION}"

# --- 4. AWS Parameter Store에서 환경 변수 값 가져오기 ---
# 애플리케이션 컨테이너가 사용할 .env 파일을 생성합니다.
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

if [ ! -s .env ]; then
    echo "> .env file is empty or not created. Check AWS SSM permissions. Exiting."
    exit 1
fi
echo ".env file created successfully."

# --- 5. Docker Compose 파일에서 플레이스홀더를 실제 값으로 치환 ---
echo "Updating docker-compose.yml with actual Docker Hub username..."
sed -i "s/DOCKER_HUB_USERNAME_PLACEHOLDER/${DOCKER_HUB_ID}/g" docker-compose.yml

# --- 6. Docker Compose를 사용하여 애플리케이션 실행 ---
echo "Stopping existing services using docker-compose down..."
docker-compose down

echo "Pulling latest images from Docker Hub..."
docker-compose pull

echo "Starting services with docker-compose up..."
docker-compose up -d

# --- 7. [추가] 불필요한 도커 리소스 정리 ---
# 배포 후 사용되지 않는 이전 버전의 이미지 등을 삭제하여 디스크 공간을 확보합니다.
echo "Pruning unused docker resources..."
docker system prune -af

echo "### Deployment completed successfully! ###"
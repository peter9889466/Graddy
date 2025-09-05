#!/bin/bash

echo "LocalStack S3 테스트 환경 시작..."
echo

# LocalStack만 실행
docker-compose -f docker-compose.dev.yml up -d

if [ $? -eq 0 ]; then
    echo
    echo "✅ LocalStack이 성공적으로 시작되었습니다!"
    echo
    echo "📋 접속 정보:"
    echo "  - LocalStack S3 Endpoint: http://localhost:4566"
    echo "  - S3 버킷명: graddy-files"
    echo "  - Access Key: test"
    echo "  - Secret Key: test"
    echo
    echo "🛠️ 테스트 방법:"
    echo "  1. 백엔드 실행: ./gradlew bootRun --args=\"--spring.profiles.active=dev\""
    echo "  2. 프론트엔드에서 파일 업로드 테스트"
    echo
    echo "🔍 확인 명령어:"
    echo "  - docker-compose -f docker-compose.dev.yml logs localstack"
    echo "  - aws --endpoint-url=http://localhost:4566 s3 ls"
    echo
else
    echo
    echo "❌ LocalStack 시작에 실패했습니다."
    echo "Docker가 실행 중인지 확인해주세요."
fi

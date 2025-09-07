# AWS S3 파일 업로드 설정 가이드

이 프로젝트에서는 파일 업로드를 위해 로컬 파일 시스템에서 AWS S3로 변경되었습니다. 
개발 환경에서는 LocalStack을 사용하여 S3를 시뮬레이션할 수 있습니다.

## 🏗️ 아키텍처 변경사항

### 기존 (로컬 파일 시스템)
```
프론트엔드 → 백엔드 → uploads/ 폴더
```

### 변경 후 (S3)
```
프론트엔드 → 백엔드 → AWS S3 (또는 LocalStack)
```

## 🧪 로컬 개발 환경 설정 (LocalStack 사용)

### 1. 사전 요구사항
- Docker Desktop 설치 및 실행
- Java 17 이상
- Node.js (프론트엔드용)

### 2. LocalStack 시작
```bash
# Windows
start-localstack.bat

# Linux/Mac
chmod +x start-localstack.sh
./start-localstack.sh
```

또는 직접 Docker Compose 사용:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. 백엔드 실행 (개발 프로파일)
```bash
cd Graddy_back
./gradlew bootRun --args="--spring.profiles.active=dev"
```

### 4. 프론트엔드 실행
```bash
cd Graddy_front
npm start
```

## 📋 환경 설정

### 개발 환경 (LocalStack)
- 프로파일: `dev`
- S3 Endpoint: `http://localhost:4566`
- 버킷명: `graddy-files`
- Access Key: `test`
- Secret Key: `test`

### 운영 환경 (실제 AWS S3)
다음 환경변수를 설정하세요:
```bash
# 필수 환경변수
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-northeast-1
export AWS_S3_BUCKET_NAME=your-bucket-name
export FILE_STORAGE_TYPE=s3
export FILE_STORAGE_SERVICE=s3FileService
```

## 🔧 설정 파일

### application.properties
```properties
# 기본 설정 (로컬 파일 시스템)
file.storage.type=local
file.storage.service=localFileService
```

### application-dev.properties
```properties
# 개발 환경 (LocalStack S3)
file.storage.type=s3
file.storage.service=s3FileService
aws.s3.endpoint=http://localhost:4566
```

### application-prod.properties
```properties
# 운영 환경 (실제 AWS S3)
file.storage.type=s3
file.storage.service=s3FileService
aws.s3.endpoint=
```

## 🧪 테스트 방법

### 1. LocalStack 상태 확인
```bash
# LocalStack 로그 확인
docker-compose -f docker-compose.dev.yml logs localstack

# S3 버킷 목록 확인 (AWS CLI 필요)
aws --endpoint-url=http://localhost:4566 s3 ls
```

### 2. 파일 업로드 테스트
1. 프론트엔드에서 과제 제출 페이지로 이동
2. 파일을 선택하여 업로드
3. 브라우저 개발자 도구에서 네트워크 탭 확인
4. 응답에서 `storageType: "s3"`인지 확인

### 3. S3 파일 확인
```bash
# 업로드된 파일 목록 확인
aws --endpoint-url=http://localhost:4566 s3 ls s3://graddy-files/assignments/

# 특정 파일 다운로드 테스트
aws --endpoint-url=http://localhost:4566 s3 cp s3://graddy-files/assignments/filename.ext ./
```

## 🐛 트러블슈팅

### LocalStack이 시작되지 않는 경우
1. Docker Desktop이 실행 중인지 확인
2. 포트 4566이 사용 중인지 확인: `netstat -an | findstr 4566`
3. LocalStack 로그 확인: `docker-compose -f docker-compose.dev.yml logs localstack`

### 파일 업로드가 실패하는 경우
1. 백엔드 로그에서 S3 연결 상태 확인
2. 프로파일이 올바르게 설정되었는지 확인: `spring.profiles.active=dev`
3. S3 버킷이 생성되었는지 확인: `aws --endpoint-url=http://localhost:4566 s3 ls`

### 파일에 접근할 수 없는 경우
1. CORS 설정이 올바른지 확인
2. 파일 URL 형식 확인:
   - LocalStack: `http://localhost:4566/graddy-files/assignments/filename.ext`
   - AWS S3: `https://bucket-name.s3.region.amazonaws.com/key`

## 📁 파일 구조

```
Graddy_back/
├── src/main/java/com/smhrd/graddy/
│   ├── config/
│   │   ├── S3Config.java          # S3 클라이언트 설정
│   │   └── FileConfig.java        # 파일 설정 통합 관리
│   ├── service/
│   │   ├── FileService.java       # 파일 서비스 인터페이스
│   │   ├── LocalFileService.java  # 로컬 파일 서비스 (기존)
│   │   └── S3FileService.java     # S3 파일 서비스 (신규)
│   └── controller/
│       └── FileController.java    # 파일 업로드/다운로드 API
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties  # 개발 환경 (LocalStack)
│   └── application-prod.properties # 운영 환경 (실제 S3)
└── build.gradle                   # AWS SDK 의존성 추가

docker-compose.dev.yml              # LocalStack 설정
start-localstack.bat                # Windows용 시작 스크립트
start-localstack.sh                 # Linux/Mac용 시작 스크립트
```

## 🚀 배포 시 주의사항

1. **환경변수 설정**: 운영 환경에서는 반드시 실제 AWS 자격 증명을 환경변수로 설정
2. **S3 버킷 생성**: 실제 AWS에서 버킷을 미리 생성하고 적절한 권한 설정
3. **CORS 설정**: 웹에서 S3 파일에 접근할 수 있도록 CORS 정책 설정
4. **프로파일 활성화**: `spring.profiles.active=prod` 설정
5. **보안**: Access Key와 Secret Key를 코드에 하드코딩하지 말고 환경변수 또는 AWS IAM 역할 사용

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. LocalStack과 백엔드 로그
2. 브라우저 개발자 도구의 네트워크 탭
3. 환경변수와 프로파일 설정
4. Docker 컨테이너 상태

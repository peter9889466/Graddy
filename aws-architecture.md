# Graddy 프로젝트 AWS 아키텍처 설계

## 아키텍처 다이어그램

```
인터넷
   │
   ▼
┌─────────────────┐    ┌──────────────────┐
│  AWS Amplify    │────│   GitHub Repo    │
│ (React 호스팅)   │    │  (자동 빌드/배포) │
└─────────────────┘    └──────────────────┘
   │
   ▼ (API 요청)
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  AWS App Runner │────│   Amazon ECR     │    │   Amazon RDS    │
│ (Spring Boot)   │    │ (Docker Images)  │────│   (MySQL)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
   │                                               │
   └───────────────── VPC Connector ──────────────┘
```

## 1. 아키텍처 전체 개요 및 사용자 요청 흐름

이 아키텍처의 핵심 목표는 **'최소한의 비용과 설정으로 최대의 효율을 내는 것'**입니다. 개발자는 인프라가 아닌 코드에만 집중할 수 있도록, 모든 구성 요소를 AWS의 완전 관리형(Fully Managed) 서비스로 구성했습니다.

### 사용자 요청 처리 흐름

#### 1단계: 접속 및 프론트엔드 로딩

-   사용자가 웹 브라우저에 애플리케이션 주소(https://...)를 입력
-   요청이 **AWS Amplify**로 전달됨
-   Amplify는 미리 빌드하여 저장해 둔 React 정적 파일(HTML, CSS, JavaScript)을 사용자에게 빠르고 안전하게 전송
-   사용자의 웹 브라우저가 파일들을 받아 애플리케이션 화면을 렌더링

#### 2단계: API 요청 및 백엔드 처리 (데이터가 필요할 때)

-   사용자가 화면에서 특정 버튼(예: '게시물 목록 불러오기')을 클릭
-   React 앱이 **AWS App Runner**에서 실행 중인 Spring Boot 서비스의 고유 URL로 API 요청 전송
-   예: `https://<spring-runner-id>.awsapprunner.com/api/posts`

#### 3단계: 백엔드 서비스 활성화 (콜드 스타트)

-   App Runner 서비스가 한동안 요청이 없어 잠들어 있는 상태(컨테이너 0개)
-   첫 API 요청을 받으면, App Runner가 즉시 **ECR**에서 Docker 이미지를 가져와 컨테이너 시작
-   이 과정에서 수 초의 지연(콜드 스타트) 발생

#### 4단계: 데이터베이스 연동 및 응답

-   실행된 Spring Boot 컨테이너가 **Amazon RDS** 데이터베이스에 연결
-   데이터베이스에서 필요한 데이터를 조회한 후, 결과를 JSON 형태로 가공
-   JSON 데이터를 API 응답으로 React 앱에 전달

#### 5단계: 프론트엔드 UI 업데이트

-   React 앱이 백엔드로부터 받은 JSON 데이터로 화면 상태 업데이트
-   사용자에게 최신 데이터를 표시

## 2. 구성 요소별 상세 설명

### 프론트엔드: AWS Amplify Hosting

Amplify는 단순한 호스팅을 넘어, 프론트엔드 개발과 배포의 전 과정을 자동화하는 강력한 도구입니다.

#### 연결 (Connect)

-   GitHub 저장소를 Amplify 프로젝트에 연결
-   main 브랜치 연결 설정

#### 빌드 (Build)

-   연결된 저장소의 `package.json`을 분석하여 React 프로젝트 자동 인지
-   `npm install` (의존성 설치) 및 `npm run build` (정적 파일 생성) 자동 설정

#### 배포 (Deploy)

-   `git push`로 main 브랜치에 코드 업로드 시 자동 감지
-   빌드 명령 실행 후 생성된 정적 파일들을 전 세계 CDN에 배포
-   `https://main.앱ID.amplifyapp.com` 형태의 HTTPS 주소 자동 제공

### 컨테이너 이미지 레지스트리: Amazon ECR

ECR은 Docker 이미지를 위한 AWS의 공식 프라이빗 저장소입니다.

#### 설정

-   **리포지토리명**: `graddy-backend`
-   **리전**: ap-northeast-2
-   **역할**: Spring Boot 애플리케이션의 Docker 이미지 안전 보관
-   **연동**: App Runner 서비스 생성 시 이미지 소스로 지정
-   **보안**: IAM을 통해 허가된 AWS 서비스만 접근 가능

### 백엔드 서비스: AWS App Runner

App Runner는 이 아키텍처의 핵심이자 가장 편리한 부분입니다.

#### 추상화된 기능

-   내부적으로 ECS, Fargate, 로드 밸런서, CI/CD 파이프라인을 조합
-   사용자는 "ECR의 Docker 이미지를 웹 서비스로 실행해 줘"라는 요청만 하면 됨

#### 자동화된 기능

-   **로드 밸런싱**: 트래픽 증가 시 자동 컨테이너 수 증가 및 요청 분산
-   **자동 스케일링**: Scale to Zero 기능으로 트래픽 없을 시 컨테이너 수 0으로 축소
-   **HTTPS 및 URL**: 배포 즉시 암호화된 https:// URL 자동 생성
-   **상태 확인**: 주기적 컨테이너 상태 확인 및 자동 복구

#### 설정

-   **서비스명**: graddy-backend-service
-   **CPU**: 0.25 vCPU
-   **Memory**: 512MB
-   **포트**: 8080
-   **환경변수**: RDS 연결 정보

### 데이터베이스: Amazon RDS

RDS는 데이터의 영구적인 저장을 담당하는 상태 관리(Stateful) 계층입니다.

#### 관리의 편의성

-   데이터베이스 서버 설치, 보안 패치, 백업 설정을 AWS가 자동 관리

#### 보안 설정 (매우 중요)

-   **VPC 격리**: RDS는 외부 인터넷에서 직접 접근 불가한 VPC 내부에 생성
-   **VPC 커넥터**: App Runner 서비스를 RDS가 있는 VPC에 연결
-   **보안 그룹**: "오직 App Runner 서비스로부터의 3306 포트 요청만 허용" 규칙 설정

#### 연결 정보

-   App Runner 서비스의 환경 변수에 RDS Endpoint, 사용자명, 비밀번호 저장
-   Spring Boot 애플리케이션이 환경 변수를 읽어 데이터베이스 연결

#### 설정

-   **인스턴스 클래스**: db.t3.micro (프리티어)
-   **엔진**: MySQL 8.0
-   **스토리지**: 20GB gp2
-   **백업**: 7일 보관
-   **Multi-AZ**: 비활성화 (프리티어)

## 3. 프리티어 제한사항 및 비용 분석

### 무료 사용 가능 (프리티어)

-   **AWS Amplify**: 빌드 시간 1,000분/월, 호스팅 15GB/월, 데이터 전송 100GB/월
-   **Amazon ECR**: 500MB 저장공간/월
-   **Amazon RDS**: db.t3.micro 750시간/월 (약 1개월 24시간 운영 가능)
-   **AWS App Runner**: 프리티어 없음 (최소 비용 발생)

### 예상 월 비용 (프리티어 적용)

-   **AWS Amplify**: $0 (프리티어 범위 내)
-   **Amazon ECR**: $0 (프리티어 범위 내)
-   **Amazon RDS**: $0 (프리티어)
-   **AWS App Runner**: 약 $5-10/월 (0.25 vCPU, 512MB, Scale to Zero 적용)
-   **데이터 전송**: $0 (프리티어 범위 내)
-   **총 예상 비용: $5-10/월**

### 비용 최적화 전략

#### 1. App Runner Scale to Zero 활용

-   트래픽이 없을 때 자동으로 컨테이너 수를 0으로 축소
-   개발/테스트 환경에서 야간 시간대 비용 절약

#### 2. RDS 최적화

-   개발 초기에는 RDS 대신 App Runner에 MySQL 컨테이너 사용 고려
-   프로덕션 환경에서만 RDS 사용

#### 3. 대안 아키텍처 (완전 무료)

```
EC2 t3.micro (프리티어) + Docker Compose
├── Spring Boot Container
├── MySQL Container
└── Nginx Container (React 서빙)
```

-   12개월 완전 무료 (프리티어 계정)
-   단일 서버 구성으로 관리 복잡도 증가

## 4. 배포 순서 및 설정 가이드

### Phase 1: 기본 인프라 구성

1. **Amazon ECR 리포지토리 생성**

    - 리포지토리명: `graddy-backend`
    - 리전: ap-northeast-2

2. **Amazon RDS 인스턴스 생성**

    - 인스턴스 클래스: db.t3.micro
    - 엔진: MySQL 8.0
    - VPC 및 보안 그룹 설정

3. **VPC 커넥터 생성**
    - App Runner가 RDS에 접근하기 위한 네트워크 연결

### Phase 2: 백엔드 배포

4. **Docker 이미지 빌드 및 ECR 푸시**

    ```bash
    # ECR 로그인
    aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 197088316799.dkr.ecr.ap-northeast-2.amazonaws.com

    # 이미지 빌드
    docker build -t graddy-backend ./Graddy_back

    # 태그 지정
    docker tag graddy-backend:latest 197088316799.dkr.ecr.ap-northeast-2.amazonaws.com/graddy-backend:latest

    # ECR에 푸시
    docker push 197088316799.dkr.ecr.ap-northeast-2.amazonaws.com/graddy-backend:latest
    ```

5. **AWS App Runner 서비스 생성**
    - 소스: ECR 이미지
    - 환경 변수: RDS 연결 정보
    - VPC 커넥터 연결

### Phase 3: 프론트엔드 배포

6. **GitHub 저장소 준비**

    - React 프로젝트를 GitHub에 푸시
    - main 브랜치 설정

7. **AWS Amplify 앱 생성**
    - GitHub 저장소 연결
    - 빌드 설정 자동 구성
    - 배포 확인

### Phase 4: 통합 테스트

8. **API 연동 테스트**

    - 프론트엔드에서 백엔드 API 호출 확인
    - 데이터베이스 연결 상태 확인

9. **도메인 연결 (선택사항)**
    - Route 53으로 커스텀 도메인 설정

## 5. 모니터링 및 운영

### 자동 모니터링

-   **App Runner**: 자동 상태 확인 및 복구
-   **RDS**: 자동 백업 및 모니터링
-   **Amplify**: 빌드 및 배포 상태 추적

### 비용 모니터링

-   AWS Cost Explorer로 월별 비용 추적
-   CloudWatch 알람으로 예산 초과 시 알림
-   프리티어 사용량 대시보드 확인

### 로그 관리

-   App Runner 서비스 로그 자동 수집
-   CloudWatch Logs에서 애플리케이션 로그 확인
-   오류 발생 시 자동 알림 설정

## 6. 장점 및 특징

### 개발자 친화적

-   **코드 중심**: 인프라 설정 최소화, 코드 작성에 집중
-   **자동화**: Git 푸시만으로 자동 빌드/배포
-   **간편함**: 복잡한 설정 없이 즉시 사용 가능

### 비용 효율적

-   **Scale to Zero**: 사용하지 않을 때 비용 최소화
-   **프리티어 활용**: 대부분의 서비스를 무료로 사용
-   **예측 가능한 비용**: 월 $5-10의 저렴한 운영 비용

### 확장성

-   **자동 스케일링**: 트래픽 증가 시 자동 확장
-   **글로벌 CDN**: 전 세계 사용자에게 빠른 서비스 제공
-   **관리형 서비스**: AWS가 인프라 관리 담당

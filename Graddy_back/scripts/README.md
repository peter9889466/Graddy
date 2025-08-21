# AI 커리큘럼 생성 시스템

이 시스템은 OpenAI GPT를 사용하여 스터디의 관심 항목과 수준을 고려한 맞춤형 커리큘럼을 자동으로 생성합니다.

## 구성 요소

### 1. Spring Boot 백엔드
- `AICurriculumController`: AI 커리큘럼 생성 API 엔드포인트
- `AICurriculumService`: Python 스크립트 호출 및 결과 처리
- `Study`, `Tag`, `Interest` 엔티티: 데이터베이스 연동

### 2. Python 스크립트
- `generate_curriculum.py`: OpenAI GPT API를 사용한 커리큘럼 생성

## 설치 및 설정

### 1. Python 환경 설정
```bash
cd scripts
pip install -r requirements.txt
```

### 2. OpenAI API 키 설정 (.env 파일 사용)
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# .env 파일 (프로젝트 루트 디렉토리에 위치)
OPENAI_API_KEY=your_actual_openai_api_key_here
```

**주의사항:**
- `.env` 파일은 프로젝트 루트 디렉토리(`Graddy/`)에 위치해야 합니다
- `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다 (보안상)
- API 키는 실제 OpenAI에서 발급받은 키로 교체해야 합니다

### 3. 환경변수 직접 설정 (선택사항)
`.env` 파일 대신 환경변수로 직접 설정할 수도 있습니다:

```bash
# Windows
set OPENAI_API_KEY=your_actual_api_key_here

# Linux/Mac
export OPENAI_API_KEY=your_actual_api_key_here
```

## 사용법

### 1. API 호출
```bash
POST /api/ai-curriculum/generate/{studyId}
```

### 2. Python 스크립트 직접 실행
```bash
# 프로젝트 루트 디렉토리에서 실행
python scripts/generate_curriculum.py <study_id> <study_name> <study_title> <study_desc> <study_level> <interest_tags> <study_start> <study_end>
```

### 3. 시스템 테스트
```bash
# 프로젝트 루트 디렉토리에서 실행
python scripts/test_curriculum.py
```

## 입력 데이터

- **study_id**: 스터디 ID
- **study_name**: 스터디명
- **study_title**: 스터디 제목
- **study_desc**: 스터디 설명
- **study_level**: 스터디 레벨 (1-5)
- **interest_tags**: 관심 태그들 (쉼표로 구분)
- **study_start**: 스터디 시작일
- **study_end**: 스터디 마감일

## 출력

생성된 커리큘럼은 마크다운 형식으로 반환되며, 다음을 포함합니다:
- 주차별 학습 목표
- 주요 학습 내용
- 실습 과제
- 성과 평가 방법

## 파일 구조

```
Graddy/
├── .env                          # OpenAI API 키 설정 (프로젝트 루트)
├── Graddy_back/
│   ├── scripts/
│   │   ├── generate_curriculum.py    # AI 커리큘럼 생성 스크립트
│   │   ├── test_curriculum.py        # 테스트 스크립트
│   │   ├── requirements.txt           # Python 패키지 의존성
│   │   └── README.md                  # 이 파일
│   └── src/main/java/
│       └── com/smhrd/graddy/
│           ├── study/
│           │   ├── controller/
│           │   │   └── AICurriculumController.java
│           │   ├── service/
│           │   │   └── AICurriculumService.java
│           │   └── dto/
│           │       ├── AICurriculumRequest.java
│           │       └── AICurriculumResponse.java
│           └── tag/
│               └── entity/
│                   └── Tag.java
```

## 주의사항

1. **OpenAI API 키**: `.env` 파일에 올바른 API 키가 설정되어야 합니다
2. **Python 3.7 이상**: Python 3.7 이상이 필요합니다
3. **인터넷 연결**: OpenAI API 호출을 위한 인터넷 연결이 필요합니다
4. **API 비용**: API 사용량에 따른 비용이 발생할 수 있습니다
5. **파일 위치**: `.env` 파일은 반드시 프로젝트 루트 디렉토리에 위치해야 합니다

## 에러 처리

- API 키 미설정 시 에러 메시지 출력
- `.env` 파일을 찾을 수 없을 때 안내 메시지 출력
- 네트워크 오류 시 적절한 에러 메시지 반환
- Spring Boot에서 Python 스크립트 실행 오류 시 로그 기록

## 문제 해결

### OpenAI API 키 관련 문제
```bash
# .env 파일이 올바른 위치에 있는지 확인
ls -la .env

# .env 파일 내용 확인 (API 키가 올바르게 설정되어 있는지)
cat .env
```

### Python 패키지 관련 문제
```bash
# 필요한 패키지 재설치
pip install -r scripts/requirements.txt

# 패키지 버전 확인
pip list | grep openai
pip list | grep python-dotenv
```

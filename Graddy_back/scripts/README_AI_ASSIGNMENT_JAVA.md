# Java Spring Boot AI 과제 생성 API 사용법

## 개요
이 API는 Spring Boot 애플리케이션에서 스터디의 태그, 레벨, 커리큘럼을 기반으로 OpenAI GPT를 활용하여 AI 과제를 자동으로 생성하는 기능을 제공합니다.

## 주요 기능
- **스터디 정보 기반 과제 생성**: 태그, 커리큘럼, 레벨을 고려한 맞춤형 과제
- **다양한 과제 유형**: 일반, 퀴즈, 프로젝트, 복습 과제 지원
- **자동 데이터베이스 저장**: 생성된 과제를 자동으로 DB에 저장
- **자동 일정 생성**: 과제 제출일에 맞춰 자동으로 일정 추가
- **권한 관리**: 스터디 리더만 AI 과제 생성 가능

## API 엔드포인트

### AI 과제 생성
```http
POST /api/assignments/ai/generate
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "studyProjectId": 14,
  "assignmentType": "general",
  "deadline": "2025-08-25T14:00:00"
}
```

## 요청 데이터 구조

### AiAssignmentRequest
```json
{
  "studyProjectId": 14,           // 스터디 프로젝트 ID (필수)
  "assignmentType": "general",     // 과제 유형 (선택, 기본값: general)
  "deadline": "2025-08-25T14:00:00" // 마감일 (선택, null이면 7일 후 자동 설정)
}
```

### 과제 유형 (assignmentType)
- `general`: 일반적인 학습 과제
- `quiz`: 퀴즈 형태의 과제
- `project`: 프로젝트 기반 과제
- `review`: 복습 및 정리 과제

## 응답 데이터 구조

### AiAssignmentResponse
```json
{
  "assignmentId": 1,
  "studyProjectId": 14,
  "memberId": 1,
  "title": "AI 생성 과제 제목",
  "description": "AI가 생성한 과제 설명",
  "deadline": "2025-08-25T14:00:00",
  "fileUrl": "{\"title\":\"...\",\"learning_objectives\":[...],...}",
  "createdAt": "2025-08-18T14:00:00",
  "aiGeneratedData": {
    "title": "AI 생성 과제 제목",
    "description": "상세한 과제 설명",
    "learning_objectives": ["학습 목표 1", "학습 목표 2", "학습 목표 3"],
    "requirements": ["요구사항 1", "요구사항 2", "요구사항 3"],
    "submission_format": "제출 형식 설명",
    "evaluation_criteria": ["평가 기준 1", "평가 기준 2", "평가 기준 3"],
    "estimated_duration": "예상 소요 시간",
    "difficulty_level": "난이도 설명",
    "tags": ["관련 태그 1", "관련 태그 2"],
    "additional_resources": ["추가 자료 1", "추가 자료 2"]
  }
}
```

## 환경 설정

### 1. application.properties 설정
```properties
# OpenAI API 설정
openai.api.key=${OPENAI_API_KEY:}
openai.api.url=https://api.openai.com/v1/chat/completions
openai.model=gpt-4o-mini
```

### 2. 환경 변수 설정
```bash
# Windows
set OPENAI_API_KEY=your_openai_api_key_here

# Linux/Mac
export OPENAI_API_KEY=your_openai_api_key_here
```

### 3. .env 파일 설정 (선택사항)
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 테스트 시나리오

### 1. 기본 AI 과제 생성
```bash
curl -X POST 'http://localhost:8080/api/assignments/ai/generate' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "studyProjectId": 14,
    "assignmentType": "general"
  }'
```

### 2. 프로젝트 기반 AI 과제 생성
```bash
curl -X POST 'http://localhost:8080/api/assignments/ai/generate' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "studyProjectId": 14,
    "assignmentType": "project",
    "deadline": "2025-08-25T14:00:00"
  }'
```

### 3. 퀴즈 형태 AI 과제 생성
```bash
curl -X POST 'http://localhost:8080/api/assignments/ai/generate' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "studyProjectId": 14,
    "assignmentType": "quiz"
  }'
```

## AI 과제 생성 과정

### 1. 권한 검증
- JWT 토큰에서 userId 추출
- 해당 스터디의 리더인지 확인

### 2. 스터디 정보 조회
- `studies_projects` 테이블에서 스터디 기본 정보 조회
- `tag`와 `interest` 테이블에서 태그 정보 조회
- 스터디 레벨, 커리큘럼, 설명 등 수집

### 3. OpenAI API 호출
- 스터디 정보를 기반으로 프롬프트 구성
- OpenAI GPT API 호출하여 과제 생성
- JSON 형식의 응답 파싱

### 4. 데이터베이스 저장
- 생성된 과제를 `assignments` 테이블에 저장
- AI 생성 데이터를 `file_url` 필드에 JSON으로 저장

### 5. 자동 일정 생성
- 과제 제출일에 맞춰 자동으로 일정 추가
- `schedule` 테이블에 제출일과 리마인더 일정 생성

## 고려되는 스터디 정보

### 1. **태그 정보**
- 관심 분야를 기반으로 한 과제 내용 구성
- 예: Python, JavaScript, AI, 머신러닝 등

### 2. **커리큘럼**
- `cur_text` 필드의 내용을 반영한 과제 설계
- 주차별 학습 내용과 연계된 과제 구성

### 3. **스터디 레벨**
- 레벨 1: 초급자 수준 (기초 개념 이해 및 간단한 실습)
- 레벨 2: 중급자 수준 (기본 실습 및 응용 문제)
- 레벨 3: 고급자 수준 (심화 학습 및 프로젝트 기반)

### 4. **멤버 수**
- 팀워크와 협업을 고려한 과제 설계
- 그룹 활동과 개인 활동의 균형

### 5. **기간**
- 스터디 기간에 맞는 과제 계획
- 적절한 마감일 설정

## 오류 처리

### 일반적인 오류와 해결방법

#### 1. OpenAI API 키 오류
```
ERROR: OpenAI API 호출 중 오류 발생: 401 Unauthorized
```
**해결방법**: 
- `OPENAI_API_KEY` 환경 변수 설정 확인
- API 키의 유효성 및 만료 여부 확인

#### 2. 권한 오류
```
ERROR: AI 과제 생성은 스터디/프로젝트 리더만 가능합니다.
```
**해결방법**: 
- 해당 스터디의 리더인지 확인
- JWT 토큰의 유효성 확인

#### 3. 스터디 ID 오류
```
ERROR: 스터디 프로젝트를 찾을 수 없습니다: {id}
```
**해결방법**: 
- 올바른 스터디 ID 입력 확인
- 데이터베이스에 해당 스터디가 존재하는지 확인

#### 4. JSON 파싱 오류
```
WARN: JSON 파싱 실패, 기본 형식으로 반환
```
**해결방법**: 
- OpenAI API 응답 형식 확인
- 필요시 프롬프트 수정

## 주의사항

1. **API 키 보안**: `OPENAI_API_KEY`를 소스 코드에 하드코딩하지 마세요
2. **API 사용량**: OpenAI API 사용량과 비용을 모니터링하세요
3. **과제 검토**: AI가 생성한 과제는 반드시 검토 후 사용하세요
4. **권한 관리**: 스터디 리더만 AI 과제를 생성할 수 있습니다
5. **자동 일정**: 과제 생성 시 자동으로 제출일 일정이 추가됩니다

## 확장 가능성

### 추가 기능
- **과제 템플릿**: 자주 사용하는 과제 템플릿 관리
- **난이도 조정**: 사용자 피드백을 반영한 난이도 조정
- **과제 수정**: AI 생성 과제의 수정 및 개선
- **과제 평가**: AI가 생성한 과제의 품질 평가

### 커스터마이징
- **프롬프트 수정**: 과제 생성 프롬프트 커스터마이징
- **새로운 과제 유형**: 추가 과제 유형 정의
- **평가 기준**: 과제별 맞춤형 평가 기준 설정
- **학습 목표**: 스터디별 특화된 학습 목표 설정

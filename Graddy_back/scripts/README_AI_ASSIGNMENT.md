# AI 과제 생성 스크립트 사용법

## 개요
이 스크립트는 OpenAI GPT를 활용하여 스터디/프로젝트의 태그 정보, 커리큘럼, 레벨을 고려한 맞춤형 과제를 자동으로 생성합니다.

## 주요 기능
- **스터디 정보 기반 과제 생성**: 태그, 커리큘럼, 레벨을 고려한 맞춤형 과제
- **다양한 과제 유형**: 일반, 퀴즈, 프로젝트, 복습 과제 지원
- **자동 데이터베이스 저장**: 생성된 과제를 자동으로 DB에 저장
- **레벨별 난이도 조정**: 스터디 레벨에 맞는 적절한 난이도 설정
- **통합 대시보드**: 참여중인 스터디와 신청한 스터디를 한 번에 조회
- **신청 상태 정보**: study_project_status 테이블의 상세 신청 정보 포함

## 설치 및 설정

### 1. 필요한 패키지 설치
```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 설정하세요:
```env
# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# 데이터베이스 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=graddy
```

## 사용법

### 기본 사용법
```bash
python generate_ai_assignment.py <study_id> <member_id> [assignment_type]
```

### 매개변수 설명
- `study_id`: 스터디/프로젝트 ID (필수)
- `member_id`: 과제 생성자 member_id (필수)
- `assignment_type`: 과제 유형 (선택, 기본값: general)
  - `general`: 일반적인 학습 과제
  - `quiz`: 퀴즈 형태의 과제
  - `project`: 프로젝트 기반 과제
  - `review`: 복습 및 정리 과제

### 사용 예시

#### 1. 일반 과제 생성
```bash
python generate_ai_assignment.py 14 1
```

#### 2. 프로젝트 기반 과제 생성
```bash
python generate_ai_assignment.py 14 1 project
```

#### 3. 퀴즈 형태 과제 생성
```bash
python generate_ai_assignment.py 14 1 quiz
```

## 생성되는 과제 정보

### 기본 필드
- `title`: 과제 제목
- `description`: 상세한 과제 설명
- `learning_objectives`: 학습 목표 목록
- `requirements`: 과제 요구사항
- `submission_format`: 제출 형식
- `evaluation_criteria`: 평가 기준
- `estimated_duration`: 예상 소요 시간
- `difficulty_level`: 난이도 설명
- `tags`: 관련 태그
- `additional_resources`: 추가 자료

### 고려되는 스터디 정보
1. **태그 정보**: 관심 분야를 기반으로 한 과제 내용 구성
2. **커리큘럼**: `cur_text` 필드의 내용을 반영한 과제 설계
3. **스터디 레벨**: 레벨에 맞는 적절한 난이도 설정
4. **멤버 수**: 팀워크와 협업을 고려한 과제 설계
5. **기간**: 스터디 기간에 맞는 과제 계획

## 데이터베이스 구조

### assignments 테이블
- `study_project_id`: 스터디/프로젝트 ID
- `member_id`: 과제 생성자 member_id
- `title`: 과제 제목
- `description`: 과제 설명
- `deadline`: 마감일 (자동으로 7일 후 설정)
- `file_url`: 전체 과제 데이터를 JSON으로 저장
- `created_at`: 생성 시간

## 오류 처리

### 일반적인 오류와 해결방법

#### 1. OpenAI API 키 오류
```
ERROR: OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.
```
**해결방법**: `.env` 파일에 올바른 OpenAI API 키를 설정하세요.

#### 2. 데이터베이스 연결 오류
```
ERROR: 데이터베이스 조회 중 오류가 발생했습니다
```
**해결방법**: 
- 데이터베이스가 실행 중인지 확인
- `.env` 파일의 데이터베이스 설정 확인
- 데이터베이스 사용자 권한 확인

#### 3. 스터디 ID 오류
```
ERROR: 스터디 ID {id}를 찾을 수 없습니다.
```
**해결방법**: 올바른 스터디 ID를 입력했는지 확인하세요.

## 주의사항

1. **API 키 보안**: `.env` 파일을 Git에 커밋하지 마세요
2. **데이터베이스 백업**: 과제 생성 전 데이터베이스 백업 권장
3. **API 사용량**: OpenAI API 사용량과 비용을 모니터링하세요
4. **과제 검토**: AI가 생성한 과제는 반드시 검토 후 사용하세요

## 확장 가능성

### 추가 과제 유형
- `presentation`: 발표 과제
- `research`: 연구 과제
- `case_study`: 사례 연구 과제

### 커스터마이징
- 프롬프트 템플릿 수정
- 새로운 평가 기준 추가
- 과제 난이도 세분화

## 문제 해결

### 로그 확인
스크립트 실행 시 상세한 로그가 출력됩니다:
```
1. 스터디 정보를 조회하고 있습니다...
   - 스터디명: AI 스터디
   - 레벨: 2
   - 태그: AI, 머신러닝
2. OpenAI를 사용하여 AI 과제를 생성하고 있습니다...
3. 생성된 과제:
   {...}
4. 데이터베이스에 과제를 저장하고 있습니다...
```

### 디버깅
문제가 발생하면 다음을 확인하세요:
1. 환경 변수 설정
2. 데이터베이스 연결 상태
3. OpenAI API 키 유효성
4. 스터디 ID와 member_id의 존재 여부

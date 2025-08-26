# 일정 관리 API 사용법

## 개요
이 API는 사용자의 개인 일정과 스터디 관련 일정을 관리하며, 과제 제출일과 스터디 기간에 맞춰 자동으로 일정을 생성하는 기능을 제공합니다.

## 주요 기능
- **개인 일정 관리**: 사용자의 개인 일정 생성, 조회, 수정, 삭제
- **스터디 일정 관리**: 스터디 관련 일정 생성, 조회, 수정, 삭제
- **자동 일정 생성**: 과제 생성 시 제출일 일정 자동 추가
- **자동 일정 생성**: 스터디 생성 시 시작/종료일 일정 자동 추가
- **통합 일정 조회**: 개인 일정과 스터디 일정을 통합하여 조회

## API 엔드포인트

### 1. 개인 일정 생성
```http
POST /api/schedules/personal
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "content": "개인 미팅",
  "schTime": "2025-08-25T14:00:00"
}
```

### 2. 스터디 일정 생성
```http
POST /api/schedules/study
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "studyProjectId": 14,
  "content": "스터디 정기 모임",
  "schTime": "2025-08-26T19:00:00"
}
```

### 3. 사용자 전체 일정 조회
```http
GET /api/schedules/my
Authorization: Bearer {JWT_TOKEN}
```

### 4. 사용자 개인 일정 조회
```http
GET /api/schedules/my/personal
Authorization: Bearer {JWT_TOKEN}
```

### 5. 사용자 스터디 일정 조회
```http
GET /api/schedules/my/study
Authorization: Bearer {JWT_TOKEN}
```

### 6. 특정 스터디 일정 조회
```http
GET /api/schedules/study/{studyProjectId}
```

### 7. 기간별 일정 조회
```http
GET /api/schedules/my/period?startTime=2025-08-25T00:00:00&endTime=2025-08-31T23:59:59
Authorization: Bearer {JWT_TOKEN}
```

### 8. 일정 수정
```http
PUT /api/schedules/{schId}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "content": "수정된 일정 내용",
  "schTime": "2025-08-25T15:00:00"
}
```

### 9. 일정 삭제
```http
DELETE /api/schedules/{schId}
Authorization: Bearer {JWT_TOKEN}
```

## 자동 일정 생성 기능

### 과제 생성 시 자동 일정 추가
과제를 생성하면 다음과 같은 일정이 자동으로 추가됩니다:

1. **과제 제출일 하루 전 리마인더**
   - 내용: `[과제 제출일 하루 전] {스터디명} - {과제제목}`
   - 시간: 제출일 하루 전

2. **과제 제출일 당일**
   - 내용: `[과제 제출일] {스터디명} - {과제제목}`
   - 시간: 제출일 당일

### 스터디 생성 시 자동 일정 추가
스터디를 생성하면 다음과 같은 일정이 자동으로 추가됩니다:

1. **스터디 시작일**
   - 내용: `[스터디 시작] {스터디명}`
   - 시간: 스터디 시작일

2. **스터디 종료일**
   - 내용: `[스터디 종료] {스터디명}`
   - 시간: 스터디 종료일

## 응답 데이터 구조

### ScheduleResponse
```json
{
  "schId": 1,
  "userId": "nano1",
  "studyProjectId": 14,
  "content": "[과제 제출일] AI 스터디 - Python 기초 과제",
  "schTime": "2025-08-25T14:00:00",
  "scheduleType": "study",
  "studyProjectName": "AI 스터디"
}
```

### 필드 설명
- `schId`: 일정 고유 ID
- `userId`: 일정 소유자 ID
- `studyProjectId`: 스터디 프로젝트 ID (개인 일정인 경우 null)
- `content`: 일정 내용
- `schTime`: 일정 시간
- `scheduleType`: 일정 유형 ("personal" 또는 "study")
- `studyProjectName`: 스터디명 (스터디 일정인 경우에만)

## 테스트 시나리오

### 1. 개인 일정 관리 테스트
```bash
# 1. 개인 일정 생성
curl -X POST 'http://localhost:8080/api/schedules/personal' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "개인 미팅",
    "schTime": "2025-08-25T14:00:00"
  }'

# 2. 개인 일정 조회
curl -X GET 'http://localhost:8080/api/schedules/my/personal' \
  -H 'Authorization: Bearer {JWT_TOKEN}'
```

### 2. 스터디 일정 관리 테스트
```bash
# 1. 스터디 일정 생성
curl -X POST 'http://localhost:8080/api/schedules/study' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "studyProjectId": 14,
    "content": "스터디 정기 모임",
    "schTime": "2025-08-26T19:00:00"
  }'

# 2. 스터디 일정 조회
curl -X GET 'http://localhost:8080/api/schedules/my/study' \
  -H 'Authorization: Bearer {JWT_TOKEN}'
```

### 3. 자동 일정 생성 테스트
```bash
# 1. 과제 생성 (자동으로 제출일 일정 추가됨)
curl -X POST 'http://localhost:8080/api/assignments' \
  -H 'Authorization: Bearer {JWT_TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "studyProjectId": 14,
    "title": "Python 기초 과제",
    "description": "Python 기초 문법 학습",
    "deadline": "2025-08-25T14:00:00",
    "fileUrl": "assignment.pdf"
  }'

# 2. 생성된 일정 확인
curl -X GET 'http://localhost:8080/api/schedules/my' \
  -H 'Authorization: Bearer {JWT_TOKEN}'
```

## 주의사항

1. **권한 관리**: 사용자는 본인의 일정만 수정/삭제할 수 있습니다.
2. **자동 일정 생성**: 과제나 스터디 생성 시 자동으로 일정이 추가되지만, 실패해도 메인 기능은 정상 동작합니다.
3. **일정 중복**: 동일한 시간에 여러 일정이 생성될 수 있으므로, 필요시 중복 체크 로직을 추가하세요.
4. **시간대**: 모든 시간은 서버 시간대를 기준으로 처리됩니다.

## 확장 가능성

### 추가 기능
- **반복 일정**: 주간/월간 반복 일정 생성
- **알림 기능**: 일정 전 알림 (이메일, 푸시 등)
- **일정 공유**: 스터디 멤버 간 일정 공유
- **캘린더 연동**: 외부 캘린더 서비스와 연동

### 커스터마이징
- **일정 템플릿**: 자주 사용하는 일정 템플릿 관리
- **일정 카테고리**: 일정을 카테고리별로 분류
- **우선순위**: 일정의 우선순위 설정

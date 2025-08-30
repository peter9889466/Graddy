# AI 과제 생성 및 스터디/프로젝트 관리 테스트

## 1. 마감일이 설정된 AI 과제 생성

```bash
curl -X 'POST' \
  'http://localhost:8080/api/assignments' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw' \
  -H 'Content-Type: application/json' \
  -d '{
  "studyProjectId": 14,
  "title": "AI가 생성한 과제 - 마감일 설정됨",
  "description": "이 과제는 AI가 생성했으며, 마감일이 명시적으로 설정되어 있습니다.",
  "deadline": "2025-08-31T23:59:59.000Z",
  "fileUrl": "https://example.com/ai_assignment.pdf"
}'
```

## 2. 마감일이 설정되지 않은 AI 과제 생성 (자동으로 7일 뒤로 설정)

```bash
curl -X 'POST' \
  'http://localhost:8080/api/assignments' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw' \
  -H 'Content-Type: application/json' \
  -d '{
  "studyProjectId": 14,
  "title": "AI가 생성한 과제 - 마감일 자동 설정",
  "description": "이 과제는 AI가 생성했으며, 마감일이 설정되지 않아 자동으로 생성일로부터 7일 뒤로 설정됩니다.",
  "fileUrl": "https://example.com/ai_assignment_auto.pdf"
}'
```

## 3. 일반 과제 생성

```bash
curl -X 'POST' \
  'http://localhost:8080/api/assignments' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw' \
  -H 'Content-Type: application/json' \
  -d '{
  "studyProjectId": 14,
  "title": "일반 과제 생성 테스트",
  "description": "이 과제는 일반적인 방식으로 생성된 과제입니다.",
  "deadline": "2025-08-25T23:59:59.000Z",
  "fileUrl": "https://example.com/regular_assignment.pdf"
}'
```

## 4. 과제 목록 조회

### 4.1 스터디/프로젝트별 과제 목록 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/assignments/study-project/14' \
  -H 'accept: */*'
```

### 4.2 현재 사용자의 과제 목록 조회 (새로 추가됨)

```bash
curl -X 'GET' \
  'http://localhost:8080/api/assignments/member/current?studyProjectId=14' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw'
```

### 4.3 특정 멤버의 과제 목록 조회 (리더 권한 필요)

```bash
curl -X 'GET' \
  'http://localhost:8080/api/assignments/member/1?studyProjectId=14' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw'
```

## 5. 특정 과제 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/assignments/{assignmentId}' \
  -H 'accept: */*'
```

## 6. 스터디/프로젝트 관리 (새로 추가됨)

### 6.1 내 참여 스터디/프로젝트 목록 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/studies-projects/my-participations' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw'
```

### 6.2 내 신청 스터디/프로젝트 목록 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/studies-projects/my-applications' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw'
```

### 6.3 내 스터디/프로젝트 관리 대시보드

```bash
curl -X 'GET' \
  'http://localhost:8080/api/studies-projects/my-dashboard' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw'
```

### 6.4 내 스터디/프로젝트 상태별 상세 정보 조회 (새로 추가됨)

```bash
curl -X 'GET' \
  'http://localhost:8080/api/studies-projects/my-status-details' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw'
```

## 7. 전체 스터디/프로젝트 목록 조회 (nick 정보 포함)

### 7.1 전체 스터디/프로젝트 목록 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/studies-projects' \
  -H 'accept: */*'
```
**
응답 예시 (nick 정보 포함)**:

```json
{
    "status": 200,
    "message": "전체 스터디/프로젝트 목록 조회가 성공했습니다.",
    "data": [
        {
            "studyProjectId": 14,
            "studyProjectName": "AI 스터디",
            "studyProjectTitle": "AI 기초 학습",
            "studyProjectDesc": "AI 기초 개념 학습",
            "studyLevel": 1,
            "typeCheck": "study",
            "userId": "nano1",
            "isRecruiting": "recruitment",
            "studyProjectStart": "2025-01-20T00:00:00",
            "studyProjectEnd": "2025-02-20T00:00:00",
            "studyProjectTotal": 5,
            "soltStart": "2025-01-20T09:00:00",
            "soltEnd": "2025-01-20T18:00:00",
            "createdAt": "2025-01-20T00:00:00",
            "curText": "AI 스터디입니다.",
            "tagNames": ["AI", "머신러닝"],
            "availableDays": [1, 3, 5],
            "currentMemberCount": 3,
            "members": [
                {
                    "memberId": 1,
                    "userId": "nano1",
                    "nick": "나노",
                    "memberType": "leader",
                    "memberStatus": "approved",
                    "joinedAt": "2025-01-20T00:00:00"
                },
                {
                    "memberId": 2,
                    "userId": "user2",
                    "nick": "사용자2",
                    "memberType": "member",
                    "memberStatus": "approved",
                    "joinedAt": "2025-01-21T00:00:00"
                }
            ],
            "userParticipationStatus": "leader"
        }
    ]
}
```

## 8. 내 스터디/프로젝트 대시보드 (참여 상태 구분)

### 8.1 내 스터디/프로젝트 관리 대시보드

```bash
curl -X 'GET' \
  'http://localhost:8080/api/studies-projects/my-dashboard' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw'
```

## 9. AI 과제 생성 테스트

### 9.1 AI 과제 생성 후 확인

```bash
# 생성된 과제 목록 확인
curl -X 'GET' \
  'http://localhost:8080/api/assignments/study-project/14' \
  -H 'accept: */*'

# 특정 과제 상세 조회
curl -X 'GET' \
  'http://localhost:8080/api/assignments/{assignmentId}' \
  -H 'accept: */*'
```

## 주의사항

1. **JWT 토큰**: 위의 예시에서 사용된 JWT 토큰은 만료되었을 수 있습니다. 실제 테스트 시에는 유효한 토큰을 사용해야 합니다.

2. **권한**:
    - 과제 생성은 해당 스터디의 리더만 가능합니다.
    - 특정 멤버의 과제 목록 조회는 해당 스터디의 리더만 가능합니다.
    - 현재 사용자의 과제 목록 조회는 로그인한 사용자만 가능합니다.

3. **마감일 자동 설정**: `deadline` 필드를 생략하거나 `null`로 설정하면 자동으로 생성일로부터 7일 뒤로 설정됩니다.

4. **AI 과제 생성**: GPT 등 AI가 생성한 과제 내용은 기존 `/assignments` 엔드포인트를 통해 생성할 수 있습니다.

5. **새로운 엔드포인트**:
    - `/assignments/member/current?studyProjectId={id}`: 현재 로그인한 사용자의 과제 목록 조회
    - `/assignments/member/{memberId}?studyProjectId={id}`: 특정 멤버의 과제 목록 조회 (리더 권한 필요)
    - `/studies-projects/my-participations`: 내 참여 스터디/프로젝트 목록 조회
    - `/studies-projects/my-applications`: 내 신청 스터디/프로젝트 목록 조회
    - `/studies-projects/my-dashboard`: 내 스터디/프로젝트 관리 대시보드
    - `/studies-projects/my-status-details`: 내 스터디/프로젝트 상태별 상세 정보 조회

6. **데이터베이스 확인**: 테스트 후 데이터베이스에서 과제가 올바르게 생성되었는지 확인하세요.
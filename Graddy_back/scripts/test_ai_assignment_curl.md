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

**응답 예시 (nick 정보 포함)**:
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

### 8.3 my-dashboard 응답 예시

```json
{
  "status": 200,
  "message": "내 스터디/프로젝트 대시보드 조회가 성공했습니다.",
  "data": {
    "allStudies": [
      {
        "studyProjectId": 14,
        "studyProjectName": "AI 스터디",
        "studyProjectTitle": "머신러닝 기초",
        "studyProjectDesc": "AI와 머신러닝의 기초를 배우는 스터디",
        "studyLevel": 2,
        "typeCheck": "study",
        "userId": "user123",
        "isRecruiting": "recruitment",
        "studyProjectStart": "2025-01-01T00:00:00",
        "studyProjectEnd": "2025-03-31T23:59:59",
        "studyProjectTotal": 10,
        "soltStart": "2025-01-01T09:00:00",
        "soltEnd": "2025-01-01T18:00:00",
        "interestTags": ["AI", "머신러닝", "파이썬"],
        "availableDays": [1, 3, 5],
        "currentMemberCount": 5,
        "members": [
          {
            "memberId": 1,
            "userId": "user123",
            "nick": "김철수",
            "memberType": "leader",
            "memberStatus": "approved",
            "joinedAt": "2025-01-01T00:00:00"
          }
        ],
        "userParticipationStatus": "참여중",
        "applicationStatus": null,
        "applicationDate": null
      },
      {
        "studyProjectId": 15,
        "studyProjectName": "웹 개발 스터디",
        "studyProjectTitle": "React + Spring Boot",
        "studyProjectDesc": "풀스택 웹 개발 학습",
        "studyLevel": 2,
        "typeCheck": "study",
        "userId": "user456",
        "isRecruiting": "recruitment",
        "studyProjectStart": "2025-02-01T00:00:00",
        "studyProjectEnd": "2025-04-01T23:59:59",
        "studyProjectTotal": 8,
        "soltStart": "2025-02-01T09:00:00",
        "soltEnd": "2025-02-01T18:00:00",
        "interestTags": ["React", "Spring Boot", "웹 개발"],
        "availableDays": [2, 4, 6],
        "currentMemberCount": 3,
        "members": [
          {
            "memberId": 2,
            "userId": "user456",
            "nick": "개발자",
            "memberType": "leader",
            "memberStatus": "approved",
            "joinedAt": "2025-02-01T00:00:00"
          }
        ],
        "userParticipationStatus": "신청중",
        "applicationStatus": "PENDING",
        "applicationDate": "2025-01-25T10:30:00"
      }
    ],
    "participations": [
      {
        "studyProjectId": 14,
        "studyProjectName": "AI 스터디",
        "userParticipationStatus": "참여중",
        "applicationStatus": null,
        "applicationDate": null
      }
    ],
    "applications": [
      {
        "studyProjectId": 15,
        "studyProjectName": "웹 개발 스터디",
        "userParticipationStatus": "신청중",
        "applicationStatus": "PENDING",
        "applicationDate": "2025-01-25T10:30:00"
      }
    ],
    "totalCount": 2,
    "participationCount": 1,
    "applicationCount": 1
  }
}
```

**응답 구조 설명:**
- `allStudies`: 참여중이거나 신청한 모든 스터디/프로젝트 통합 목록 (중복 제거됨)
- `participations`: 참여 중인 스터디/프로젝트 목록
- `applications`: 신청한 스터디/프로젝트 목록 (중복 제거됨)
- `totalCount`: 전체 스터디/프로젝트 수 (중복 제거됨)
- `participationCount`: 참여 중인 스터디/프로젝트 수
- `applicationCount`: 신청한 스터디/프로젝트 수 (중복 제거됨)

**중복 제거 로직:**
- 이미 참여 중인 스터디는 신청 목록에서 제외
- 참여 중인 스터디가 우선순위를 가짐
- 최종적으로 중복 없는 통합 목록 제공

**상태 구분:**
- **참여 중인 스터디**: `userParticipationStatus` = "participating" 또는 "leader"
- **신청 대기 스터디**: `userParticipationStatus` = "applied", `applicationStatus` = "PENDING"
- **스터디 진행 상태**: `studyStatus` = "active" (진행중), "recruitment_completed" (모집완료), "completed" (종료됨)

**새로 추가된 필드:**
- `applicationStatus`: 신청 상태 (PENDING, REJECTED, null)
- `applicationDate`: 신청 일시 (신청한 경우에만 값이 있음)
- `studyStatus`: 스터디 진행 상태 ("active": 진행중, "recruitment_completed": 모집완료, "completed": 종료됨)

**참여 상태 설명**:
- `"leader"`: 해당 스터디/프로젝트의 리더
- `"participating"`: 해당 스터디/프로젝트에 참여 중인 멤버
- `"applied"`: 해당 스터디/프로젝트에 신청한 상태 (승인 대기 중)
- `"none"`: 해당 스터디/프로젝트와 관련이 없는 상태

## 9. 내 스터디/프로젝트 상태별 상세 정보 (새로 추가됨)

### 9.1 내 스터디/프로젝트 상태별 상세 정보 조회

```bash
curl -X 'GET' \
  'http://localhost:8080/api/studies-projects/my-status-details' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJuYW5vMSIsImlhdCI6MTc1NjAyMTY3NCwiZXhwIjoxNzU2MDI1Mjc0fQ.YdcudDPznWgQ7QB4UIEFdEr1wfMNm_7mQnhFVeYTPvw'
```

### 9.2 상태별 상세 정보 응답 예시

```json
{
  "status": 200,
  "message": "내 스터디/프로젝트 상태별 상세 정보 조회가 성공했습니다.",
  "data": {
    "activeStudies": [
      {
        "studyProjectId": 14,
        "studyProjectName": "AI 스터디",
        "studyProjectTitle": "머신러닝 기초",
        "studyProjectDesc": "AI와 머신러닝의 기초를 배우는 스터디",
        "studyLevel": 2,
        "typeCheck": "study",
        "userId": "user123",
        "isRecruiting": "recruitment",
        "studyProjectStart": "2025-01-01T00:00:00",
        "studyProjectEnd": "2025-03-31T23:59:59",
        "studyProjectTotal": 10,
        "soltStart": "2025-01-01T09:00:00",
        "soltEnd": "2025-01-01T18:00:00",
        "curText": "AI 스터디입니다.",
        "tagNames": ["AI", "머신러닝", "파이썬"],
        "availableDays": [1, 3, 5],
        "currentMemberCount": 5,
        "members": [
          {
            "memberId": 1,
            "userId": "user123",
            "nick": "김철수",
            "memberType": "leader",
            "memberStatus": "approved",
            "joinedAt": "2025-01-01T00:00:00"
          }
        ],
        "userParticipationStatus": "참여중",
        "applicationStatus": null,
        "applicationDate": null
      }
    ],
    "pendingStudies": [
      {
        "studyProjectId": 15,
        "studyProjectName": "웹 개발 스터디",
        "studyProjectTitle": "React + Spring Boot",
        "studyProjectDesc": "풀스택 웹 개발 학습",
        "studyLevel": 2,
        "typeCheck": "study",
        "userId": "user456",
        "isRecruiting": "recruitment",
        "studyProjectStart": "2025-02-01T00:00:00",
        "studyProjectEnd": "2025-04-01T23:59:59",
        "studyProjectTotal": 8,
        "soltStart": "2025-02-01T09:00:00",
        "soltEnd": "2025-02-01T18:00:00",
        "curText": "웹 개발 스터디입니다.",
        "tagNames": ["React", "Spring Boot", "웹 개발"],
        "availableDays": [2, 4, 6],
        "currentMemberCount": 3,
        "members": [
          {
            "memberId": 2,
            "userId": "user456",
            "nick": "개발자",
            "memberType": "leader",
            "memberStatus": "approved",
            "joinedAt": "2025-02-01T00:00:00"
          }
        ],
        "userParticipationStatus": "신청중",
        "applicationStatus": "PENDING",
        "applicationDate": "2025-01-25T10:30:00"
      }
    ],
    "completedStudies": [
      {
        "studyProjectId": 16,
        "studyProjectName": "Java 기초 스터디",
        "studyProjectTitle": "Java 프로그래밍 기초",
        "studyProjectDesc": "Java 언어의 기초를 배우는 스터디",
        "studyLevel": 1,
        "typeCheck": "study",
        "userId": "user789",
        "isRecruiting": "end",
        "studyProjectStart": "2024-09-01T00:00:00",
        "studyProjectEnd": "2024-12-31T23:59:59",
        "studyProjectTotal": 6,
        "soltStart": "2024-09-01T09:00:00",
        "soltEnd": "2024-09-01T18:00:00",
        "curText": "Java 기초 스터디입니다.",
        "tagNames": ["Java", "프로그래밍"],
        "availableDays": [1, 3, 5],
        "currentMemberCount": 6,
        "members": [
          {
            "memberId": 3,
            "userId": "user789",
            "nick": "자바맨",
            "memberType": "leader",
            "memberStatus": "approved",
            "joinedAt": "2024-09-01T00:00:00"
          }
        ],
        "userParticipationStatus": "참여중",
        "applicationStatus": null,
        "applicationDate": null
      }
    ],
    "completedAppliedStudies": [
      {
        "studyProjectId": 17,
        "studyProjectName": "데이터베이스 스터디",
        "studyProjectTitle": "SQL과 데이터베이스 설계",
        "studyProjectDesc": "데이터베이스 설계와 SQL 쿼리 작성법 학습",
        "studyLevel": 2,
        "typeCheck": "study",
        "userId": "user999",
        "isRecruiting": "end",
        "studyProjectStart": "2024-08-01T00:00:00",
        "studyProjectEnd": "2024-11-30T23:59:59",
        "studyProjectTotal": 7,
        "soltStart": "2024-08-01T09:00:00",
        "soltEnd": "2024-08-01T18:00:00",
        "curText": "데이터베이스 스터디입니다.",
        "tagNames": ["SQL", "데이터베이스", "설계"],
        "availableDays": [2, 4, 6],
        "currentMemberCount": 7,
        "members": [
          {
            "memberId": 4,
            "userId": "user999",
            "nick": "DB마스터",
            "memberType": "leader",
            "memberStatus": "approved",
            "joinedAt": "2024-08-01T00:00:00"
          }
        ],
        "userParticipationStatus": "신청중",
        "applicationStatus": "PENDING",
        "applicationDate": "2024-07-25T14:20:00"
      }
    ],
    "activeCount": 1,
    "pendingCount": 1,
    "completedCount": 1,
    "completedAppliedCount": 1,
    "totalCount": 4
  }
}
```

**응답 구조 설명:**
- `activeStudies`: 참여중인 활성 스터디/프로젝트 목록 (진행중)
- `pendingStudies`: 승인대기중인 스터디/프로젝트 목록
- `completedStudies`: 종료된 스터디/프로젝트 목록 (참여했던 것들)
- `completedAppliedStudies`: 종료된 스터디/프로젝트 목록 (신청했던 것들)
- `activeCount`: 활성 스터디/프로젝트 수
- `pendingCount`: 승인대기중인 스터디/프로젝트 수
- `completedCount`: 종료된 스터디/프로젝트 수 (참여했던 것들)
- `completedAppliedCount`: 종료된 스터디/프로젝트 수 (신청했던 것들)
- `totalCount`: 전체 스터디/프로젝트 수

**스터디 상태 구분 기준:**
- **활성 (Active)**: 종료일이 현재 시간보다 이후이고, 모집 상태가 'end'가 아닌 경우
- **모집완료 (Recruitment Completed)**: 모집 상태가 'complete'인 경우 (진행중이지만 모집 종료)
- **종료 (Completed)**: 종료일이 현재 시간보다 이전이거나, 모집 상태가 'end'인 경우
- **승인대기 (Pending)**: 신청 상태가 'PENDING'인 경우

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
   - `/studies-projects/my-status-details`: 내 스터디/프로젝트 상태별 상세 정보 조회 (새로 추가됨)

6. **데이터베이스 확인**: 테스트 후 데이터베이스에서 과제가 올바르게 생성되었는지 확인하세요.

## 9. AI 과제 생성 테스트

### 9.1 AI 과제 생성 (Python 스크립트)

```bash
# 일반 과제 생성
python generate_ai_assignment.py 14 1

# 프로젝트 기반 과제 생성
python generate_ai_assignment.py 14 1 project

# 퀴즈 형태 과제 생성
python generate_ai_assignment.py 14 1 quiz

# 복습 과제 생성
python generate_ai_assignment.py 14 1 review
```

### 9.2 AI 과제 생성 후 확인

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

### 9.3 AI 과제 생성 로직 설명

**고려되는 스터디 정보:**
1. **태그 정보**: `interest` 테이블의 태그명을 기반으로 과제 내용 구성
2. **커리큘럼**: `study_project.cur_text` 필드의 내용을 반영한 과제 설계
3. **스터디 레벨**: 레벨(1-3)에 맞는 적절한 난이도 설정
4. **멤버 수**: 팀워크와 협업을 고려한 과제 설계
5. **기간**: 스터디 기간에 맞는 과제 계획

**생성되는 과제 구조:**
- 제목, 설명, 학습 목표, 요구사항
- 제출 형식, 평가 기준, 예상 소요 시간
- 난이도, 관련 태그, 추가 자료

**자동 설정:**
- 마감일: 생성일로부터 7일 후 (기본값)
- 과제 생성자: `member_id`로 지정된 사용자
- 전체 과제 데이터: `file_url` 필드에 JSON 형태로 저장

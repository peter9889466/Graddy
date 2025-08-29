# AI 과제 피드백 시스템 (Java Spring Boot)

## �� 개요

AI 과제 피드백 시스템은 **과제 제출 시 자동으로 AI 피드백을 생성**하는 시스템입니다. 사용자가 과제를 제출하면 즉시 OpenAI GPT를 활용한 지능형 피드백이 자동으로 생성되어 데이터베이스에 저장됩니다.

## 🏗️ 시스템 구조

### 1. 핵심 컴포넌트

-   **`SubmissionController`**: 과제 제출 API 엔드포인트
-   **`SubmissionService`**: 과제 제출 및 자동 AI 피드백 생성 비즈니스 로직
-   **`FeedbackController`**: 피드백 관리 API 엔드포인트
-   **`FeedbackService`**: AI 피드백 생성 및 관리 비즈니스 로직
-   **`SubmissionRepository`**: 과제 제출 데이터 접근 계층
-   **`FeedbackRepository`**: 피드백 데이터 접근 계층
-   **`AssignmentRepository`**: 과제 데이터 접근 계층

### 2. 데이터베이스 테이블

#### `feedbacks` 테이블

```sql
CREATE TABLE feedbacks (
    feed_id BIGINT AUTO_INCREMENT PRIMARY KEY, -- 피드백 고유 ID
    member_id BIGINT NOT NULL, -- 유저 ID
    submission_id BIGINT NOT NULL, -- 과제 제출 ID
    score INT NOT NULL, -- 피드백 점수(-5 ~ 10 점수) (시작 점수 : 100점)
    comment TEXT NOT NULL, -- 피드백 코멘트
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL -- 생성 일시
);
```

#### `submissions` 테이블

```sql
CREATE TABLE submissions (
    submission_id BIGINT AUTO_INCREMENT PRIMARY KEY, -- 과제 제출 고유 ID
    assignment_id BIGINT NOT NULL, -- 과제 ID
    member_id BIGINT NOT NULL, -- 제출자 ID
    content TEXT NOT NULL, -- 과제 제출 내용
    file_url TEXT, -- 첨부 파일 경로
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL -- 제출 일시
);
```

## 🚀 주요 기능

### 1. **자동 AI 피드백 생성** ⭐

-   **과제 제출 시 자동 실행**: `POST /submissions/submit` 호출 시 자동으로 AI 피드백 생성
-   **비동기 처리**: 피드백 생성이 제출 응답을 지연시키지 않음
-   **중복 방지**: 이미 피드백이 있는 제출은 건너뜀
-   **실패 안전성**: AI 피드백 생성 실패 시에도 과제 제출은 정상 처리

### 2. **과제 제출 관리**

-   **과제 제출**: `POST /submissions/submit`
-   **제출 목록 조회**: 과제별, 멤버별 제출 조회
-   **제출 상세 조회**: 특정 과제의 특정 멤버 제출 조회
-   **제출 수 통계**: 과제별 제출 수 조회

### 3. **AI 피드백 관리**

-   **자동 생성**: 과제 제출 시 자동으로 모든 제출에 대해 피드백 생성
-   **수동 생성**: `POST /feedbacks/generate`로 필요시 수동 생성
-   **피드백 조회**: 제출별, 멤버별 피드백 조회
-   **평균 점수**: 제출별 평균 점수 조회

### 4. **평가 기준**

-   **내용의 완성도** (0-10점)
-   **창의성과 독창성** (0-10점)
-   **논리적 구조** (0-10점)
-   **기술적 정확성** (0-10점)
-   **표현력과 가독성** (0-10점)
-   **최종 점수**: -5 ~ 10점 범위

## 📡 API 엔드포인트

### 1. **과제 제출 (자동 AI 피드백 포함)** ⭐

```http
POST /submissions/submit
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "assignmentId": 13,
  "memberId": 1,
  "content": "과제 제출 내용입니다...",
  "fileUrl": "https://example.com/file.pdf"
}
```

**응답 예시:**

```json
{
    "status": 200,
    "message": "과제가 성공적으로 제출되었습니다. AI 피드백이 자동으로 생성됩니다.",
    "data": {
        "submissionId": 1,
        "assignmentId": 13,
        "memberId": 1,
        "content": "과제 제출 내용입니다...",
        "fileUrl": "https://example.com/file.pdf",
        "createdAt": "2025-08-25T13:30:00.000+00:00"
    }
}
```

### 2. **제출 관리 API**

```http
# 과제별 제출 목록
GET /submissions/assignment/13

# 멤버별 제출 목록
GET /submissions/member/1

# 특정 제출 조회
GET /submissions/assignment/13/member/1

# 과제별 제출 수
GET /submissions/assignment/13/count
```

### 3. **AI 피드백 관리 API**

```http
# 수동 AI 피드백 생성
POST /feedbacks/generate
{
  "assignmentId": 13
}

# 제출별 피드백 목록
GET /feedbacks/submission/1

# 멤버별 피드백 목록
GET /feedbacks/member/1

# 특정 피드백 조회
GET /feedbacks/submission/1/member/1

# 평균 점수 조회
GET /feedbacks/submission/1/average-score
```

## 🔄 동작 흐름

### 1. **과제 제출 시 자동 AI 피드백 생성** ⭐

```
1. 사용자가 POST /submissions/submit 호출
   ↓
2. 과제 제출 정보를 데이터베이스에 저장
   ↓
3. 응답 즉시 반환 (사용자 대기 없음)
   ↓
4. 백그라운드에서 AI 피드백 자동 생성 시작
   ↓
5. 해당 과제의 모든 제출에 대해 AI 피드백 생성
   ↓
6. 피드백을 데이터베이스에 저장
   ↓
7. 로그에 완료 상태 기록
```

### 2. **AI 피드백 생성 로직**

```java
// 1. 과제 정보 조회
Assignment assignment = assignmentRepository.findById(assignmentId);

// 2. 해당 과제의 모든 제출 조회
List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);

// 3. 각 제출에 대해 AI 피드백 생성 (중복 방지)
for (Submission submission : submissions) {
    if (!feedbackExists(submission)) {
        Map<String, Object> aiFeedback = generateAiFeedback(assignment, submission);
        saveFeedback(submission, aiFeedback);
    }
}
```

### 3. **비동기 처리**

```java
// 별도 스레드에서 AI 피드백 생성
new Thread(() -> {
    try {
        feedbackService.generateFeedback(feedbackRequest);
    } catch (Exception e) {
        log.error("AI 피드백 생성 실패", e);
    }
}).start();
```

## ⚙️ 설정

### 1. FastAPI 서버 URL 설정

```properties
# application.properties
fastapi.server.url=http://localhost:8000
```

### 2. OpenAI API 설정

FastAPI 서버에서 관리되므로 Java 애플리케이션에서는 별도 설정 불필요

## 🧪 테스트 시나리오

### 1. **정상 케이스**

-   **과제 제출**: 과제 제출 시 자동으로 AI 피드백 생성
-   **여러 제출**: 한 과제에 여러 제출이 있는 경우 모든 제출에 대해 피드백 생성
-   **AI 서버 정상**: GPT 피드백 정상 생성 및 저장

### 2. **예외 케이스**

-   **존재하지 않는 과제**: 400 Bad Request
-   **제출이 없는 과제**: 400 Bad Request
-   **AI 서버 오류**: 기본 피드백으로 대체, 과제 제출은 정상 처리
-   **중복 피드백**: 이미 피드백이 있는 제출은 건너뜀

### 3. **성능 테스트**

-   **동시 제출**: 여러 사용자가 동시에 과제 제출
-   **대용량 제출**: 많은 제출이 있는 과제에 대한 피드백 생성
-   **응답 시간**: 과제 제출 응답 시간 (AI 피드백 생성과 무관)

## 🔒 보안

-   **JWT 인증**: Bearer 토큰 기반 인증
-   **권한 검증**: 과제 접근 권한 확인
-   **입력 검증**: 과제 ID, 멤버 ID 유효성 검사
-   **중복 방지**: 동일한 제출에 대한 중복 피드백 생성 방지

## 📊 모니터링

### 1. 로그 레벨

-   **INFO**: 과제 제출 시작/완료, AI 피드백 자동 생성 시작/완료
-   **WARN**: AI 피드백 생성 실패, 중복 피드백 건너뛰기
-   **ERROR**: 시스템 오류, 예외 상황

### 2. 성능 지표

-   **과제 제출 응답 시간**: AI 피드백 생성과 무관한 순수 제출 처리 시간
-   **AI 피드백 생성 시간**: 백그라운드에서의 피드백 생성 시간
-   **동시 처리 성능**: 여러 제출에 대한 동시 피드백 생성 성능

## 🚀 향후 개선 사항

### 1. 기능 개선

-   **실시간 피드백**: WebSocket을 통한 실시간 피드백 알림
-   **피드백 히스토리**: 피드백 수정 이력 관리
-   **점수 가중치**: 평가 기준별 가중치 설정
-   **피드백 템플릿**: 과제 유형별 맞춤형 피드백 템플릿

### 2. 성능 개선

-   **스레드 풀**: 별도 스레드 대신 스레드 풀 사용
-   **배치 처리**: 대량 피드백 생성 시 배치 처리 최적화
-   **캐싱**: 자주 사용되는 과제/제출 정보 캐싱
-   **비동기 큐**: 메시지 큐를 통한 비동기 처리

### 3. AI 모델 개선

-   **모델 선택**: 다양한 AI 모델 지원
-   **커스텀 프롬프트**: 과제 유형별 맞춤형 프롬프트
-   **학습 데이터**: 피드백 품질 향상을 위한 학습 데이터 수집

## 📝 사용 예시

### 1. cURL을 사용한 테스트

```bash
# 과제 제출 (자동 AI 피드백 생성)
curl -X POST "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/submissions/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "assignmentId": 13,
    "memberId": 1,
    "content": "과제 제출 내용입니다...",
    "fileUrl": "https://example.com/file.pdf"
  }'

# 제출 목록 조회
curl -X GET "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/submissions/assignment/13" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 피드백 목록 조회
curl -X GET "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/feedbacks/submission/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. JavaScript/Fetch를 사용한 테스트

```javascript
// 과제 제출 (자동 AI 피드백 생성)
const response = await fetch("/submissions/submit", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwtToken,
    },
    body: JSON.stringify({
        assignmentId: 13,
        memberId: 1,
        content: "과제 제출 내용입니다...",
        fileUrl: "https://example.com/file.pdf",
    }),
});

const result = await response.json();
console.log("과제 제출 결과:", result);
// AI 피드백이 백그라운드에서 자동으로 생성됩니다!
```

## 🎉 결론

**과제 제출 시 자동 AI 피드백 생성 시스템**이 완성되었습니다!

### **핵심 장점:**

1. **완전 자동화**: 과제 제출 시 자동으로 AI 피드백 생성
2. **사용자 경험**: 제출 응답 지연 없음 (비동기 처리)
3. **안전성**: AI 피드백 생성 실패 시에도 과제 제출은 정상 처리
4. **중복 방지**: 이미 피드백이 있는 제출은 건너뜀
5. **확장성**: 여러 제출에 대한 배치 피드백 생성

이제 사용자가 과제를 제출하면 즉시 응답을 받고, 백그라운드에서 AI가 자동으로 피드백을 생성하여 데이터베이스에 저장됩니다! 🚀✨

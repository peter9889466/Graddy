# 🚀 **AI 커리큘럼 생성 API 문서**

## 📋 **개요**

AI 커리큘럼 생성 API는 OpenAI GPT를 활용하여 스터디/프로젝트에 맞는 맞춤형 커리큘럼을 자동으로 생성하는 시스템입니다.

## 🏗️ **시스템 아키텍처**

```
Spring Boot (Java) ←→ FastAPI (Python) ←→ OpenAI GPT
     (Backend)           (AI Server)      (AI Model)
```

## 🔗 **API 엔드포인트**

### **1. AI 커리큘럼 생성**

#### **POST** `/api/ai-curriculum/generate/{studyProjectId}`

**설명**: OpenAI GPT를 활용하여 스터디/프로젝트 커리큘럼을 자동 생성합니다.

**경로 변수**:

-   `studyProjectId` (Long): 커리큘럼을 생성할 스터디/프로젝트의 ID

**응답 형식**:

```json
{
    "status": 200,
    "message": "AI 커리큘럼이 성공적으로 생성되었습니다.",
    "data": {
        "studyId": 1,
        "curriculum": "# 웹개발 스터디 커리큘럼\n\n## 1주차\n- **학습 목표:** HTML/CSS 기초\n- **주요 내용:** HTML 구조, CSS 스타일링\n- **실습 과제:** 개인 포트폴리오 페이지 제작",
        "message": "AI 커리큘럼이 성공적으로 생성되었습니다.",
        "success": true
    }
}
```

**상태 코드**:

-   `200`: 커리큘럼 생성 성공
-   `400`: 잘못된 요청 (스터디/프로젝트 ID 오류)
-   `500`: 서버 내부 오류 (AI 서버 연결 실패)

### **2. AI 서버 상태 확인**

#### **GET** `/api/ai-curriculum/health`

**설명**: FastAPI 기반 AI 커리큘럼 생성 서버의 상태를 확인합니다.

**응답 형식**:

```json
{
    "status": 200,
    "message": "AI 서버가 정상적으로 동작하고 있습니다.",
    "data": "healthy"
}
```

**상태 코드**:

-   `200`: AI 서버 정상 동작
-   `503`: AI 서버 연결 실패

## 📊 **데이터 모델**

### **AICurriculumResponse**

| 필드         | 타입    | 설명                                      | 예시                                       |
| ------------ | ------- | ----------------------------------------- | ------------------------------------------ |
| `studyId`    | Long    | 스터디/프로젝트 ID                        | 1                                          |
| `curriculum` | String  | AI가 생성한 커리큘럼 내용 (마크다운 형식) | "# 웹개발 스터디 커리큘럼..."              |
| `message`    | String  | 응답 메시지                               | "AI 커리큘럼이 성공적으로 생성되었습니다." |
| `success`    | boolean | 커리큘럼 생성 성공 여부                   | true                                       |

### **AICurriculumRequest**

| 필드           | 타입         | 설명                                             | 예시                                    |
| -------------- | ------------ | ------------------------------------------------ | --------------------------------------- |
| `studyId`      | Long         | 스터디/프로젝트 ID                               | 1                                       |
| `studyName`    | String       | 스터디/프로젝트 이름                             | "웹개발 스터디"                         |
| `studyTitle`   | String       | 스터디/프로젝트 제목                             | "React와 Spring Boot로 풀스택 개발하기" |
| `studyDesc`    | String       | 스터디/프로젝트 설명                             | "풀스택 웹 개발을 배우는 스터디입니다." |
| `studyLevel`   | Integer      | 스터디/프로젝트 레벨 (1: 초급, 2: 중급, 3: 고급) | 2                                       |
| `interestTags` | List<String> | 관심 분야 태그 목록                              | ["React", "Spring Boot", "웹개발"]      |
| `studyStart`   | String       | 스터디/프로젝트 시작일 (YYYY-MM-DD)              | "2024-01-01"                            |
| `studyEnd`     | String       | 스터디/프로젝트 종료일 (YYYY-MM-DD)              | "2024-03-31"                            |

## 🔧 **사용 방법**

### **1. 기본 사용법**

```bash
# AI 커리큘럼 생성
curl -X POST "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/ai-curriculum/generate/1"

# AI 서버 상태 확인
curl -X GET "http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/api/ai-curriculum/health"
```

### **2. Spring Boot 애플리케이션에서 사용**

```java
@Autowired
private AICurriculumService aiCurriculumService;

// 커리큘럼 생성
AICurriculumResponse response = aiCurriculumService.generateCurriculum(1L);

if (response.isSuccess()) {
    System.out.println("생성된 커리큘럼: " + response.getCurriculum());
} else {
    System.out.println("오류: " + response.getMessage());
}
```

## ⚠️ **주의사항**

### **1. 사전 요구사항**

-   FastAPI AI 서버가 실행 중이어야 함 (포트 8000)
-   OpenAI API 키가 설정되어 있어야 함
-   스터디/프로젝트 ID가 유효해야 함

### **2. 제한사항**

-   커리큘럼 생성에는 OpenAI API 호출 비용이 발생할 수 있음
-   AI 서버 응답 시간은 네트워크 상태와 OpenAI API 응답 속도에 따라 달라짐
-   한 번에 하나의 커리큘럼만 생성 가능

### **3. 에러 처리**

-   AI 서버 연결 실패 시 적절한 에러 메시지 반환
-   OpenAI API 오류 시 상세한 오류 정보 제공
-   네트워크 타임아웃 시 재시도 로직 구현 권장

## 🚀 **성능 최적화**

### **1. 캐싱 전략**

-   동일한 스터디/프로젝트에 대한 커리큘럼 재생성 방지
-   생성된 커리큘럼을 데이터베이스에 저장하여 재사용

### **2. 비동기 처리**

-   대용량 커리큘럼 생성 시 비동기 처리 고려
-   웹훅을 통한 완료 알림 기능

### **3. 배치 처리**

-   여러 스터디/프로젝트의 커리큘럼을 일괄 생성
-   리소스 효율성을 위한 큐 시스템 활용

## 🔍 **문제 해결**

### **1. 일반적인 문제**

#### **AI 서버 연결 실패**

```bash
# AI 서버 상태 확인
curl http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com/health

# 포트 확인
netstat -an | findstr :8000
```

#### **OpenAI API 오류**

```bash
# .env 파일 확인
cat scripts/.env

# API 키 유효성 검증
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.openai.com/v1/models
```

### **2. 로그 확인**

```bash
# Spring Boot 로그
tail -f logs/spring.log

# FastAPI 로그
tail -f logs/fastapi.log
```

## 📚 **추가 리소스**

-   [OpenAI API 문서](https://platform.openai.com/docs)
-   [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
-   [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
-   [Swagger/OpenAPI 3.0 명세](https://swagger.io/specification/)

## 📞 **지원**

문제가 발생하거나 질문이 있으시면 개발팀에 문의하세요.

-   **이메일**: graddy@example.com
-   **GitHub**: https://github.com/graddy
-   **문서**: https://github.com/graddy/ai-curriculum-guide

---

**버전**: 1.0.0  
**최종 업데이트**: 2024-01-01  
**작성자**: Graddy Team

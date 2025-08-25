# AI 커리큘럼 생성 시스템

OpenAI GPT를 활용하여 스터디/프로젝트 커리큘럼을 자동 생성하는 FastAPI 기반 시스템입니다.

## 🏗️ **시스템 구조**

```
Spring Boot (Java) ←→ FastAPI (Python) ←→ OpenAI GPT
     (Backend)           (AI Server)      (AI Model)
```

## 🚀 **빠른 시작**

### **1. FastAPI 서버 실행**

#### **Windows**
```bash
cd Graddy_back/scripts
start_fastapi.bat
```

#### **Linux/Mac**
```bash
cd Graddy_back/scripts
chmod +x start_fastapi.sh
./start_fastapi.sh
```

#### **수동 실행**
```bash
cd Graddy_back/scripts
pip install -r requirements.txt
python main.py
```

### **2. Spring Boot 애플리케이션 실행**
```bash
cd Graddy_back
./gradlew bootRun
```

## 📋 **API 엔드포인트**

### **FastAPI 서버 (포트: 8000)**

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET | `/` | 서버 상태 확인 |
| GET | `/health` | 헬스 체크 |
| POST | `/generate-curriculum` | AI 커리큘럼 생성 |
| GET | `/models` | 사용 가능한 OpenAI 모델 목록 |

### **Spring Boot (포트: 8080)**

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| POST | `/api/ai-curriculum/generate/{studyProjectId}` | AI 커리큘럼 생성 요청 |
| GET | `/api/ai-curriculum/health` | AI 서버 상태 확인 |

## 🔧 **설정**

### **1. 환경 변수 설정**

`.env` 파일을 `scripts` 폴더에 생성하고 OpenAI API 키를 설정하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### **2. Spring Boot 설정**

`application.properties`에서 AI API URL을 설정할 수 있습니다:

```properties
ai.curriculum.api.url=http://localhost:8000
```

## 📊 **사용법**

### **1. AI 커리큘럼 생성**

#### **FastAPI 직접 호출**
```bash
curl -X POST "http://localhost:8000/generate-curriculum" \
  -H "Content-Type: application/json" \
  -d '{
    "study_project_id": 1,
    "study_project_name": "웹개발 스터디",
    "study_project_title": "React와 Spring Boot로 풀스택 개발하기",
    "study_project_desc": "풀스택 웹 개발을 배우는 스터디입니다.",
    "study_level": 2,
    "interest_tags": ["React", "Spring Boot", "웹개발"],
    "study_project_start": "2024-01-01",
    "study_project_end": "2024-03-31",
    "type_check": "study"
  }'
```

#### **Spring Boot를 통한 호출**
```bash
curl -X POST "http://localhost:8080/api/ai-curriculum/generate/1"
```

### **2. 서버 상태 확인**

```bash
# FastAPI 서버 상태
curl http://localhost:8000/health

# Spring Boot에서 AI 서버 상태 확인
curl http://localhost:8080/api/ai-curriculum/health
```

## 🛠️ **개발 환경**

### **필요한 패키지**
- Python 3.8+
- FastAPI
- Uvicorn
- OpenAI
- Python-dotenv
- Pydantic

### **설치**
```bash
pip install -r requirements.txt
```

## 🔍 **문제 해결**

### **1. FastAPI 서버 연결 오류**
- FastAPI 서버가 실행 중인지 확인
- 포트 8000이 사용 가능한지 확인
- 방화벽 설정 확인

### **2. OpenAI API 오류**
- `.env` 파일에 API 키가 올바르게 설정되었는지 확인
- API 키의 유효성 확인
- OpenAI 계정의 크레딧 확인

### **3. Spring Boot 연동 오류**
- `application.properties`의 AI API URL 설정 확인
- 네트워크 연결 상태 확인

## 📝 **주요 기능**

1. **자동 커리큘럼 생성**: OpenAI GPT를 활용한 지능형 커리큘럼 생성
2. **레벨별 맞춤형**: 초급/중급/고급 레벨에 따른 적절한 난이도 설정
3. **태그 기반 맞춤화**: 관심 분야 태그를 반영한 맞춤형 커리큘럼
4. **자동 저장**: 생성된 커리큘럼을 데이터베이스에 자동 저장
5. **상태 모니터링**: 서버 상태 및 연결 상태 실시간 확인

## 🔮 **향후 계획**

- [ ] GPT-4 모델 지원
- [ ] 다국어 지원
- [ ] 커리큘럼 템플릿 시스템
- [ ] 사용자 피드백 기반 학습
- [ ] 성능 최적화

## 📞 **지원**

문제가 발생하거나 질문이 있으시면 개발팀에 문의하세요.

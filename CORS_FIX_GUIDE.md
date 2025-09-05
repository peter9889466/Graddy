# CORS 문제 해결 가이드

## 🔍 문제 분석
```
Access to fetch at 'http://localhost:8080/api/files/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

이는 브라우저의 **Same-Origin Policy**로 인한 CORS (Cross-Origin Resource Sharing) 문제입니다.

## ✅ 해결방법 적용

### 1. **백엔드 CORS 설정 추가**
- `FileConfig.java`에 `addCorsMappings()` 메서드 추가
- `FileController.java`에 `@CrossOrigin` 어노테이션 추가
- 허용 오리진: `http://localhost:5173` (Vite), `http://localhost:3000` (React)

### 2. **프론트엔드 로직 개선**
- CORS 에러 발생 가능한 HEAD 요청 제거
- 직접 `window.open()`으로 새 창에서 파일 열기
- 팝업 차단 및 오류 상황 대응

## 🚀 해결 확인 방법

### 1. **백엔드 재시작 (필수)**
```bash
cd Graddy_back
./gradlew bootRun
```

### 2. **CORS 설정 확인**
백엔드 콘솔에서 다음 로그 확인:
```
🔧 [DEBUG] CORS 설정 시작
✅ [DEBUG] CORS 설정 완료 - 파일 업로드/다운로드 크로스 오리진 허용
```

### 3. **첨부파일 테스트**
1. 과제 피드백 페이지 접속
2. 첨부파일이 있는 과제 선택
3. "📎 첨부파일 보기" 버튼 클릭
4. 브라우저 개발자 도구 콘솔 확인:

#### 성공 케이스:
```
💽 [DEBUG] 로컬 서버 파일 감지
🔗 [DEBUG] 최종 로컬 URL: http://localhost:8080/api/files/assignments/...
🌐 [DEBUG] 백엔드 CORS 설정 적용 - 직접 새 창에서 열기
✅ [DEBUG] 새 창에서 파일 열기 성공
```

#### 실패 시 대응:
- 팝업 차단 확인
- 브라우저 새로고침
- 백엔드 재시작 확인

## 🔧 추가 디버깅

### 1. **브라우저 네트워크 탭 확인**
- OPTIONS 요청 응답 헤더에 `Access-Control-Allow-Origin` 포함 여부
- GET 요청이 200 상태로 성공하는지 확인

### 2. **백엔드 로그 확인**
```bash
# CORS 관련 로그 확인
tail -f logs/spring.log | grep CORS

# 파일 접근 로그 확인  
tail -f logs/spring.log | grep "files/"
```

### 3. **수동 테스트**
브라우저에서 직접 접근:
```
http://localhost:8080/api/files/assignments/파일명
```

## 🛠️ 추가 해결방안

### 방법 1: 프록시 설정 (Vite)
`vite.config.ts`에 프록시 추가:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

### 방법 2: 환경별 설정
- 개발환경: CORS 설정으로 해결
- 운영환경: 같은 도메인 사용으로 CORS 문제 자체 제거

## 📝 주요 변경사항

1. **FileConfig.java**: CORS 매핑 추가
2. **FileController.java**: @CrossOrigin 어노테이션 추가  
3. **FeedBack.tsx**: HEAD 요청 제거, 직접 새 창 열기로 변경
4. **첨부파일 접근**: 더 안전하고 사용자 친화적인 방식으로 개선

이제 첨부파일 보기 기능이 CORS 문제 없이 정상 작동할 것입니다! 🎉

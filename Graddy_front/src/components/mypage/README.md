# 마이페이지 컴포넌트 API 연동 가이드

## 개요

마이페이지 관련 컴포넌트들이 백엔드 API와 연동되도록 수정되었습니다.

## 수정된 컴포넌트

### 1. IntroductionSection.tsx

-   **기능**: 사용자 소개글 조회 및 수정
-   **API 엔드포인트**:
    -   `PUT /api/users/me/introduction` - 소개글 수정
-   **주요 변경사항**:
    -   내부 상태 관리로 변경
    -   API 호출을 통한 소개글 저장
    -   로딩 상태 및 에러 처리 추가

### 2. MyStudyList.tsx

-   **기능**: 사용자가 참여한 스터디/프로젝트 목록 조회
-   **API 엔드포인트**:
    -   `GET /api/users/me/study-projects` - 스터디 목록 조회
-   **주요 변경사항**:
    -   실제 API 데이터로 목록 표시
    -   필터링 기능 (전체, 모집중, 진행중, 완료)
    -   로딩 상태 표시

### 3. ProfileEditForm.tsx

-   **기능**: 사용자 프로필 정보 수정
-   **API 엔드포인트**:
    -   `GET /api/users/me` - 프로필 조회
    -   `PUT /api/users/me` - 프로필 수정
-   **주요 변경사항**:
    -   프로필 데이터 자동 로드
    -   비밀번호 유효성 검사
    -   실시간 프로필 업데이트

### 4. ProfileSection.tsx

-   **기능**: 프로필 이미지, 점수, 관심분야, GitHub URL 관리
-   **API 엔드포인트**:
    -   `GET /api/users/me` - 프로필 조회
    -   `GET /api/scores/user/{userId}` - 점수 조회
    -   `GET /api/users/me/interests` - 관심분야 조회
    -   `POST /api/users/me/profile-image` - 프로필 이미지 업로드
    -   `PUT /api/users/me/github` - GitHub URL 수정
-   **주요 변경사항**:
    -   실제 데이터 로드 및 표시
    -   프로필 이미지 업로드 기능
    -   GitHub URL 수정 기능

### 5. InterestModal.tsx

-   **기능**: 관심분야 선택 및 수정
-   **API 엔드포인트**:
    -   `GET /api/interests` - 전체 관심분야 목록 조회
    -   `PUT /api/users/me/interests` - 사용자 관심분야 수정
-   **주요 변경사항**:
    -   백엔드에서 관심분야 데이터 로드
    -   관심분야 저장 기능
    -   로딩 및 저장 상태 표시

## 새로 추가된 서비스 파일

### api.ts

-   Axios 기본 설정
-   JWT 토큰 자동 추가
-   에러 처리 인터셉터

### userService.ts

-   사용자 관련 API 호출 함수들
-   타입 정의
-   에러 처리

### studyService.ts

-   스터디/프로젝트 관련 API 호출 함수들

## 사용 방법

### 1. 컴포넌트 사용 예시

```tsx
// 기존 방식 (props로 데이터 전달)
<IntroductionSection
  introduction={introduction}
  isEditingIntro={isEditingIntro}
  onEditIntro={handleEditIntro}
  // ... 기타 props
/>

// 새로운 방식 (내부에서 API 호출)
<IntroductionSection
  onIntroductionUpdate={(newIntro) => {
    // 소개글 업데이트 후 처리
    console.log('소개글이 업데이트되었습니다:', newIntro);
  }}
/>
```

### 2. 토큰 설정

```typescript
// 로그인 후 토큰 저장
localStorage.setItem("token", "your-jwt-token");
localStorage.setItem("userId", "user-id");
```

### 3. 에러 처리

모든 API 호출에는 try-catch 블록이 포함되어 있으며, 에러 발생 시 콘솔에 로그를 출력하고 사용자에게 알림을 표시합니다.

## 주의사항

1. **토큰 관리**: JWT 토큰이 localStorage에 저장되어 있어야 합니다.
2. **CORS 설정**: 백엔드에서 프론트엔드 도메인에 대한 CORS 설정이 필요합니다.
3. **API 엔드포인트**: 실제 백엔드 API 엔드포인트와 일치하는지 확인해야 합니다.
4. **에러 처리**: 네트워크 오류나 서버 오류에 대한 적절한 처리가 포함되어 있습니다.

## 백엔드 API 요구사항

다음 API 엔드포인트들이 구현되어 있어야 합니다:

-   `GET /api/users/me` - 현재 사용자 정보 조회
-   `PUT /api/users/me` - 사용자 정보 수정
-   `PUT /api/users/me/introduction` - 소개글 수정
-   `PUT /api/users/me/github` - GitHub URL 수정
-   `POST /api/users/me/profile-image` - 프로필 이미지 업로드
-   `GET /api/users/me/study-projects` - 사용자 스터디 목록 조회
-   `GET /api/users/me/interests` - 사용자 관심분야 조회
-   `PUT /api/users/me/interests` - 사용자 관심분야 수정
-   `GET /api/interests` - 전체 관심분야 목록 조회
-   `GET /api/scores/user/{userId}` - 사용자 점수 조회

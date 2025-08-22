# Graddy Frontend

Graddy는 스터디 그룹 매칭 및 커뮤니티 플랫폼의 애플리케이션입니다. React와 TypeScript를 기반으로 구축되었으며, 재사용 가능한 커스텀 훅과 컴포넌트를 활용한 모던 웹 애플리케이션입니다.

## 🛠 기술 스택

-   **Frontend Framework**: React 18 + TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **State Management**: Zustand
-   **Routing**: React Router DOM
-   **Testing**: Vitest + Testing Library
-   **Error Handling**: React Error Boundary

## 📁 프로젝트 구조

```
graddy_front/
├── public/                 # 정적 파일
│   ├── favicon.ico
│   ├── index.html
│   └── ...
├── src/
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   │   ├── modal/         # 모달 컴포넌트들
│   │   │   ├── DeleteModal.tsx
│   │   │   ├── LoginModal.tsx
│   │   │   └── SigninModal.tsx
│   │   ├── shared/        # 공통 컴포넌트
│   │   │   └── LoadingOverlay.tsx
│   │   └── ui/            # 기본 UI 컴포넌트
│   │       └── button.tsx
│   ├── error/             # 에러 처리 컴포넌트
│   │   ├── ErrorFallback.tsx
│   │   └── Page404.tsx
│   ├── hooks/             # 커스텀 훅
│   │   ├── useAutoComplete.ts    # 자동완성 기능
│   │   ├── useDropdown.ts        # 드롭다운 기능
│   │   ├── useModal.ts           # 모달 관리
│   │   ├── useOutsideClick.ts    # 외부 클릭 감지
│   │   └── useToggle.ts          # 토글 상태 관리
│   ├── lib/               # 외부 라이브러리 설정
│   │   └── utils.ts
│   ├── pages/             # 페이지 컴포넌트
│   │   ├── CommunityPage.tsx     # 커뮤니티 페이지
│   │   ├── Login.tsx             # 로그인 페이지
│   │   ├── MainPage.tsx          # 메인 페이지
│   │   ├── MyPage.tsx            # 마이페이지
│   │   ├── StudyCreate.tsx       # 스터디 생성 페이지
│   │   ├── StudyDetailPage.tsx   # 스터디 상세 페이지
│   │   └── StudySearchPage.tsx   # 스터디 검색 페이지
│   ├── services/          # API 서비스
│   │   ├── api.ts         # 기본 API 설정
│   │   └── studyApi.ts    # 스터디 관련 API
│   ├── contexts/          # React Context
│   │   ├── AuthContext.tsx       # 인증 컨텍스트
│   │   ├── AssignmentContext.tsx # 과제 컨텍스트
│   │   └── CommunityContext.tsx  # 커뮤니티 컨텍스트
│   └── utils/             # 유틸리티 함수
│       ├── eventLimiter.ts
│       └── keyPress.ts
```

## 🎯 주요 기능

### 커스텀 훅

-   **useAutoComplete**: 검색 자동완성 기능 (디바운스 적용)
-   **useDropdown**: 드롭다운 메뉴 관리 (스로틀링 적용)
-   **useModal**: 모달 상태 관리 및 키보드 이벤트 처리
-   **useOutsideClick**: 외부 클릭 감지 (스로틀링 적용)
-   **useToggle**: 불린 상태 토글 관리

### 성능 최적화

-   **디바운스**: 검색 입력 시 API 호출 최적화
-   **스로틀링**: 키보드 네비게이션 및 클릭 이벤트 최적화
-   **메모이제이션**: React.memo, useMemo, useCallback 활용

### 페이지 구성

-   **메인 페이지**: 스터디 그룹 소개 및 주요 기능 안내
-   **스터디 검색**: 조건별 스터디 그룹 검색 및 필터링
-   **스터디 상세**: 개별 스터디 그룹 정보 및 참여 기능
-   **커뮤니티**: 사용자 간 소통 공간
-   **프로필**: 사용자 정보 관리

## 🚀 시작하기

### 필수 요구사항

-   Node.js 18.0.0 이상
-   npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 테스트 실행
npm run test

# 타입 체크
npm run type-check
```

### 개발 서버

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

## 🧪 테스트

프로젝트는 Vitest와 Testing Library를 사용하여 테스트를 작성합니다.

```bash
# 테스트 실행
npm run test

# 테스트 커버리지 확인
npm run test:coverage

# 테스트 UI 실행
npm run test:ui
```

## 📝 코딩 컨벤션

-   **TypeScript**: 엄격한 타입 체크 적용
-   **ESLint**: 코드 품질 관리
-   **Prettier**: 코드 포맷팅 자동화
-   **Prop Getter 패턴**: 커스텀 훅에서 컴포넌트 props 관리
-   **Compound Component 패턴**: 복잡한 UI 컴포넌트 구조화

## 🔧 주요 라이브러리

-   `react-router-dom`: 클라이언트 사이드 라우팅
-   `zustand`: 경량 상태 관리
-   `tailwindcss`: 유틸리티 기반 CSS 프레임워크
-   `react-error-boundary`: 에러 경계 처리
-   `lucide-react`: 아이콘 라이브러리

## 🔌 API 사용법

### 스터디 프로젝트 생성 API

로그인한 사용자의 JWT 토큰을 헤더에 포함하여 스터디/프로젝트를 생성할 수 있습니다.

#### 기본 사용법

```typescript
import { StudyApiService, CreateStudyProjectRequest } from '../services/studyApi';

// 스터디 프로젝트 생성 요청 데이터
const studyProjectData: CreateStudyProjectRequest = {
    studyProjectName: "React 스터디",
    studyProjectTitle: "React와 TypeScript 기초 스터디",
    studyProjectDesc: "React와 TypeScript를 함께 배우는 기초 스터디입니다.",
    studyLevel: 2, // 1: 초급, 2: 중급, 3: 고급
    typeCheck: "study", // "study" 또는 "project"
    studyProjectStart: "2025-01-22T10:00:00.000Z", // ISO 8601 형식
    studyProjectEnd: "2025-02-21T10:00:00.000Z", // ISO 8601 형식
    studyProjectTotal: 8, // 최대 인원
    soltStart: "2025-01-22T19:00:00.000Z", // 시작 시간 (ISO 8601)
    soltEnd: "2025-01-22T21:00:00.000Z", // 종료 시간 (ISO 8601)
    interestIds: [1, 2, 3], // 관심사 ID 배열
    dayIds: ["2", "4", "6"] // 요일 ID 배열 (1: 월요일 ~ 7: 일요일)
};

// API 호출
try {
    const response = await StudyApiService.createStudyProject(studyProjectData);
    console.log('생성된 스터디 프로젝트:', response);
} catch (error) {
    console.error('스터디 프로젝트 생성 실패:', error);
}
```

#### 요청 데이터 타입

```typescript
interface CreateStudyProjectRequest {
    studyProjectName: string;        // 스터디/프로젝트 이름
    studyProjectTitle: string;       // 스터디/프로젝트 제목
    studyProjectDesc: string;        // 스터디/프로젝트 설명
    studyLevel: number;              // 난이도 (1: 초급, 2: 중급, 3: 고급)
    typeCheck: string;               // 타입 ("study" 또는 "project")
    userId?: string;                 // 사용자 ID (JWT 토큰에서 자동 추출)
    studyProjectStart: string;       // 시작 날짜 (ISO 8601)
    studyProjectEnd: string;         // 종료 날짜 (ISO 8601)
    studyProjectTotal: number;       // 최대 인원
    soltStart: string;               // 시작 시간 (ISO 8601)
    soltEnd: string;                 // 종료 시간 (ISO 8601)
    interestIds: number[];           // 관심사 ID 배열
    dayIds: string[];                // 요일 ID 배열
}
```

#### 인증

- JWT 토큰은 자동으로 `Authorization: Bearer {token}` 헤더에 포함됩니다.
- `userId`는 JWT 토큰에서 자동으로 추출되므로 선택적으로 전송할 수 있습니다.
- 토큰은 `localStorage`에서 `userToken` 키로 저장됩니다.

#### 에러 처리

```typescript
try {
    const response = await StudyApiService.createStudyProject(studyProjectData);
    // 성공 처리
} catch (error) {
    if (error instanceof Error) {
        console.error('API 오류:', error.message);
        // 사용자에게 오류 메시지 표시
    }
}
```

#### 사용 예시 컴포넌트

`src/components/examples/StudyCreationExample.tsx` 파일에서 실제 사용 예시를 확인할 수 있습니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

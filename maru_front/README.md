# MARU Frontend

MARU는 스터디 그룹 매칭 및 커뮤니티 플랫폼의 애플리케이션입니다. React와 TypeScript를 기반으로 구축되었으며, 재사용 가능한 커스텀 훅과 컴포넌트를 활용한 모던 웹 애플리케이션입니다.

## 🛠 기술 스택

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Testing**: Vitest + Testing Library
- **Error Handling**: React Error Boundary

## 📁 프로젝트 구조

```
maru_front/
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
│   │   ├── mainPage.tsx          # 메인 페이지
│   │   ├── ProfilePage.tsx       # 프로필 페이지
│   │   ├── StudyDetailPage.tsx   # 스터디 상세 페이지
│   │   ├── StudySearchPage.tsx   # 스터디 검색 페이지
│   │   ├── TestAutoComplete.tsx  # 자동완성 테스트 페이지
│   │   ├── TestDropdown.tsx      # 드롭다운 테스트 페이지
│   │   └── TestModal.tsx         # 모달 테스트 페이지
│   ├── utils/             # 유틸리티 함수
│   │   ├── eventLimiter.ts       # 이벤트 제한 (디바운스/스로틀링)
│   │   └── keyPress.ts           # 키보드 이벤트 처리
│   ├── App.tsx            # 메인 앱 컴포넌트
│   ├── App.css            # 앱 스타일
│   ├── index.tsx          # 앱 진입점
│   └── index.css          # 글로벌 스타일
├── components.json        # shadcn/ui 설정
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 주요 기능

### 커스텀 훅
- **useAutoComplete**: 검색 자동완성 기능 (디바운스 적용)
- **useDropdown**: 드롭다운 메뉴 관리 (스로틀링 적용)
- **useModal**: 모달 상태 관리 및 키보드 이벤트 처리
- **useOutsideClick**: 외부 클릭 감지 (스로틀링 적용)
- **useToggle**: 불린 상태 토글 관리

### 성능 최적화
- **디바운스**: 검색 입력 시 API 호출 최적화
- **스로틀링**: 키보드 네비게이션 및 클릭 이벤트 최적화
- **메모이제이션**: React.memo, useMemo, useCallback 활용

### 페이지 구성
- **메인 페이지**: 스터디 그룹 소개 및 주요 기능 안내
- **스터디 검색**: 조건별 스터디 그룹 검색 및 필터링
- **스터디 상세**: 개별 스터디 그룹 정보 및 참여 기능
- **커뮤니티**: 사용자 간 소통 공간
- **프로필**: 사용자 정보 관리

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

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

- **TypeScript**: 엄격한 타입 체크 적용
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅 자동화
- **Prop Getter 패턴**: 커스텀 훅에서 컴포넌트 props 관리
- **Compound Component 패턴**: 복잡한 UI 컴포넌트 구조화

## 🔧 주요 라이브러리

- `react-router-dom`: 클라이언트 사이드 라우팅
- `zustand`: 경량 상태 관리
- `tailwindcss`: 유틸리티 기반 CSS 프레임워크
- `react-error-boundary`: 에러 경계 처리
- `lucide-react`: 아이콘 라이브러리

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
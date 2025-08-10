# 모임 가계부 (Moim Money)

<!-- Vercel 배포 테스트: Git 연결 후 자동 배포 확인 -->

모임 단위로 수입/지출을 기록하고 관리할 수 있는 공동 가계부 서비스

## 🚀 기술 스택

- **Frontend**: React Native + TypeScript + Expo
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions, FCM)

## 📋 주요 기능

- 빠른 입력 UX (2-3탭 이내)
- 실시간 협업
- 달력 기반 월 요약
- 모임 관리 및 초대

## 🎯 MVP 목표

- **개발 기간**: 3주
- **핵심 기능**: 빠른 입력, 실시간 동기화, 모임 관리
- **타겟**: 한국 사용자 (KRW, ko-KR)

## 🛠️ 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# iOS 시뮬레이터 실행
npm run ios

# Android 에뮬레이터 실행
npm run android
```

## 📁 프로젝트 구조

```
moim_money/
├── 📁 docs/                    # 프로젝트 문서
│   ├── 📄 PRD.md
│   ├── 📄 mvp_backlog.md
│   ├── 📄 wireframes.md
│   ├── 📄 system_design.md
│   ├── 📄 firestore_schema.md
│   └── 📄 TechStackDecision.md
├── 📁 src/                     # 소스 코드
│   ├── 📁 components/          # 재사용 컴포넌트
│   ├── 📁 screens/            # 화면 컴포넌트
│   ├── 📁 navigation/          # 네비게이션
│   ├── 📁 services/            # API 서비스
│   ├── 📁 hooks/              # 커스텀 훅
│   ├── 📁 utils/              # 유틸리티 함수
│   ├── 📁 types/              # TypeScript 타입 정의
│   └── 📁 constants/          # 상수 정의
├── 📁 assets/                  # 이미지, 폰트 등
└── 📁 .cursor/                 # Cursor IDE 설정
```

## 📚 문서

- [PRD](./docs/PRD.md) - 제품 요구사항 문서
- [MVP 백로그](./docs/mvp_backlog.md) - 3주 개발 계획
- [와이어프레임](./docs/wireframes.md) - UI/UX 설계
- [기술 스택 결정](./docs/TechStackDecision.md) - 기술 선택 근거
- [시스템 설계](./docs/system_design.md) - 아키텍처 설계
- [Firestore 스키마](./docs/firestore_schema.md) - 데이터베이스 설계

## 📝 개발 규칙

- TypeScript 사용 필수
- 한국어 주석 사용
- 기능별 모듈화
- 실시간 동기화 고려
- 빠른 입력 UX 우선

## 🎯 성공 지표

### 기술적 지표
- 3주 내 MVP 완성
- 앱 시작 시간 < 3초
- 데이터 동기화 < 1초
- 크래시율 < 1%

### 사용자 경험 지표
- 2-3탭 입력 UX 구현
- 실시간 협업 기능
- 직관적인 UI/UX

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**모임 가계부** - 함께하는 재정 관리의 시작 🚀

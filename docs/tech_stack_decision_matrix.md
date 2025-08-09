# 모임 가계부 기술 스택 의사결정 매트릭스

## 프론트엔드 후보 비교

| 항목 | React Native (TypeScript + Expo) | Flutter (Dart) |
|------|----------------------------------|----------------|
| **장점** | • JavaScript/TypeScript 기반으로 웹 개발자 친화적<br>• Expo로 빠른 개발 및 배포<br>• 풍부한 생태계와 라이브러리<br>• Cursor AI와 TypeScript 지원 우수 | • 네이티브 성능에 근접<br>• Hot Reload로 빠른 개발<br>• 일관된 UI/UX (Material/Cupertino)<br>• Google 지원으로 안정성 높음 |
| **단점** | • 브리지 오버헤드로 성능 제한<br>• 네이티브 모듈 연동 시 Expo 제약<br>• 플랫폼별 차이점 대응 필요 | • Dart 언어 러닝커브<br>• 생태계가 React Native보다 작음<br>• 커스텀 네이티브 모듈 개발 복잡 |
| **러닝커브** | 낮음 (JavaScript/TypeScript 기반) | 중간 (Dart 언어 학습 필요) |
| **속도/성능(초기)** | 중간 (브리지 오버헤드) | 높음 (네이티브에 근접) |
| **실시간 동기화** | 우수 (WebSocket, Firebase 연동 쉬움) | 우수 (WebSocket, Firebase 연동 쉬움) |
| **오프라인** | 중간 (AsyncStorage, SQLite) | 우수 (Hive, SQLite) |
| **비용(월 1~3만 MAU)** | 낮음 (Expo 무료 플랜) | 낮음 (Flutter 무료) |
| **운영 난이도** | 낮음 (Expo 관리 서비스) | 중간 (수동 빌드 관리) |
| **한국 로컬라이징** | 우수 (i18n 라이브러리 풍부) | 우수 (Flutter 내장 i18n) |
| **커뮤니티/문서** | 매우 우수 (대규모 커뮤니티) | 우수 (Google 지원) |
| **MVP 적합도** | 9/10 | 8/10 |
| **Cursor AI 연동** | 매우 우수 (TypeScript 지원 우수) | 우수 (Dart 지원 있음) |

## 백엔드/DB 후보 비교

| 항목 | Firebase (Firestore) | Supabase (Postgres) | Appwrite (Postgres) | MongoDB Atlas (Realm Sync) |
|------|---------------------|---------------------|---------------------|----------------------------|
| **장점** | • Google 지원으로 안정성 높음<br>• 실시간 동기화 기본 제공<br>• 인증/푸시 통합 쉬움<br>• 서버리스로 운영 부담 적음 | • PostgreSQL 기반으로 SQL 친화적<br>• 실시간 구독 기능<br>• 오픈소스로 커스터마이징 가능<br>• 무료 플랜 관대 | • 개발자 친화적 API<br>• 실시간 기능 내장<br>• 인증/파일 관리 통합<br>• 오픈소스 | • MongoDB 기반으로 유연한 스키마<br>• Realm Sync로 오프라인 동기화<br>• 확장성 우수<br>• Atlas 관리 서비스 |
| **단점** | • NoSQL로 복잡한 쿼리 제한<br>• 비용 증가 시 급격한 상승<br>• 벤더 락인 위험<br>• 한국 서버 지역 제한 | • 초기 설정 복잡<br>• 실시간 성능 제한<br>• 한국 서버 지역 제한<br>• 팀 규모에 따른 비용 증가 | • 상대적으로 작은 커뮤니티<br>• 한국 서버 지역 제한<br>• 엔터프라이즈 기능 제한 | • NoSQL로 관계형 데이터 복잡<br>• Realm Sync 러닝커브<br>• 비용 증가 시 급격한 상승<br>• 한국 서버 지역 제한 |
| **러닝커브** | 낮음 (Firebase Console 친화적) | 중간 (PostgreSQL 지식 필요) | 낮음 (개발자 친화적) | 중간 (MongoDB + Realm Sync) |
| **속도/성능(초기)** | 높음 (CDN 기반) | 중간 (PostgreSQL 성능) | 중간 (PostgreSQL 성능) | 높음 (MongoDB 성능) |
| **실시간 동기화** | 매우 우수 (기본 제공) | 우수 (실시간 구독) | 우수 (실시간 기능) | 우수 (Realm Sync) |
| **오프라인** | 우수 (Firestore 오프라인) | 중간 (수동 구현 필요) | 중간 (수동 구현 필요) | 매우 우수 (Realm Sync) |
| **비용(월 1~3만 MAU)** | 중간 (사용량 기반) | 낮음 (무료 플랜 관대) | 낮음 (무료 플랜 관대) | 높음 (사용량 기반) |
| **운영 난이도** | 매우 낮음 (완전 관리형) | 낮음 (관리형 서비스) | 낮음 (관리형 서비스) | 중간 (Atlas 관리) |
| **한국 로컬라이징** | 중간 (한국 서버 제한) | 중간 (한국 서버 제한) | 중간 (한국 서버 제한) | 중간 (한국 서버 제한) |
| **커뮤니티/문서** | 매우 우수 (Google 지원) | 우수 (오픈소스 커뮤니티) | 중간 (상대적으로 작음) | 우수 (MongoDB 커뮤니티) |
| **MVP 적합도** | 9/10 | 8/10 | 8/10 | 7/10 |
| **Cursor AI 연동** | 우수 (Firebase SDK 문서화 우수) | 우수 (PostgreSQL 스키마 지원) | 중간 (상대적으로 작은 커뮤니티) | 우수 (MongoDB 스키마 지원) |

## 요구사항별 가중치 분석

### 핵심 요구사항
- **실시간 협업**: Firebase Firestore (9/10) > Supabase (8/10) > Appwrite (8/10) > MongoDB Atlas (7/10)
- **쉬운 인증/푸시**: Firebase (9/10) > Appwrite (8/10) > Supabase (7/10) > MongoDB Atlas (6/10)
- **빠른 MVP**: Firebase (9/10) > Supabase (8/10) > Appwrite (8/10) > MongoDB Atlas (7/10)
- **소규모 팀**: Firebase (9/10) > Supabase (8/10) > Appwrite (8/10) > MongoDB Atlas (7/10)

### 프론트엔드 최적 조합
- **React Native + Expo**: 빠른 개발, 풍부한 생태계, Cursor AI 지원 우수
- **Flutter**: 네이티브 성능, 일관된 UI, 하지만 러닝커브 존재

### 백엔드 최적 조합
- **Firebase Firestore**: 실시간 동기화, 인증/푸시 통합, 서버리스 운영
- **Supabase**: PostgreSQL 기반, 오픈소스, 무료 플랜 관대

## 최종 권고안

**프론트엔드**: **React Native (TypeScript + Expo)**를 권장합니다. JavaScript/TypeScript 기반으로 러닝커브가 낮고, Expo를 통해 빠른 개발과 배포가 가능하며, Cursor AI와의 연동이 우수합니다.

**백엔드/DB**: **Firebase Firestore**를 권장합니다. 실시간 동기화가 기본 제공되고, 인증과 푸시 알림 통합이 쉬우며, 서버리스로 운영 부담이 적어 소규모 팀에 최적입니다.

**대안 조합**: 만약 오픈소스 선호도가 높다면 **React Native + Supabase** 조합도 고려할 수 있습니다. PostgreSQL 기반으로 SQL 친화적이고, 무료 플랜이 관대하지만 실시간 기능 구현에 추가 개발이 필요합니다.

**Cursor AI 연동**: React Native + Firebase 조합이 TypeScript 지원과 풍부한 문서화로 Cursor AI와의 연동이 가장 우수합니다.

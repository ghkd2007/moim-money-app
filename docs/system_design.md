# 모임 가계부 시스템 설계

## 1. 아키텍처 개념도

### 전체 시스템 아키텍처

모임 가계부는 React Native + Firebase 기반의 모바일 크로스플랫폼 애플리케이션으로, 실시간 협업과 빠른 입력 UX를 제공합니다.

**핵심 구성 요소:**
- **프론트엔드**: React Native (Expo, TypeScript)
- **백엔드**: Firebase 서비스 스위트
- **데이터베이스**: Firestore (NoSQL, 실시간 동기화)
- **인증**: Firebase Auth
- **파일 저장**: Firebase Storage
- **서버리스**: Cloud Functions
- **푸시 알림**: Firebase Cloud Messaging (FCM)

```mermaid
graph TB
    subgraph "클라이언트 레이어"
        RN[React Native App<br/>Expo + TypeScript]
        UI[UI Components<br/>빠른 입력, 달력 뷰]
        State[State Management<br/>Redux/Zustand]
    end
    
    subgraph "Firebase 서비스"
        Auth[Firebase Auth<br/>이메일/전화번호 인증]
        Firestore[(Firestore<br/>실시간 NoSQL DB)]
        Storage[Firebase Storage<br/>프로필 이미지]
        Functions[Cloud Functions<br/>서버리스 로직]
        FCM[Firebase Cloud Messaging<br/>푸시 알림]
    end
    
    subgraph "외부 서비스"
        Email[이메일 서비스<br/>초대장 발송]
        SMS[SMS 서비스<br/>초대 알림]
    end
    
    RN --> Auth
    RN --> Firestore
    RN --> Storage
    RN --> Functions
    RN --> FCM
    
    Functions --> Email
    Functions --> SMS
    
    UI --> State
    State --> RN
```

### 데이터 모델

```mermaid
erDiagram
    USERS {
        string user_id PK
        string email
        string phone
        string display_name
        string profile_image_url
        timestamp created_at
        timestamp updated_at
    }
    
    GROUPS {
        string group_id PK
        string name
        string description
        string created_by FK
        string currency
        timestamp created_at
        timestamp updated_at
    }
    
    GROUP_MEMBERS {
        string group_id FK
        string user_id FK
        string role
        timestamp joined_at
    }
    
    INVITATIONS {
        string invitation_id PK
        string group_id FK
        string email
        string phone
        string status
        timestamp created_at
        timestamp expires_at
    }
    
    TRANSACTIONS {
        string transaction_id PK
        string group_id FK
        string user_id FK
        number amount
        string type
        string category
        string memo
        timestamp created_at
        timestamp updated_at
    }
    
    CATEGORIES {
        string category_id PK
        string group_id FK
        string name
        string icon
        string color
        boolean is_default
    }
    
    USERS ||--o{ GROUP_MEMBERS : "belongs to"
    GROUPS ||--o{ GROUP_MEMBERS : "has members"
    GROUPS ||--o{ INVITATIONS : "has invitations"
    GROUPS ||--o{ TRANSACTIONS : "has transactions"
    GROUPS ||--o{ CATEGORIES : "has categories"
    USERS ||--o{ TRANSACTIONS : "creates"
```

## 2. 초대/수락 시퀀스 다이어그램

```mermaid
sequenceDiagram
    participant U as 모임장
    participant App as React Native App
    participant Auth as Firebase Auth
    participant Firestore as Firestore
    participant Functions as Cloud Functions
    participant Email as 이메일 서비스
    participant Invitee as 초대받은 사용자

    Note over U, Invitee: 초대 생성 플로우
    U->>App: 모임 생성 + 멤버 초대
    App->>Auth: 모임장 인증 확인
    Auth-->>App: 인증 성공
    App->>Firestore: 모임 정보 저장
    App->>Firestore: 초대 정보 저장
    App->>Functions: 초대 처리 요청
    Functions->>Email: 초대장 이메일 발송
    Email-->>Functions: 발송 완료
    Functions->>Firestore: 초대 상태 업데이트

    Note over U, Invitee: 초대 수락 플로우
    Invitee->>App: 초대 링크 클릭
    App->>Auth: 사용자 인증/가입
    Auth-->>App: 인증 완료
    App->>Firestore: 초대 상태 확인
    Firestore-->>App: 초대 정보 반환
    App->>Firestore: 그룹 멤버 추가
    App->>Firestore: 초대 상태 업데이트
    App->>Functions: 수락 알림 처리
    Functions->>Email: 수락 알림 이메일
    Functions->>Firestore: 모임장에게 알림
```

## 3. 빠른 기록 추가(2~3탭) 시퀀스

```mermaid
sequenceDiagram
    participant U as 사용자
    participant UI as UI Components
    participant State as State Management
    participant Firestore as Firestore
    participant Functions as Cloud Functions

    Note over U, Functions: 빠른 입력 플로우 (2~3탭)
    U->>UI: "+" 버튼 클릭
    UI->>State: 입력 모드 활성화
    
    Note over U, Functions: 탭 1: 금액 입력
    U->>UI: 금액 입력 (숫자 키패드)
    UI->>State: 금액 상태 업데이트
    State-->>UI: 금액 표시
    
    Note over U, Functions: 탭 2: 카테고리 선택
    U->>UI: 카테고리 선택
    UI->>State: 카테고리 상태 업데이트
    State-->>UI: 선택된 카테고리 표시
    
    Note over U, Functions: 탭 3: 메모 입력 (선택사항)
    U->>UI: 메모 입력 (선택사항)
    UI->>State: 메모 상태 업데이트
    
    Note over U, Functions: 저장 및 동기화
    U->>UI: 저장 버튼 클릭
    UI->>State: 입력 데이터 검증
    State->>Firestore: 트랜잭션 저장
    Firestore-->>State: 저장 완료
    State->>Functions: 실시간 동기화 트리거
    Functions->>Firestore: 다른 멤버에게 알림
    State-->>UI: 성공 피드백
    UI-->>U: 입력 완료 표시
```

## 4. 상태 다이어그램

### 모임 상태 다이어그램

```mermaid
stateDiagram-v2
    [*] --> 생성중
    생성중 --> 활성
    생성중 --> 생성실패
    활성 --> 비활성
    활성 --> 삭제됨
    비활성 --> 활성
    삭제됨 --> [*]
    생성실패 --> [*]
```

### 초대 상태 다이어그램

```mermaid
stateDiagram-v2
    [*] --> 대기중
    대기중 --> 수락됨
    대기중 --> 거절됨
    대기중 --> 만료됨
    수락됨 --> [*]
    거절됨 --> [*]
    만료됨 --> [*]
```

### 내역 상태 다이어그램

```mermaid
stateDiagram-v2
    [*] --> 입력중
    입력중 --> 저장중
    저장중 --> 저장완료
    저장중 --> 저장실패
    저장완료 --> 수정중
    수정중 --> 저장중
    저장완료 --> 삭제됨
    저장실패 --> 입력중
    삭제됨 --> [*]
```

## 5. 비기능 요구사항

### 보안

#### 인증 및 권한 관리
- **Firebase Auth**: 이메일/전화번호 기반 인증
- **역할 기반 접근 제어 (RBAC)**:
  - 모임장: 모임 관리, 멤버 초대/제거, 설정 변경
  - 멤버: 내역 추가/수정, 조회
- **데이터 접근 제어**: 모임 멤버만 해당 모임 데이터 접근
- **Firestore 보안 규칙**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 프로필만 수정 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 모임 멤버만 모임 데이터 접근 가능
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/groups/$(groupId)/members/$(request.auth.uid));
    }
    
    // 트랜잭션은 모임 멤버만 접근
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/groups/$(resource.data.group_id)/members/$(request.auth.uid));
    }
  }
}
```

#### 데이터 보안
- **전송 암호화**: HTTPS/TLS 1.3
- **저장 암호화**: Firebase 자동 암호화
- **민감 정보**: 전화번호, 이메일 해시화 저장

### 스케일링 (월간 3만 MAU 가정)

#### 사용자 규모 분석
- **DAU**: 약 1,000명 (MAU의 3.3%)
- **모임당 평균 멤버**: 5명
- **총 모임 수**: 약 6,000개
- **일일 트랜잭션**: 약 5,000건
- **동시 사용자**: 최대 200명

#### Firebase 스케일링 전략

**Firestore 최적화:**
- **인덱싱**: 모임별, 날짜별 복합 인덱스
- **페이지네이션**: 20개씩 로드
- **오프라인 캐싱**: 최근 30일 데이터
- **실시간 리스너**: 필요한 데이터만 구독

**Cloud Functions 최적화:**
- **콜드 스타트 최소화**: 메모리 512MB, 타임아웃 30초
- **배치 처리**: 초대 알림 일괄 발송
- **캐싱**: Redis 캐시 활용

**스토리지 최적화:**
- **이미지 압축**: 프로필 이미지 자동 리사이징
- **CDN**: Firebase Hosting 활용

### 비용 최적화 포인트

#### Firebase 비용 분석 (월간 3만 MAU 기준)

**Firestore 비용:**
- **읽기**: 1,000 DAU × 50회/일 × 30일 = 150만회/월
- **쓰기**: 5,000 트랜잭션/일 × 30일 = 15만회/월
- **저장**: 약 10GB
- **예상 비용**: $150-300/월

**Cloud Functions 비용:**
- **실행 횟수**: 10만회/월
- **실행 시간**: 평균 2초
- **예상 비용**: $50-100/월

**Storage 비용:**
- **저장 용량**: 약 5GB
- **예상 비용**: $10-20/월

**총 예상 비용**: $210-420/월

#### 비용 최적화 전략

**1. Firestore 최적화:**
- **읽기 최소화**: 필요한 필드만 선택
- **캐싱 활용**: 오프라인 캐시 적극 활용
- **배치 작업**: 여러 작업을 한 번에 처리

**2. Cloud Functions 최적화:**
- **함수 통합**: 유사한 기능을 하나의 함수로
- **비동기 처리**: 이메일 발송 등은 비동기로
- **메모리 최적화**: 필요한 메모리만 할당

**3. 스토리지 최적화:**
- **이미지 압축**: 자동 리사이징
- **불필요한 파일 삭제**: 정기적인 정리

**4. 무료 플랜 활용:**
- **Firebase 무료 할당량**:
  - Firestore: 1GB 저장, 50,000 읽기/일, 20,000 쓰기/일
  - Functions: 125,000 호출/월
  - Storage: 5GB 저장, 1GB 다운로드/일

**5. 예상 월 비용 (최적화 후):**
- **1만 MAU**: $50-100/월
- **3만 MAU**: $150-250/월
- **5만 MAU**: $300-500/월

### 성능 모니터링

#### 핵심 지표
- **앱 로딩 시간**: 목표 2초 이내
- **트랜잭션 저장 시간**: 목표 1초 이내
- **실시간 동기화 지연**: 목표 500ms 이내
- **오프라인 동기화**: 목표 5초 이내

#### 모니터링 도구
- **Firebase Performance**: 앱 성능 모니터링
- **Firebase Crashlytics**: 크래시 분석
- **Firebase Analytics**: 사용자 행동 분석
- **Cloud Functions 로그**: 서버리스 함수 모니터링

이러한 시스템 설계를 통해 모임 가계부는 확장 가능하고 안전하며 비용 효율적인 서비스를 제공할 수 있습니다.

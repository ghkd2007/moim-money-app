# 모임 가계부 와이어프레임 & 컴포넌트 트리

## 1. 로그인/회원가입 화면

### 화면 구성
```
┌─────────────────────────────────┐
│ 상단: 앱 로고 + "모임 가계부"     │
├─────────────────────────────────┤
│ 중앙: 로그인/회원가입 폼        │
│ ┌─────────────────────────────┐ │
│ │ 이메일 입력 필드            │ │
│ │ 비밀번호 입력 필드          │ │
│ │ "로그인" 버튼              │ │
│ │ "회원가입" 버튼            │ │
│ │ "비밀번호 찾기" 링크        │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 하단: 소셜 로그인 (선택사항)    │
└─────────────────────────────────┘
```

### 컴포넌트 트리
```
LoginScreen
├── Header
│   ├── AppLogo
│   └── AppTitle
├── LoginForm
│   ├── EmailInput
│   ├── PasswordInput
│   ├── LoginButton
│   ├── SignupButton
│   └── ForgotPasswordLink
├── SocialLogin (선택사항)
│   ├── GoogleLoginButton
│   └── AppleLoginButton
└── Footer
    └── TermsAndPrivacy
```

### 상태 관리
- `isLoading`: 로그인 처리 중
- `email`: 이메일 입력값
- `password`: 비밀번호 입력값
- `errorMessage`: 에러 메시지

### 이벤트
- `onEmailChange`: 이메일 입력
- `onPasswordChange`: 비밀번호 입력
- `onLoginPress`: 로그인 버튼 클릭
- `onSignupPress`: 회원가입 버튼 클릭
- `onForgotPasswordPress`: 비밀번호 찾기

### 네비게이션
- **로그인 성공**: `HomeScreen`
- **회원가입**: `SignupScreen`
- **비밀번호 찾기**: `ForgotPasswordScreen`

---

## 2. 홈 화면 (모임 스위처 + 월 요약)

### 화면 구성
```
┌─────────────────────────────────┐
│ 상단: 모임 스위처 + 설정 버튼    │
│ ┌─────────────────────────────┐ │
│ │ [대학동기모임 ▼] [⚙️]       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 중앙: 월 요약 + 빠른 액션       │
│ ┌─────────────────────────────┐ │
│ │ 2024년 1월 요약            │ │
│ │ ┌─────────┬─────────┐      │ │
│ │ │ 수입    │ 지출    │      │ │
│ │ │ 500,000│ 300,000 │      │ │
│ │ └─────────┴─────────┘      │ │
│ │                           │ │
│ │ 카테고리별 지출            │ │
│ │ ████ 식비 40%            │ │
│ │ ██ 교통비 25%            │ │
│ │ █ 문화생활 20%           │ │
│ │ █ 기타 15%               │ │
│ │                           │ │
│ │ [+ 빠른 추가] 버튼        │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 하단: 탭 네비게이션            │
│ [🏠] [📅] [📊] [👤]         │
└─────────────────────────────────┘
```

### 컴포넌트 트리
```
HomeScreen
├── Header
│   ├── GroupSwitcher
│   │   ├── CurrentGroupName
│   │   ├── GroupDropdown
│   │   └── GroupList
│   └── SettingsButton
├── MonthlySummary
│   ├── SummaryHeader
│   ├── IncomeExpenseCard
│   │   ├── IncomeAmount
│   │   └── ExpenseAmount
│   ├── CategoryChart
│   │   ├── CategoryBar
│   │   └── CategoryLegend
│   └── QuickAddButton
└── BottomTabNavigation
    ├── HomeTab
    ├── CalendarTab
    ├── StatisticsTab
    └── ProfileTab
```

### 상태 관리
- `currentGroup`: 현재 선택된 그룹
- `monthlyData`: 월별 수입/지출 데이터
- `categoryData`: 카테고리별 지출 데이터
- `isGroupSwitcherOpen`: 그룹 스위처 드롭다운 상태

### 이벤트
- `onGroupSelect`: 그룹 선택
- `onQuickAddPress`: 빠른 추가 버튼 클릭
- `onSettingsPress`: 설정 버튼 클릭
- `onTabPress`: 탭 네비게이션 클릭

### 네비게이션
- **빠른 추가**: `QuickAddModal`
- **설정**: `SettingsScreen`
- **그룹 관리**: `GroupManagementScreen`

---

## 3. 캘린더 화면

### 화면 구성
```
┌─────────────────────────────────┐
│ 상단: 월 네비게이션 + 필터      │
│ ┌─────────────────────────────┐ │
│ │ [<] 2024년 1월 [>] [필터]  │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 중앙: 캘린더 그리드 + 일별 요약  │
│ ┌─────────────────────────────┐ │
│ │ 일 월 화 수 목 금 토        │ │
│ │    1  2  3  4  5  6        │ │
│ │  7  8  9 10 11 12 13       │ │
│ │ 14 15 16 17 18 19 20       │ │
│ │ 21 22 23 24 25 26 27       │ │
│ │ 28 29 30 31                │ │
│ │                           │ │
│ │ 선택된 날짜: 15일          │ │
│ │ 수입: 50,000원            │ │
│ │ 지출: 30,000원            │ │
│ │ 내역: 3건                 │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 하단: 선택된 날짜 내역 목록     │
│ ┌─────────────────────────────┐ │
│ │ 15일 내역                   │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🍕 식비 15,000원       │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🚌 교통비 5,000원      │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🎬 문화생활 10,000원    │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 컴포넌트 트리
```
CalendarScreen
├── Header
│   ├── MonthNavigation
│   │   ├── PreviousMonthButton
│   │   ├── CurrentMonthDisplay
│   │   └── NextMonthButton
│   └── FilterButton
├── CalendarGrid
│   ├── WeekdayHeader
│   ├── CalendarDays
│   │   ├── CalendarDay
│   │   │   ├── DayNumber
│   │   │   ├── IncomeIndicator
│   │   │   └── ExpenseIndicator
│   │   └── SelectedDay
│   └── DaySummary
│       ├── SelectedDate
│       ├── IncomeAmount
│       ├── ExpenseAmount
│       └── EntryCount
└── DailyEntriesList
    ├── ListHeader
    └── EntryItem
        ├── CategoryIcon
        ├── EntryDetails
        │   ├── CategoryName
        │   ├── Amount
        │   └── Memo
        └── EntryActions
```

### 상태 관리
- `selectedDate`: 선택된 날짜
- `currentMonth`: 현재 표시 월
- `calendarData`: 캘린더 데이터
- `dailyEntries`: 선택된 날짜의 내역

### 이벤트
- `onDateSelect`: 날짜 선택
- `onMonthChange`: 월 변경
- `onEntryPress`: 내역 클릭
- `onFilterPress`: 필터 버튼 클릭

### 네비게이션
- **내역 상세**: `EntryDetailScreen`
- **필터**: `FilterModal`
- **빠른 추가**: `QuickAddModal`

---

## 4. 내역 리스트/검색 화면

### 화면 구성
```
┌─────────────────────────────────┐
│ 상단: 검색바 + 필터 버튼        │
│ ┌─────────────────────────────┐ │
│ │ 🔍 검색어 입력... [필터]    │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 중앙: 내역 리스트 + 통계        │
│ ┌─────────────────────────────┐ │
│ │ 2024년 1월 내역 (총 45건)   │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🍕 식비 15,000원       │ │ │
│ │ │ 2024.01.15 김민수      │ │ │
│ │ │ 점심 식사비            │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🚌 교통비 5,000원      │ │ │
│ │ │ 2024.01.15 박지영      │ │ │
│ │ │ 지하철 요금            │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🎬 문화생활 10,000원    │ │ │
│ │ │ 2024.01.14 이준호      │ │ │
│ │ │ 영화 관람              │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 하단: 페이지네이션 + 정렬       │
│ ┌─────────────────────────────┐ │
│ │ [이전] 1/5 [다음] [최신순]  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 컴포넌트 트리
```
EntriesListScreen
├── Header
│   ├── SearchBar
│   │   ├── SearchInput
│   │   └── SearchIcon
│   └── FilterButton
├── EntriesList
│   ├── ListHeader
│   │   ├── MonthYearDisplay
│   │   └── TotalCount
│   ├── EntryItem
│   │   ├── CategoryIcon
│   │   ├── EntryContent
│   │   │   ├── CategoryName
│   │   │   ├── Amount
│   │   │   ├── Date
│   │   │   ├── CreatedBy
│   │   │   └── Memo
│   │   └── EntryActions
│   │       ├── EditButton
│   │       └── DeleteButton
│   └── EmptyState
└── Footer
    ├── Pagination
    │   ├── PreviousButton
    │   ├── PageIndicator
    │   └── NextButton
    └── SortButton
```

### 상태 관리
- `searchQuery`: 검색어
- `filterOptions`: 필터 옵션
- `entries`: 내역 목록
- `currentPage`: 현재 페이지
- `sortBy`: 정렬 기준

### 이벤트
- `onSearch`: 검색어 입력
- `onFilterPress`: 필터 버튼 클릭
- `onEntryPress`: 내역 클릭
- `onEditPress`: 수정 버튼 클릭
- `onDeletePress`: 삭제 버튼 클릭

### 네비게이션
- **내역 상세**: `EntryDetailScreen`
- **내역 수정**: `EditEntryModal`
- **필터**: `FilterModal`

---

## 5. 빠른 추가 모달 (2~3탭 UX)

### 화면 구성
```
┌─────────────────────────────────┐
│ 상단: 모달 헤더 + 닫기 버튼     │
│ ┌─────────────────────────────┐ │
│ │ 빠른 추가 [✕]              │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 중앙: 3단계 입력 폼             │
│ ┌─────────────────────────────┐ │
│ │ 1단계: 금액 입력            │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │     [50,000]           │ │ │
│ │ │ ┌─────────────────────┐ │ │ │
│ │ │ │ 1 2 3              │ │ │ │
│ │ │ │ 4 5 6              │ │ │ │
│ │ │ │ 7 8 9              │ │ │ │
│ │ │ │ 0 ← 완료           │ │ │ │
│ │ │ └─────────────────────┘ │ │ │
│ │ └─────────────────────────┘ │ │
│ │                           │ │
│ │ 2단계: 카테고리 선택        │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🍕 식비  🚌 교통비     │ │ │
│ │ │ 🎬 문화생활  📚 교육    │ │ │
│ │ │ 🏥 의료  🏠 주거       │ │ │
│ │ │ 🛒 쇼핑  🎁 선물       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                           │ │
│ │ 3단계: 메모 입력 (선택)     │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 메모: [점심 식사비]     │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 하단: 저장 버튼                │
│ ┌─────────────────────────────┐ │
│ │        [저장]              │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 컴포넌트 트리
```
QuickAddModal
├── Header
│   ├── ModalTitle
│   └── CloseButton
├── StepIndicator
│   ├── Step1Indicator
│   ├── Step2Indicator
│   └── Step3Indicator
├── Step1AmountInput
│   ├── AmountDisplay
│   ├── NumberKeypad
│   │   ├── NumberButton
│   │   ├── BackspaceButton
│   │   └── DoneButton
│   └── TypeToggle
│       ├── IncomeButton
│       └── ExpenseButton
├── Step2CategorySelection
│   ├── CategoryGrid
│   │   ├── CategoryItem
│   │   │   ├── CategoryIcon
│   │   │   └── CategoryName
│   │   └── CustomCategoryButton
│   └── RecentlyUsedCategories
├── Step3MemoInput
│   ├── MemoInputField
│   └── QuickMemoButtons
└── Footer
    ├── PreviousButton
    ├── SaveButton
    └── CancelButton
```

### 상태 관리
- `currentStep`: 현재 단계 (1-3)
- `amount`: 입력된 금액
- `type`: 수입/지출 유형
- `selectedCategory`: 선택된 카테고리
- `memo`: 메모 입력값
- `isValid`: 입력 유효성

### 이벤트
- `onNumberPress`: 숫자 키패드 클릭
- `onTypeToggle`: 수입/지출 토글
- `onCategorySelect`: 카테고리 선택
- `onMemoInput`: 메모 입력
- `onSavePress`: 저장 버튼 클릭
- `onPreviousPress`: 이전 단계로

### 2~3탭 입력 UX 흐름
1. **1단계 (금액 입력)**: 숫자 키패드로 금액 입력 → 완료 버튼
2. **2단계 (카테고리 선택)**: 그리드에서 카테고리 선택 → 자동 진행
3. **3단계 (메모 입력)**: 선택사항, 입력 후 저장 또는 건너뛰기

---

## 6. 카테고리 관리 화면

### 화면 구성
```
┌─────────────────────────────────┐
│ 상단: 제목 + 추가 버튼          │
│ ┌─────────────────────────────┐ │
│ │ 카테고리 관리 [+ 추가]       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 중앙: 카테고리 목록 + 편집       │
│ ┌─────────────────────────────┐ │
│ │ 기본 카테고리               │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🍕 식비 [수정] [삭제]   │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🚌 교통비 [수정] [삭제] │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🎬 문화생활 [수정] [삭제]│ │ │
│ │ └─────────────────────────┘ │ │
│ │                           │ │
│ │ 커스텀 카테고리            │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📚 교육 [수정] [삭제]   │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🏥 의료 [수정] [삭제]   │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 하단: 정렬 + 기본값 설정        │
│ ┌─────────────────────────────┐ │
│ │ [정렬] [기본값 설정]        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 컴포넌트 트리
```
CategoryManagementScreen
├── Header
│   ├── ScreenTitle
│   └── AddButton
├── CategoryList
│   ├── DefaultCategoriesSection
│   │   ├── SectionHeader
│   │   └── CategoryItem
│   │       ├── CategoryIcon
│   │       ├── CategoryName
│   │       ├── EditButton
│   │       └── DeleteButton
│   └── CustomCategoriesSection
│       ├── SectionHeader
│       └── CategoryItem
└── Footer
    ├── SortButton
    └── DefaultSettingsButton
```

### 상태 관리
- `categories`: 카테고리 목록
- `editingCategory`: 편집 중인 카테고리
- `sortOrder`: 정렬 순서

### 이벤트
- `onAddCategory`: 카테고리 추가
- `onEditCategory`: 카테고리 편집
- `onDeleteCategory`: 카테고리 삭제
- `onSortCategories`: 카테고리 정렬

### 네비게이션
- **카테고리 추가**: `AddCategoryModal`
- **카테고리 편집**: `EditCategoryModal`

---

## 7. 모임 관리 화면 (멤버/초대)

### 화면 구성
```
┌─────────────────────────────────┐
│ 상단: 탭 네비게이션            │
│ ┌─────────────────────────────┐ │
│ │ [멤버] [초대] [설정]        │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 중앙: 멤버 목록 + 초대 관리      │
│ ┌─────────────────────────────┐ │
│ │ 멤버 (5명)                  │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 김민수 (모임장)      │ │ │
│ │ │ 📧 kim@email.com       │ │ │
│ │ │ [역할변경] [제거]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 👤 박지영 (멤버)        │ │ │
│ │ │ 📧 park@email.com      │ │ │
│ │ │ [역할변경] [제거]       │ │ │
│ │ └─────────────────────────┘ │ │
│ │                           │ │
│ │ 초대 (2건)                 │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 📧 lee@email.com       │ │ │
│ │ │ 대기중 2024.01.15      │ │ │
│ │ │ [재발송] [취소]         │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 하단: 멤버 초대 + 설정          │
│ ┌─────────────────────────────┐ │
│ │ [+ 멤버 초대] [모임 설정]   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 컴포넌트 트리
```
GroupManagementScreen
├── Header
│   └── TabNavigation
│       ├── MembersTab
│       ├── InvitationsTab
│       └── SettingsTab
├── MembersSection
│   ├── SectionHeader
│   ├── MemberList
│   │   └── MemberItem
│   │       ├── MemberAvatar
│   │       ├── MemberInfo
│   │       │   ├── DisplayName
│   │       │   ├── Email
│   │       │   └── Role
│   │       └── MemberActions
│   │           ├── ChangeRoleButton
│   │           └── RemoveButton
│   └── InviteMemberButton
├── InvitationsSection
│   ├── SectionHeader
│   ├── InvitationList
│   │   └── InvitationItem
│   │       ├── Email
│   │       ├── Status
│   │       ├── CreatedDate
│   │       └── InvitationActions
│   │           ├── ResendButton
│   │           └── CancelButton
│   └── CreateInvitationButton
└── Footer
    ├── InviteMemberButton
    └── GroupSettingsButton
```

### 상태 관리
- `activeTab`: 현재 활성 탭
- `members`: 멤버 목록
- `invitations`: 초대 목록
- `selectedMember`: 선택된 멤버

### 이벤트
- `onTabChange`: 탭 변경
- `onInviteMember`: 멤버 초대
- `onChangeRole`: 역할 변경
- `onRemoveMember`: 멤버 제거
- `onResendInvitation`: 초대 재발송
- `onCancelInvitation`: 초대 취소

### 네비게이션
- **멤버 초대**: `InviteMemberModal`
- **역할 변경**: `ChangeRoleModal`
- **모임 설정**: `GroupSettingsScreen`

---

## 8. 마이페이지 화면

### 화면 구성
```
┌─────────────────────────────────┐
│ 상단: 프로필 정보 + 편집 버튼    │
│ ┌─────────────────────────────┐ │
│ │ 👤 김민수                   │ │
│ │ 📧 kim@email.com           │ │
│ │ 📱 010-1234-5678           │ │
│ │ [프로필 편집]               │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 중앙: 메뉴 목록                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 내 통계                  │ │
│ │ 🏠 내 모임                  │ │
│ │ 🔔 알림 설정                │ │
│ │ 🌙 다크모드                 │ │
│ │ 📱 앱 정보                  │ │
│ │ ❓ 도움말                   │ │
│ │ 📞 고객지원                 │ │
│ │ ⚙️ 설정                     │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 하단: 로그아웃 + 계정 삭제      │
│ ┌─────────────────────────────┐ │
│ │ [로그아웃] [계정 삭제]      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 컴포넌트 트리
```
ProfileScreen
├── Header
│   ├── ProfileInfo
│   │   ├── ProfileAvatar
│   │   ├── DisplayName
│   │   ├── Email
│   │   └── Phone
│   └── EditProfileButton
├── MenuList
│   ├── MenuItem
│   │   ├── MenuIcon
│   │   ├── MenuTitle
│   │   └── MenuArrow
│   └── MenuSection
│       ├── StatisticsMenuItem
│       ├── MyGroupsMenuItem
│       ├── NotificationSettingsMenuItem
│       ├── DarkModeMenuItem
│       ├── AppInfoMenuItem
│       ├── HelpMenuItem
│       ├── SupportMenuItem
│       └── SettingsMenuItem
└── Footer
    ├── LogoutButton
    └── DeleteAccountButton
```

### 상태 관리
- `userProfile`: 사용자 프로필 정보
- `isDarkMode`: 다크모드 상태
- `notificationSettings`: 알림 설정

### 이벤트
- `onEditProfile`: 프로필 편집
- `onMenuPress`: 메뉴 클릭
- `onLogout`: 로그아웃
- `onDeleteAccount`: 계정 삭제

### 네비게이션
- **프로필 편집**: `EditProfileScreen`
- **내 통계**: `MyStatisticsScreen`
- **내 모임**: `MyGroupsScreen`
- **알림 설정**: `NotificationSettingsScreen`
- **설정**: `SettingsScreen`

---

## 9. 전체 네비게이션 구조

### 탭 네비게이션
```
BottomTabNavigator
├── HomeTab (홈)
├── CalendarTab (캘린더)
├── StatisticsTab (통계)
└── ProfileTab (마이페이지)
```

### 스택 네비게이션
```
RootStackNavigator
├── AuthStack
│   ├── LoginScreen
│   ├── SignupScreen
│   └── ForgotPasswordScreen
├── MainStack
│   ├── HomeScreen
│   ├── CalendarScreen
│   ├── EntriesListScreen
│   ├── CategoryManagementScreen
│   ├── GroupManagementScreen
│   └── ProfileScreen
└── ModalStack
    ├── QuickAddModal
    ├── FilterModal
    ├── InviteMemberModal
    └── SettingsModal
```

### 라우트 명세
- `/`: `HomeScreen`
- `/login`: `LoginScreen`
- `/signup`: `SignupScreen`
- `/calendar`: `CalendarScreen`
- `/entries`: `EntriesListScreen`
- `/categories`: `CategoryManagementScreen`
- `/group-management`: `GroupManagementScreen`
- `/profile`: `ProfileScreen`
- `/quick-add`: `QuickAddModal`
- `/filter`: `FilterModal`
- `/invite-member`: `InviteMemberModal`
- `/settings`: `SettingsModal`

이 와이어프레임과 컴포넌트 트리를 통해 모임 가계부의 모든 핵심 화면을 체계적으로 구현할 수 있으며, 특히 2~3탭 입력 UX를 보장하는 상호작용 흐름이 명확히 정의되어 있습니다.

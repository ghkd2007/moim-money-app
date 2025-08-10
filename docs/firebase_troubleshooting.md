# Firebase 연결 문제 해결 가이드

## 현재 상태
✅ Firebase 연결 성공 (API 호출 가능)
❌ 로그인 실패: `auth/invalid-credential`

## 해결 방법

### 1. 회원가입 먼저 시도
- Firebase에는 계정이 생성되어야 로그인 가능
- 테스트 앱에서 "회원가입" 버튼 먼저 클릭

### 2. Firebase Console 확인사항
1. **Authentication > Sign-in method**
   - 이메일/비밀번호가 "사용 설정"되어 있는지 확인
   - 상태가 "Enabled"인지 확인

2. **Authentication > Users 탭**
   - 회원가입 후 사용자가 목록에 나타나는지 확인

### 3. 일반적인 오류 해결
- `auth/invalid-credential`: 계정이 없거나 비밀번호 틀림 → 회원가입 먼저
- `auth/operation-not-allowed`: Authentication 미활성화 → Console에서 활성화
- `auth/weak-password`: 비밀번호 6자 미만 → 더 긴 비밀번호 사용

### 4. 테스트 순서
1. 회원가입 (test@example.com / test123)
2. 성공 확인 (사용자 정보 표시됨)
3. 로그아웃
4. 로그인 테스트



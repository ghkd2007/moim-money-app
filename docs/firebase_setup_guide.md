# Firebase 설정 가이드

## 1. Firebase Console 설정

### Authentication 설정
1. Firebase Console > Authentication > Sign-in method
2. 다음 로그인 방법들을 활성화:
   - **이메일/비밀번호**: 사용 설정
   - **Google**: 사용 설정 (선택사항)

### Firestore Database 설정
1. Firebase Console > Firestore Database
2. **데이터베이스 만들기** 클릭
3. **테스트 모드에서 시작** 선택 (나중에 보안 규칙 설정)
4. 위치: **asia-northeast3 (서울)** 선택

### Storage 설정 (선택사항)
1. Firebase Console > Storage
2. **시작하기** 클릭
3. **테스트 모드에서 시작** 선택
4. 위치: **asia-northeast3 (서울)** 선택

## 2. 앱 설정값 업데이트

Firebase Console > 프로젝트 설정 > 일반 > 내 앱에서 설정 객체를 복사한 후,
`src/services/firebase.ts` 파일의 firebaseConfig 객체를 업데이트하세요.

```javascript
const firebaseConfig = {
  apiKey: "복사한-api-key",
  authDomain: "프로젝트-id.firebaseapp.com",
  projectId: "프로젝트-id", 
  storageBucket: "프로젝트-id.appspot.com",
  messagingSenderId: "메시징-센더-id",
  appId: "앱-id"
};
```

## 3. 테스트

설정이 완료되면 앱을 실행하여 Firebase 연결을 테스트할 수 있습니다:

```bash
npm start
```

## 다음 단계

1. Firebase 설정값 업데이트
2. Authentication 및 Firestore 활성화  
3. 앱 실행 및 연결 테스트
4. 기본 로그인/회원가입 화면 구현



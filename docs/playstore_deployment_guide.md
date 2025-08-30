# 플레이스토어 테스트 앱 배포 가이드

## 목차
1. [사전 준비](#사전-준비)
2. [앱 서명 키 생성](#앱-서명-키-생성)
3. [빌드 설정 업데이트](#빌드-설정-업데이트)
4. [앱 빌드 및 업로드](#앱-빌드-및-업로드)
5. [플레이스토어 콘솔 설정](#플레이스토어-콘솔-설정)
6. [내부 테스트 배포](#내부-테스트-배포)
7. [문제 해결](#문제-해결)

## 사전 준비

### 필요한 계정 및 도구
- [ ] Google Play Console 개발자 계정 (25달러 등록비)
- [ ] EAS CLI 설치 (`npm install -g @expo/eas-cli`)
- [ ] EAS 계정 로그인 (`eas login`)

### 현재 프로젝트 정보
- **앱 이름**: moim-money-app
- **패키지명**: com.anonymous.moimmoneyapp
- **현재 버전**: 1.0.0
- **플랫폼**: Android (React Native + Expo)

## 앱 서명 키 생성

### 방법 1: EAS 자동 관리 (권장)
```bash
# EAS가 자동으로 키스토어를 생성하고 관리
eas build --platform android --profile production
```

### 방법 2: 수동 키스토어 생성
```bash
# 키스토어 생성
keytool -genkeypair -v -keystore moim-money-release-key.keystore -alias moim-money-key -keyalg RSA -keysize 2048 -validity 10000

# 키스토어 정보를 안전한 곳에 보관하세요!
```

## 빌드 설정 업데이트

### eas.json 수정
```json
{
  "cli": {
    "version": ">= 16.17.4",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

### app.json 업데이트 (필요시)
```json
{
  "expo": {
    "name": "모임머니",
    "slug": "moim-money-app",
    "version": "1.0.0",
    "android": {
      "package": "com.moimoney.app",
      "versionCode": 1,
      "permissions": [
        "READ_SMS",
        "RECEIVE_SMS"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

## 앱 빌드 및 업로드

### 1. 프로덕션 빌드 생성
```bash
# AAB 파일 생성 (플레이스토어용)
eas build --platform android --profile production
```

### 2. 빌드 상태 확인
```bash
eas build:list
```

### 3. 빌드 완료 후 다운로드
- EAS 대시보드에서 .aab 파일 다운로드
- 또는 CLI로 다운로드: `eas build:download [BUILD_ID]`

## 플레이스토어 콘솔 설정

### 1. Google Play Console 접속
1. [Google Play Console](https://play.google.com/console) 접속
2. "앱 만들기" 클릭
3. 앱 세부정보 입력:
   - 앱 이름: 모임머니
   - 기본 언어: 한국어
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료

### 2. 앱 콘텐츠 설정
- [ ] 개인정보처리방침 URL
- [ ] 앱 카테고리: 금융
- [ ] 콘텐츠 등급
- [ ] 타겟 고객층
- [ ] 데이터 보안 설문지

### 3. 스토어 등록정보
- [ ] 앱 아이콘 (512x512px)
- [ ] 스크린샷 (최소 2개)
- [ ] 앱 설명 (짧은 설명, 자세한 설명)

## 내부 테스트 배포

### 1. 내부 테스트 트랙 설정
1. "테스트" > "내부 테스트" 선택
2. "새 버전 만들기" 클릭
3. AAB 파일 업로드
4. 버전 이름 및 변경사항 입력

### 2. 테스터 추가
1. "테스터" 탭에서 이메일 목록 생성
2. 테스터 이메일 주소 추가
3. "변경사항 저장" 클릭

### 3. 배포 시작
1. "버전 검토" 클릭
2. "내부 테스트로 출시 시작" 클릭

## 문제 해결

### 일반적인 오류들

#### 1. 서명 오류
```
Error: The APK is not signed properly
```
**해결방법**: EAS 빌드 프로필에서 서명 설정 확인

#### 2. 권한 오류
```
Error: Permission READ_SMS is not declared
```
**해결방법**: app.json의 permissions 배열 확인

#### 3. 패키지명 충돌
```
Error: Package name already exists
```
**해결방법**: app.json에서 고유한 패키지명으로 변경

### 유용한 명령어들
```bash
# 빌드 로그 확인
eas build:view [BUILD_ID]

# 빌드 취소
eas build:cancel [BUILD_ID]

# 프로젝트 설정 확인
eas project:info

# 자격증명 확인
eas credentials
```

## 다음 단계

내부 테스트가 성공적으로 완료되면:
1. 클로즈드 테스트 (알파/베타)
2. 오픈 테스트
3. 프로덕션 배포

각 단계별로 더 많은 테스터와 더 엄격한 검토 과정을 거치게 됩니다.

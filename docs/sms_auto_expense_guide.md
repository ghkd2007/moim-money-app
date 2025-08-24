# SMS 자동 지출 기능 구현 가이드

## 개요

모임 가계부 앱에서 SMS를 자동으로 읽어 지출 정보를 파싱하고 자동으로 추가하는 기능입니다.

## 현재 구현 상태

### ✅ 완료된 기능
- SMS 메시지 파싱 엔진 (다양한 은행/카드사 패턴 지원)
- 카테고리 자동 분류
- 금액, 가맹점명, 날짜 자동 추출
- 신뢰도 계산 시스템

### 🔄 개발 중인 기능
- 실제 SMS 읽기 (현재는 MockSMSReader 사용)
- 권한 관리 시스템

## 은행/카드사 지원 현황

### 지원하는 패턴
1. **신한카드**: `[신한카드] 날짜 시간 가맹점 결제 금액원 승인`
2. **KB국민카드**: `[KB국민카드] 날짜 시간 가맹점 결제 금액원 승인`
3. **삼성카드**: `[삼성카드] 날짜 시간 가맹점 결제 금액원 승인`
4. **현대카드**: `[현대카드] 날짜 시간 가맹점 결제 금액원 승인`
5. **BC카드**: `[BC카드] 날짜 시간 가맹점 결제 금액원 승인`

### 자동 카테고리 분류
- **식비**: 식당, 카페, 음식, 배달, 푸드, 레스토랑, 맛집, 치킨, 피자, 햄버거
- **교통**: 버스, 지하철, 택시, 기차, 교통, 대중교통, 주유소, 충전소, 주차
- **쇼핑**: 쇼핑, 마트, 편의점, 백화점, 온라인, 구매, 스토어, 몰
- **의료**: 병원, 약국, 의료, 치료, 진료, 치과, 안과
- **교육**: 학원, 교육, 강의, 수업, 책, 도서, 서점
- **엔터테인먼트**: 영화, 게임, 놀이, 레저, 스포츠, 놀이공원, 공연
- **통신**: 통신, 인터넷, 모바일, 요금
- **주거**: 월세, 관리비, 전기세, 가스비, 수도세

## 실제 SMS 읽기 구현 방법

### 1. 네이티브 모듈 설치

```bash
# Expo 개발 환경에서 네이티브 모듈 사용을 위해 EAS Build 필요
npx eas build:configure

# SMS 읽기 라이브러리 설치 (EAS Build 후)
npm install react-native-sms-retriever
# 또는
npm install @react-native-community/sms
```

### 2. RealSMSReader 구현

```typescript
import SmsRetriever from 'react-native-sms-retriever';

class RealSMSReader implements SMSReader {
  async readMessages(): Promise<SMSMessage[]> {
    try {
      // SMS 읽기 시작
      const result = await SmsRetriever.startSmsRetriever();
      
      // SMS 수신 대기 (최대 5분)
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMS 읽기 시간 초과')), 300000)
      );
      
      const smsData = await Promise.race([
        SmsRetriever.addSmsListener(),
        timeout
      ]);
      
      // SMS 리스너 정리
      SmsRetriever.removeSmsListener();
      
      // 파싱된 SMS 메시지 반환
      return this.parseSMSData(smsData);
    } catch (error) {
      console.error('실제 SMS 읽기 실패:', error);
      throw error;
    }
  }
  
  private parseSMSData(smsData: any): SMSMessage[] {
    // SMS 데이터를 SMSMessage 형식으로 변환
    // 구현 필요
  }
}
```

### 3. 환경 설정 변경

```typescript
// src/services/smsService.ts
const SMS_CONFIG = {
  USE_MOCK_SMS: false, // 실제 SMS 사용
  FORCE_REAL_SMS: true
};
```

## 테스트 방법

### MockSMSReader 테스트
1. 앱 실행
2. SMS 자동 지출 모달 열기
3. 시뮬레이션된 SMS 메시지 확인
4. 파싱 결과 및 카테고리 분류 확인

### 실제 SMS 테스트
1. `FORCE_REAL_SMS: true` 설정
2. 실제 SMS 권한 요청
3. 실제 SMS 메시지로 테스트

## 권한 관리

### Android 권한
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.READ_SMS" />
```

### iOS 권한
```xml
<!-- ios/Info.plist -->
<key>NSUserNotificationUsageDescription</key>
<string>SMS 자동 지출 인식을 위해 SMS 접근 권한이 필요합니다.</string>
```

## 성능 최적화

### 1. 배치 처리
- 여러 SMS를 한 번에 읽어서 처리
- 중복 메시지 필터링

### 2. 캐싱
- 파싱된 결과를 메모리에 캐싱
- 동일한 패턴의 SMS는 빠른 처리

### 3. 백그라운드 처리
- 앱이 백그라운드에 있을 때도 SMS 모니터링
- 중요한 지출만 즉시 알림

## 문제 해결

### 일반적인 문제들
1. **권한 거부**: 사용자가 SMS 권한을 거부한 경우
2. **파싱 실패**: 새로운 SMS 형식이 인식되지 않는 경우
3. **성능 이슈**: 많은 SMS가 있을 때 느린 처리

### 해결 방법
1. **권한 안내**: 사용자에게 SMS 권한의 필요성 설명
2. **패턴 업데이트**: 새로운 SMS 형식에 대한 패턴 추가
3. **배치 처리**: 여러 SMS를 효율적으로 처리

## 향후 개선 계획

1. **AI 기반 파싱**: 머신러닝을 활용한 더 정확한 파싱
2. **다국어 지원**: 한국어 외 다른 언어 SMS 지원
3. **실시간 동기화**: SMS 수신 즉시 지출 정보 업데이트
4. **사용자 피드백**: 파싱 결과에 대한 사용자 수정 기능

---

**참고**: 현재는 MockSMSReader를 사용하여 기능을 테스트할 수 있습니다. 실제 SMS 읽기 기능을 구현하려면 네이티브 모듈 설치가 필요합니다.




import { Platform, PermissionsAndroid, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';

export interface RealSMSMessage {
  id: string;
  address: string;
  body: string;
  date: Date;
  type: 'incoming' | 'outgoing';
}

/**
 * 실제 SMS 권한 확인 (Android)
 */
export const checkRealSMSPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    console.log('realSMSService: SMS 읽기는 Android에서만 지원됩니다.');
    return false;
  }

  try {
    // Android에서 SMS 읽기 권한 확인
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );
    
    console.log('realSMSService: SMS 권한 확인 결과:', granted);
    return granted;
  } catch (error) {
    console.error('realSMSService: SMS 권한 확인 실패:', error);
    return false;
  }
};

/**
 * 실제 SMS 권한 요청 (Android)
 */
export const requestRealSMSPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    Alert.alert(
      'SMS 읽기 지원 안함',
      'SMS 읽기 기능은 Android에서만 지원됩니다.',
      [{ text: '확인' }]
    );
    return false;
  }

  try {
    console.log('realSMSService: SMS 권한 요청 시작...');
    
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS 읽기 권한',
        message: '거래 내역을 자동으로 추가하기 위해 SMS 읽기 권한이 필요합니다.',
        buttonNeutral: '나중에',
        buttonNegative: '취소',
        buttonPositive: '허용',
      }
    );

    const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
    console.log('realSMSService: SMS 권한 요청 결과:', granted, isGranted);
    
    return isGranted;
  } catch (error) {
    console.error('realSMSService: SMS 권한 요청 실패:', error);
    return false;
  }
};

/**
 * 실제 SMS 메시지 읽기 (Android Native Module 필요)
 * 
 * 주의: 이 함수는 네이티브 모듈이 설치되어야 작동합니다.
 * Expo managed workflow에서는 제한적일 수 있습니다.
 */
export const readRealSMSMessages = async (): Promise<RealSMSMessage[]> => {
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    console.log('realSMSService: SMS 읽기는 Android에서만 지원됩니다.');
    return [];
  }

  try {
    // 먼저 권한 확인
    const hasPermission = await checkRealSMSPermission();
    if (!hasPermission) {
      const granted = await requestRealSMSPermission();
      if (!granted) {
        throw new Error('SMS 읽기 권한이 필요합니다.');
      }
    }

    console.log('realSMSService: SMS 메시지 읽기 시작...');

    // 실제 SMS 읽기는 네이티브 모듈이 필요합니다.
    // 현재는 시뮬레이션으로 대체하되, 권한은 실제로 요청합니다.
    
    // TODO: 실제 네이티브 모듈 구현
    // const nativeModule = NativeModules.SMSReader;
    // const messages = await nativeModule.readSMS();
    
    // 임시: 권한 테스트를 위한 시뮬레이션 데이터
    console.log('realSMSService: 권한 획득 성공! 시뮬레이션 SMS 데이터 반환');
    
    const simulationMessages: RealSMSMessage[] = [
      {
        id: 'real_1',
        address: '신한카드',
        body: '[신한카드] 12/25 15:30 스타벅스 결제 6,500원 승인 (잔액: 1,234,567원)',
        date: new Date(),
        type: 'incoming',
      },
      {
        id: 'real_2', 
        address: 'KB국민',
        body: '[KB국민카드] 12/25 14:20 GS25편의점 결제 3,200원 승인',
        date: new Date(Date.now() - 3600000),
        type: 'incoming',
      },
      {
        id: 'real_3',
        address: '삼성카드',
        body: '[삼성카드] 12/25 13:10 맥도날드 결제 8,900원 승인',
        date: new Date(Date.now() - 7200000),
        type: 'incoming',
      }
    ];

    console.log(`realSMSService: ${simulationMessages.length}개의 SMS 메시지 반환`);
    return simulationMessages;

  } catch (error) {
    console.error('realSMSService: SMS 읽기 실패:', error);
    throw error;
  }
};

/**
 * SMS 권한 상태 확인 및 안내
 */
export const checkSMSPermissionStatus = async (): Promise<{
  hasPermission: boolean;
  canRequest: boolean;
  message: string;
}> => {
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return {
      hasPermission: false,
      canRequest: false,
      message: 'SMS 읽기 기능은 Android에서만 지원됩니다.',
    };
  }

  try {
    const hasPermission = await checkRealSMSPermission();
    
    if (hasPermission) {
      return {
        hasPermission: true,
        canRequest: false,
        message: 'SMS 읽기 권한이 이미 허용되었습니다.',
      };
    } else {
      return {
        hasPermission: false,
        canRequest: true,
        message: 'SMS 읽기 권한이 필요합니다. 권한을 요청하시겠습니까?',
      };
    }
  } catch (error) {
    return {
      hasPermission: false,
      canRequest: false,
      message: '권한 확인 중 오류가 발생했습니다.',
    };
  }
};

/**
 * 개발자를 위한 SMS 테스트 유틸리티
 */
export const SMSTestUtils = {
  /**
   * 권한 상태 테스트
   */
  async testPermissions() {
    console.log('=== SMS 권한 테스트 시작 ===');
    
    const status = await checkSMSPermissionStatus();
    console.log('권한 상태:', status);
    
    if (status.canRequest) {
      console.log('권한 요청 테스트...');
      const granted = await requestRealSMSPermission();
      console.log('권한 요청 결과:', granted);
    }
    
    console.log('=== SMS 권한 테스트 완료 ===');
    return status;
  },

  /**
   * SMS 읽기 테스트
   */
  async testReadSMS() {
    console.log('=== SMS 읽기 테스트 시작 ===');
    
    try {
      const messages = await readRealSMSMessages();
      console.log(`SMS 읽기 성공: ${messages.length}개 메시지`);
      messages.forEach((msg, index) => {
        console.log(`메시지 ${index + 1}:`, {
          발신자: msg.address,
          내용: msg.body.substring(0, 50) + '...',
          날짜: msg.date.toLocaleString(),
        });
      });
      return messages;
    } catch (error) {
      console.error('SMS 읽기 실패:', error);
      throw error;
    } finally {
      console.log('=== SMS 읽기 테스트 완료 ===');
    }
  },
};

// 개발 환경에서 전역 객체에 노출
if (__DEV__) {
  (global as any).SMSTestUtils = SMSTestUtils;
  console.log('realSMSService: SMSTestUtils가 전역 객체에 노출됨');
  console.log('사용법: SMSTestUtils.testPermissions(), SMSTestUtils.testReadSMS()');
}

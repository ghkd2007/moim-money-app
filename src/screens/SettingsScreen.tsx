// 설정 화면 컴포넌트
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { COLORS } from '../constants';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'switch' | 'action';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  destructive?: boolean;
}

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // 설정 항목들
  const settingSections = [
    {
      title: '그룹 관리',
      items: [
        {
          id: 'group_info',
          title: '그룹 정보',
          subtitle: '현재 그룹: 우리 모임',
          type: 'navigation' as const,
          onPress: () => Alert.alert('그룹 정보', '그룹 정보 화면으로 이동합니다.'),
        },
        {
          id: 'invite_members',
          title: '구성원 초대',
          subtitle: '새로운 구성원을 그룹에 초대하세요',
          type: 'navigation' as const,
          onPress: () => Alert.alert('구성원 초대', '구성원 초대 기능이 곧 추가됩니다.'),
        },
        {
          id: 'member_permissions',
          title: '구성원 권한',
          subtitle: '구성원별 권한을 관리하세요',
          type: 'navigation' as const,
          onPress: () => Alert.alert('구성원 권한', '권한 관리 화면으로 이동합니다.'),
        },
      ],
    },
    {
      title: '카테고리 설정',
      items: [
        {
          id: 'manage_categories',
          title: '카테고리 관리',
          subtitle: '수입/지출 카테고리를 추가하거나 편집하세요',
          type: 'navigation' as const,
          onPress: () => Alert.alert('카테고리 관리', '카테고리 관리 화면으로 이동합니다.'),
        },
        {
          id: 'category_budget',
          title: '카테고리별 예산',
          subtitle: '카테고리별 월 예산을 설정하세요',
          type: 'navigation' as const,
          onPress: () => Alert.alert('예산 설정', '예산 설정 화면으로 이동합니다.'),
        },
      ],
    },
    {
      title: '알림 설정',
      items: [
        {
          id: 'notifications',
          title: '푸시 알림',
          subtitle: '새로운 거래 및 업데이트 알림',
          type: 'switch' as const,
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
        {
          id: 'budget_alerts',
          title: '예산 초과 알림',
          subtitle: '카테고리별 예산 초과 시 알림',
          type: 'navigation' as const,
          onPress: () => Alert.alert('예산 알림', '예산 알림 설정 화면으로 이동합니다.'),
        },
      ],
    },
    {
      title: '보안 및 개인정보',
      items: [
        {
          id: 'biometric',
          title: '생체 인증',
          subtitle: '지문 또는 얼굴 인식으로 앱 잠금',
          type: 'switch' as const,
          value: biometricEnabled,
          onValueChange: setBiometricEnabled,
        },
        {
          id: 'privacy_policy',
          title: '개인정보 처리방침',
          type: 'navigation' as const,
          onPress: () => Alert.alert('개인정보 처리방침', '개인정보 처리방침을 확인합니다.'),
        },
        {
          id: 'terms_of_service',
          title: '서비스 이용약관',
          type: 'navigation' as const,
          onPress: () => Alert.alert('서비스 이용약관', '서비스 이용약관을 확인합니다.'),
        },
      ],
    },
    {
      title: '데이터 관리',
      items: [
        {
          id: 'auto_backup',
          title: '자동 백업',
          subtitle: '클라우드에 데이터 자동 백업',
          type: 'switch' as const,
          value: autoBackupEnabled,
          onValueChange: setAutoBackupEnabled,
        },
        {
          id: 'export_data',
          title: '데이터 내보내기',
          subtitle: 'Excel 파일로 거래 내역 내보내기',
          type: 'navigation' as const,
          onPress: () => Alert.alert('데이터 내보내기', '데이터 내보내기 기능이 곧 추가됩니다.'),
        },
        {
          id: 'import_data',
          title: '데이터 가져오기',
          subtitle: '다른 가계부 앱에서 데이터 가져오기',
          type: 'navigation' as const,
          onPress: () => Alert.alert('데이터 가져오기', '데이터 가져오기 기능이 곧 추가됩니다.'),
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          id: 'profile',
          title: '프로필 편집',
          subtitle: '이름, 프로필 사진 변경',
          type: 'navigation' as const,
          onPress: () => Alert.alert('프로필 편집', '프로필 편집 화면으로 이동합니다.'),
        },
        {
          id: 'change_password',
          title: '비밀번호 변경',
          type: 'navigation' as const,
          onPress: () => Alert.alert('비밀번호 변경', '비밀번호 변경 화면으로 이동합니다.'),
        },
        {
          id: 'logout',
          title: '로그아웃',
          type: 'action' as const,
          destructive: true,
          onPress: () => {
            Alert.alert(
              '로그아웃',
              '정말 로그아웃하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                { text: '로그아웃', style: 'destructive', onPress: async () => {
                  try {
                    await logout();
                    // 로그아웃 성공 시 앱이 자동으로 로그인 화면으로 이동합니다
                  } catch (error) {
                    console.error('로그아웃 실패:', error);
                    Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
                  }
                }},
              ]
            );
          },
        },
        {
          id: 'delete_account',
          title: '계정 삭제',
          subtitle: '모든 데이터가 영구적으로 삭제됩니다',
          type: 'action' as const,
          destructive: true,
          onPress: () => {
            Alert.alert(
              '계정 삭제',
              '정말 계정을 삭제하시겠습니까?\n\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
              [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: () => {
                  Alert.alert('계정 삭제', '계정 삭제 기능이 곧 추가됩니다.');
                }},
              ]
            );
          },
        },
      ],
    },
    {
      title: '자동화',
      items: [
        {
          id: 'sms_auto',
          title: 'SMS 자동 지출 추가',
          subtitle: '은행/카드사 메시지에서 지출 자동 인식',
          type: 'navigation' as const,
          onPress: () => Alert.alert('SMS 자동 추가', '홈 화면의 "SMS 자동 추가" 버튼을 사용하세요.'),
        },
        {
          id: 'notification',
          title: '알림 설정',
          subtitle: '푸시 알림 및 SMS 알림 설정',
          type: 'navigation' as const,
          onPress: () => Alert.alert('알림 설정', '알림 설정 기능이 곧 추가됩니다.'),
        },
      ],
    },
    {
      title: '앱 정보',
      items: [
        {
          id: 'version',
          title: '앱 버전',
          subtitle: '1.0.0',
          type: 'navigation' as const,
          onPress: () => Alert.alert('앱 버전', '현재 버전: 1.0.0\n최신 버전입니다.'),
        },
        {
          id: 'feedback',
          title: '피드백 보내기',
          subtitle: '개선사항이나 문제점을 알려주세요',
          type: 'navigation' as const,
          onPress: () => Alert.alert('피드백', '피드백 기능이 곧 추가됩니다.'),
        },
        {
          id: 'contact',
          title: '고객지원',
          subtitle: 'support@moimoney.com',
          type: 'navigation' as const,
          onPress: () => Alert.alert('고객지원', '고객지원 센터로 연결됩니다.'),
        },
      ],
    },
  ];

  // 설정 항목 렌더링
  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          item.destructive && styles.destructiveItem,
        ]}
        onPress={item.onPress}
        disabled={item.type === 'switch'}
      >
        <View style={styles.settingContent}>
          <Text style={[
            styles.settingTitle,
            item.destructive && styles.destructiveText,
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        
        <View style={styles.settingAction}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#F1F5F9', true: COLORS.primary }}
              thumbColor={item.value ? COLORS.surface : '#94A3B8'}
            />
          )}
          {item.type === 'navigation' && (
            <Text style={styles.chevron}>›</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item) => renderSettingItem(item))}
            </View>
          </View>
        ))}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  destructiveItem: {
    // 위험한 작업 항목의 추가 스타일은 여기에
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  destructiveText: {
    color: '#DC2626',
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SettingsScreen;
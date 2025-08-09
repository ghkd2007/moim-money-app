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
import { logout, getCurrentUser } from '../services/authService';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'switch' | 'action';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  destructive?: boolean;
  icon?: string;
}

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const currentUser = getCurrentUser();

  /**
   * 로그아웃 처리
   */
  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
    }
  };

  // 설정 항목들 (간소화)
  const settingSections = [
    {
      title: '계정',
      items: [
        {
          id: 'profile',
          title: '프로필',
          subtitle: currentUser?.displayName || currentUser?.email || '사용자',
          type: 'navigation' as const,
          icon: '👤',
          onPress: () => Alert.alert('프로필', '프로필 편집 기능이 곧 추가됩니다.'),
        },
        {
          id: 'change_password',
          title: '비밀번호 변경',
          subtitle: '보안을 위해 정기적으로 변경하세요',
          type: 'navigation' as const,
          icon: '🔑',
          onPress: () => Alert.alert('비밀번호 변경', '비밀번호 변경 기능이 곧 추가됩니다.'),
        },
      ],
    },
    {
      title: '알림',
      items: [
        {
          id: 'notifications',
          title: '푸시 알림',
          subtitle: '새로운 거래 및 업데이트 알림',
          type: 'switch' as const,
          icon: '🔔',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
      ],
    },
    {
      title: '보안',
      items: [
        {
          id: 'biometric',
          title: '생체 인증',
          subtitle: '지문 또는 얼굴 인식으로 앱 보안 강화',
          type: 'switch' as const,
          icon: '🔐',
          value: biometricEnabled,
          onValueChange: setBiometricEnabled,
        },
      ],
    },
    {
      title: '데이터',
      items: [
        {
          id: 'export_data',
          title: '데이터 내보내기',
          subtitle: 'Excel 파일로 거래 내역 내보내기',
          type: 'navigation' as const,
          icon: '📊',
          onPress: () => Alert.alert('데이터 내보내기', '데이터 내보내기 기능이 곧 추가됩니다.'),
        },
        {
          id: 'backup',
          title: '백업 및 복원',
          subtitle: '데이터를 안전하게 백업하고 복원',
          type: 'navigation' as const,
          icon: '☁️',
          onPress: () => Alert.alert('백업', '백업 기능이 곧 추가됩니다.'),
        },
      ],
    },
    {
      title: '지원',
      items: [
        {
          id: 'feedback',
          title: '피드백 보내기',
          subtitle: '개선사항이나 문제점을 알려주세요',
          type: 'navigation' as const,
          icon: '💬',
          onPress: () => Alert.alert('피드백', '피드백 기능이 곧 추가됩니다.'),
        },
        {
          id: 'privacy_policy',
          title: '개인정보 처리방침',
          type: 'navigation' as const,
          icon: '📋',
          onPress: () => Alert.alert('개인정보 처리방침', '개인정보 처리방침을 확인합니다.'),
        },
        {
          id: 'terms_of_service',
          title: '서비스 이용약관',
          type: 'navigation' as const,
          icon: '📄',
          onPress: () => Alert.alert('서비스 이용약관', '서비스 이용약관을 확인합니다.'),
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
          icon: 'ℹ️',
          onPress: () => Alert.alert('앱 버전', '현재 버전: 1.0.0\n최신 버전입니다.'),
        },
      ],
    },
    {
      title: '계정 관리',
      items: [
        {
          id: 'logout',
          title: '로그아웃',
          type: 'action' as const,
          icon: '🚪',
          onPress: () => {
            Alert.alert(
              '로그아웃',
              '정말 로그아웃하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                { text: '로그아웃', style: 'destructive', onPress: handleLogout },
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
          icon: '⚠️',
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
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          {item.icon && (
            <Text style={styles.settingIcon}>{item.icon}</Text>
          )}
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
        </View>
        
        <View style={styles.settingAction}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#E2E8F0', true: COLORS.primary }}
              thumbColor={item.value ? COLORS.surface : '#94A3B8'}
              ios_backgroundColor="#E2E8F0"
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
              {section.items.map((item, index) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {index < section.items.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  destructiveItem: {
    // 위험한 작업 항목의 추가 스타일은 여기에
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
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
    lineHeight: 20,
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
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 56, // 아이콘 + 여백만큼 들여쓰기
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SettingsScreen;
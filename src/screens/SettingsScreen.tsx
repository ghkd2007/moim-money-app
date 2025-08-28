// 설정 화면 컴포넌트 - Dribbble 스타일 다크 테마
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { CommonStyles, Spacing, BorderRadius } from '../styles/commonStyles';
import { logout } from '../services/authService';

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
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      console.log('로그아웃 시작...');
      await logout();
      console.log('로그아웃 성공');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      if (typeof window !== 'undefined' && window.confirm) {
        window.confirm('로그아웃 중 오류가 발생했습니다.');
      } else {
        Alert.alert(
          '오류',
          '로그아웃 중 오류가 발생했습니다.',
          [{ text: '확인', style: 'default' }]
        );
      }
    }
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: '알림',
      items: [
        {
          id: 'push_notifications',
          title: '푸시 알림',
          subtitle: '거래 내역 및 예산 알림 받기',
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
        {
          id: 'email_notifications',
          title: '이메일 알림',
          subtitle: '주간/월간 리포트 이메일 받기',
          type: 'navigation',
          onPress: () => Alert.alert('알림', '이메일 알림 설정 기능이 곧 추가됩니다!'),
        },
      ],
    },
    {
      title: '보안',
      items: [
        {
          id: 'biometric',
          title: '생체 인증',
          subtitle: '지문 또는 Face ID로 앱 잠금',
          type: 'switch',
          value: biometricEnabled,
          onValueChange: setBiometricEnabled,
        },
        {
          id: 'change_password',
          title: '비밀번호 변경',
          type: 'navigation',
          onPress: () => Alert.alert('알림', '비밀번호 변경 기능이 곧 추가됩니다!'),
        },
      ],
    },
    {
      title: '데이터',
      items: [
        {
          id: 'export_data',
          title: '데이터 내보내기',
          subtitle: 'Excel 또는 CSV 형식으로 내보내기',
          type: 'navigation',
          onPress: () => Alert.alert('알림', '데이터 내보내기 기능이 곧 추가됩니다!'),
        },
        {
          id: 'backup',
          title: '백업 및 동기화',
          subtitle: '클라우드 백업 설정',
          type: 'navigation',
          onPress: () => Alert.alert('알림', '백업 기능이 곧 추가됩니다!'),
        },
      ],
    },
    {
      title: '정보',
      items: [
        {
          id: 'version',
          title: '앱 버전',
          subtitle: '1.0.0',
          type: 'navigation',
          onPress: () => {},
        },
        {
          id: 'terms',
          title: '이용약관',
          type: 'navigation',
          onPress: () => Alert.alert('알림', '이용약관 페이지가 곧 추가됩니다!'),
        },
        {
          id: 'privacy',
          title: '개인정보처리방침',
          type: 'navigation',
          onPress: () => Alert.alert('알림', '개인정보처리방침 페이지가 곧 추가됩니다!'),
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          id: 'logout',
          title: '로그아웃',
          type: 'action',
          destructive: true,
          onPress: () => {
            Alert.alert(
              '로그아웃',
              '정말로 로그아웃 하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                { text: '로그아웃', style: 'destructive', onPress: handleLogout },
              ]
            );
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'switch'}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemContent}>
          <View style={styles.settingItemText}>
            <Text style={[
              styles.settingItemTitle,
              item.destructive && styles.destructiveText
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          
          <View style={styles.settingItemAction}>
            {item.type === 'switch' && (
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={item.value ? '#FFFFFF' : COLORS.textSecondary}
                ios_backgroundColor={COLORS.border}
              />
            )}
            {item.type === 'navigation' && !item.destructive && (
              <Text style={styles.chevron}>⌄</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={CommonStyles.container}>
      {/* 헤더 */}
      <View style={CommonStyles.glassHeader}>
        <Text style={CommonStyles.title}>설정</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로필 카드 */}
        <View style={[CommonStyles.gradientCard, styles.profileCard]}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>👤</Text>
          </View>
          <Text style={[CommonStyles.gradientText, styles.profileName]}>사용자</Text>
          <Text style={[CommonStyles.gradientText, styles.profileEmail]}>user@example.com</Text>
        </View>

        {/* 설정 섹션들 */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={CommonStyles.card}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  {renderSettingItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  profileCard: {
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  
  profileIconText: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  profileEmail: {
    fontSize: 16,
    opacity: 0.8,
  },
  
  section: {
    marginTop: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  
  settingItem: {
    paddingVertical: Spacing.md,
  },
  
  settingItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  settingItemText: {
    flex: 1,
  },
  
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  
  settingItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  
  destructiveText: {
    color: COLORS.danger,
  },
  
  settingItemAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  chevron: {
    fontSize: 16,
    color: COLORS.textSecondary,
    transform: [{ rotate: '-90deg' }],
  },
  
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  
  bottomSpacing: {
    height: 100,
  },
});

export default SettingsScreen;
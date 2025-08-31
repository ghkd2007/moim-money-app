// 설정 화면 컴포넌트 - Dribbble 스타일 다크 테마
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { CommonStyles, Spacing, BorderRadius } from '../styles/commonStyles';
import { logout, getCurrentUser } from '../services/authService';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ExcelExportModal from '../components/ExcelExportModal';
import { useGlobalContext } from '../../App';

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
  const [userInfo, setUserInfo] = useState<{
    email: string;
    displayName: string;
  } | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showExcelExportModal, setShowExcelExportModal] = useState(false);
  
  const { currentGroup } = useGlobalContext();

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = () => {
      const user = getCurrentUser();
      if (user) {
        setUserInfo({
          email: user.email || '이메일 없음',
          displayName: user.displayName || user.email?.split('@')[0] || '사용자',
        });
      }
    };

    loadUserInfo();
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert(
        '오류',
        '로그아웃 중 오류가 발생했습니다.',
        [{ text: '확인', style: 'default' }]
      );
    }
  };

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: '데이터',
      items: [
        {
          id: 'export_excel',
          title: '엑셀 내보내기',
          subtitle: '거래내역을 엑셀 파일로 내보내기',
          type: 'navigation',
          onPress: () => setShowExcelExportModal(true),
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
      ],
    },
    {
      title: '계정',
      items: [
        {
          id: 'change_password',
          title: '비밀번호 변경',
          subtitle: '현재 비밀번호를 변경합니다',
          type: 'navigation',
          onPress: () => setShowChangePasswordModal(true),
        },
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
            {item.type === 'navigation' && !item.destructive && (
              <Text style={styles.chevron}>→</Text>
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
          <Text style={[CommonStyles.gradientText, styles.profileName]}>
            {userInfo?.displayName || '사용자'}
          </Text>
          <Text style={[CommonStyles.gradientText, styles.profileEmail]}>
            {userInfo?.email || 'user@example.com'}
          </Text>
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

      {/* 비밀번호 변경 모달 */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* 엑셀 내보내기 모달 */}
      <ExcelExportModal
        visible={showExcelExportModal}
        onClose={() => setShowExcelExportModal(false)}
        currentGroup={currentGroup}
      />
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
    fontWeight: '500',
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
// 모임 화면 컴포넌트 - Dribbble 스타일 다크 테마
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { CommonStyles, Spacing, BorderRadius } from '../styles/commonStyles';
import { formatCurrency } from '../utils';
import { Group, Transaction } from '../types';
import { groupService, transactionService } from '../services/dataService';
import { getCurrentUser } from '../services/authService';
import CategoryManagementModal from '../components/CategoryManagementModal';

const GroupScreen: React.FC = () => {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expense: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    loadGroupData();
  }, []);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user) return;

      const groups = await groupService.getByUser(user.uid);
      if (groups.length > 0) {
        const group = groups[0];
        setCurrentGroup(group);

        // 이번 달 통계 로드
        const now = new Date();
        const transactions = await transactionService.getByMonth(
          group.id,
          now.getFullYear(),
          now.getMonth() + 1
        );

        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setMonthlyStats({
          income,
          expense,
          transactionCount: transactions.length,
        });
      }
    } catch (error) {
      console.error('그룹 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={CommonStyles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={CommonStyles.caption}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentGroup) {
    return (
      <SafeAreaView style={CommonStyles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={CommonStyles.subtitle}>모임이 없습니다</Text>
          <Text style={CommonStyles.caption}>새로운 모임을 만들어보세요!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={CommonStyles.container}>
      {/* 헤더 */}
      <View style={CommonStyles.glassHeader}>
        <Text style={CommonStyles.title}>{currentGroup.name}</Text>
        <View style={styles.memberBadge}>
          <Text style={styles.memberIcon}>👥</Text>
          <Text style={styles.memberText}>{currentGroup.members?.length || 1}명</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 이번 달 통계 카드 */}
        <View style={[CommonStyles.gradientCard, styles.statsCard]}>
          <Text style={[CommonStyles.gradientText, styles.statsTitle]}>이번 달 활동</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>↗</Text>
              <Text style={[CommonStyles.gradientText, styles.statValue]}>
                {formatCurrency(monthlyStats.income)}
              </Text>
              <Text style={[CommonStyles.gradientText, styles.statLabel]}>수입</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>↘</Text>
              <Text style={[CommonStyles.gradientText, styles.statValue]}>
                {formatCurrency(monthlyStats.expense)}
              </Text>
              <Text style={[CommonStyles.gradientText, styles.statLabel]}>지출</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={[CommonStyles.gradientText, styles.statValue]}>
                {monthlyStats.transactionCount}
              </Text>
              <Text style={[CommonStyles.gradientText, styles.statLabel]}>거래</Text>
            </View>
          </View>
        </View>

        {/* 멤버 리스트 */}
        <View style={styles.memberSection}>
          <Text style={styles.sectionTitle}>모임 멤버</Text>
          <View style={CommonStyles.card}>
            <View style={styles.memberItem}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>👤</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>나 (모임장)</Text>
                <Text style={styles.memberRole}>관리자</Text>
              </View>
              <View style={styles.memberStatus}>
                <Text style={styles.statusDot}>●</Text>
              </View>
            </View>
            
            {currentGroup?.members && currentGroup.members.length > 1 && 
              currentGroup.members.slice(1).map((member, index) => (
                <View key={index}>
                  <View style={styles.separator} />
                  <View style={styles.memberItem}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>👤</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.displayName || '멤버'}</Text>
                      <Text style={styles.memberRole}>일반 멤버</Text>
                    </View>
                    <View style={styles.memberStatus}>
                      <Text style={styles.statusDot}>●</Text>
                    </View>
                  </View>
                </View>
              ))
            }
          </View>
        </View>

        {/* 관리 메뉴 */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>모임 관리</Text>
          
          <TouchableOpacity 
            style={CommonStyles.card}
            onPress={() => setShowCategoryModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Text style={styles.menuIconText}>🏷️</Text>
                </View>
                <View>
                  <Text style={styles.menuTitle}>카테고리 관리</Text>
                  <Text style={styles.menuSubtitle}>지출 카테고리 추가/편집</Text>
                </View>
              </View>
              <Text style={styles.chevron}>⌄</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={CommonStyles.card}
            onPress={() => Alert.alert('알림', '멤버 관리 기능이 곧 추가됩니다!')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Text style={styles.menuIconText}>👥</Text>
                </View>
                <View>
                  <Text style={styles.menuTitle}>멤버 관리</Text>
                  <Text style={styles.menuSubtitle}>모임 멤버 초대/관리</Text>
                </View>
              </View>
              <Text style={styles.chevron}>⌄</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={CommonStyles.card}
            onPress={() => Alert.alert('알림', '모임 설정 기능이 곧 추가됩니다!')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Text style={styles.menuIconText}>⚙️</Text>
                </View>
                <View>
                  <Text style={styles.menuTitle}>모임 설정</Text>
                  <Text style={styles.menuSubtitle}>모임 정보 및 권한 설정</Text>
                </View>
              </View>
              <Text style={styles.chevron}>⌄</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 카테고리 관리 모달 */}
      {currentGroup && (
        <CategoryManagementModal
          visible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          groupId={currentGroup.id}
          onCategoryChange={loadGroupData}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassStrong,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  
  memberIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  
  memberText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  
  statsCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  statItem: {
    alignItems: 'center',
  },
  
  statIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  
  memberSection: {
    marginTop: Spacing.xl,
  },
  
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  
  memberAvatarText: {
    fontSize: 20,
    color: COLORS.text,
  },
  
  memberInfo: {
    flex: 1,
  },
  
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  
  memberRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  memberStatus: {
    alignItems: 'center',
  },
  
  statusDot: {
    fontSize: 12,
    color: COLORS.success,
  },
  
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: Spacing.sm,
  },
  
  menuSection: {
    marginTop: Spacing.xl,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  
  menuIconText: {
    fontSize: 20,
  },
  
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  chevron: {
    fontSize: 16,
    color: COLORS.textSecondary,
    transform: [{ rotate: '-90deg' }],
  },
  
  bottomSpacing: {
    height: 100,
  },
});

export default GroupScreen;
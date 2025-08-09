// 홈 화면 컴포넌트 - Design Blueprint 준수
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { COLORS, SCREEN } from '../constants';
import { formatCurrency, formatDate, formatDateShort } from '../utils';
import { Transaction, Group } from '../types';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  // 네비게이션 props는 나중에 추가
}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  // 상태 관리
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState({ income: 0, expense: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHomeData();
  }, []);

  /**
   * 홈 화면 데이터 로드
   */
  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // TODO: 실제 데이터 로드 구현
      // 현재는 더미 데이터로 대체
      setCurrentGroup({
        id: '1',
        name: '우리 가족',
        description: '가족 공동 가계부',
        createdBy: 'user1',
        members: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      setMonthlyTotal({
        income: 1500000,
        expense: 1200000,
      });
      
      setRecentTransactions([
        {
          id: '1',
          amount: 50000,
          type: 'expense',
          categoryId: 'food',
          memo: '저녁 식사',
          date: new Date(),
          groupId: '1',
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          amount: 300000,
          type: 'income',
          categoryId: 'salary',
          memo: '용돈',
          date: new Date(Date.now() - 86400000),
          groupId: '1',
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      
    } catch (error) {
      console.error('홈 데이터 로드 오류:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 빠른 추가 버튼 클릭 핸들러
   */
  const handleQuickAdd = () => {
    // TODO: 빠른 추가 모달 열기
    Alert.alert('빠른 추가', '빠른 추가 기능이 곧 추가됩니다!');
  };

  /**
   * 모임 스위처 클릭 핸들러
   */
  const handleGroupSwitch = () => {
    // TODO: 모임 목록 화면으로 이동
    Alert.alert('모임 전환', '모임 전환 기능이 곧 추가됩니다!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.groupSwitcher} onPress={handleGroupSwitch}>
          <Text style={styles.groupName}>
            {currentGroup?.name || '모임 선택'}
          </Text>
          <Text style={styles.switchIcon}>⌄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 이번 달 수입/지출 카드 */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statLabel}>이번 달 수입</Text>
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(monthlyTotal.income)}
            </Text>
            <Text style={styles.statChange}>+12.5% 지난달 대비</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>💸</Text>
              <Text style={styles.statLabel}>이번 달 지출</Text>
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(monthlyTotal.expense)}
            </Text>
            <Text style={styles.statChange}>-3.2% 지난달 대비</Text>
          </View>
        </View>

        {/* 현재 지출현황 카드 */}
        <View style={styles.expenseStatusCard}>
          <View style={styles.expenseHeader}>
            <Text style={styles.expenseTitle}>현재 지출현황</Text>
            <Text style={styles.expenseDate}>{formatDate(new Date())}</Text>
          </View>
          
          <Text style={styles.expenseAmount}>
            {formatCurrency(monthlyTotal.expense)}
          </Text>
          
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseLabel}>남은 예산</Text>
            <Text style={styles.remainingBudget}>
              {formatCurrency(1200000 - monthlyTotal.expense)}
            </Text>
          </View>
        </View>

        {/* 예산 진행률 */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>월 예산 진행률</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '68%' }]} />
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>68%</Text>
            <Text style={styles.progressBudget}>₩1,200,000 중 ₩820,000</Text>
          </View>
        </View>

        {/* 빠른 기록 버튼 */}
        <TouchableOpacity style={styles.quickAddButton} onPress={handleQuickAdd}>
          <Text style={styles.quickAddIcon}>➕</Text>
          <Text style={styles.quickAddText}>빠른 기록</Text>
        </TouchableOpacity>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // 기본 컨테이너
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // 상단 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  groupSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  switchIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // 스크롤 컨텐츠
  scrollContent: {
    flex: 1,
  },

  // 통계 카드들
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },

  // 현재 지출현황 카드
  expenseStatusCard: {
    margin: 20,
    marginTop: 16,
    padding: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  expenseDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.expense,
    marginBottom: 16,
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  expenseLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  remainingBudget: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.income,
  },

  // 예산 진행률 카드
  progressCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBudget: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // 빠른 기록 버튼
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickAddIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  quickAddText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.surface,
  },

  // 하단 여백
  bottomSpacing: {
    height: 100, // 탭 바 공간 확보
  },
});

export default HomeScreen;

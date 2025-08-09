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
import QuickAddModal from '../components/QuickAddModal';
import DailyTransactionModal from '../components/DailyTransactionModal';
import { transactionService, groupService } from '../services/dataService';
import { getCurrentUser, logout } from '../services/authService';

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
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
      
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // 사용자가 속한 그룹 목록 조회 (첫 번째 그룹 사용)
      const groups = await groupService.getByUser(user.uid);
      if (groups.length > 0) {
        const group = groups[0];
        setCurrentGroup(group);

        // 해당 그룹의 거래 내역 조회
        const transactions = await transactionService.getByGroup(group.id, 50);
        setRecentTransactions(transactions);

        // 이번 달 통계 계산
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        const monthlyTransactions = await transactionService.getByMonth(
          group.id, 
          currentYear, 
          currentMonth
        );

        const income = monthlyTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthlyTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setMonthlyTotal({ income, expense });
      } else {
        // 그룹이 없는 경우는 이제 GroupSelectionScreen에서 처리
        setMonthlyTotal({ income: 0, expense: 0 });
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      
      // Firebase 연결 실패 시 더미 데이터로 대체
      setCurrentGroup({
        id: 'demo',
        name: '데모 그룹',
        members: ['demo-user'],
        createdAt: new Date(),
      });
      
      setMonthlyTotal({ income: 2800000, expense: 820000 });
      setRecentTransactions([]);
      
      Alert.alert('알림', 'Firebase 연결 실패로 데모 모드로 실행됩니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 빠른 추가 버튼 클릭 핸들러
   */
  const handleQuickAdd = () => {
    setShowQuickAddModal(true);
  };

  /**
   * 빠른 추가 저장 핸들러
   */
  const handleQuickAddSave = async (transaction: {
    amount: number;
    type: 'income' | 'expense';
    categoryId: string;
    memo: string;
  }) => {
    try {
      const user = getCurrentUser();
      if (!user || !currentGroup) {
        Alert.alert('오류', '로그인이 필요하거나 그룹이 없습니다.');
        return;
      }

      // Firebase에 거래 내역 저장
      const transactionId = await transactionService.create({
        amount: transaction.amount,
        type: transaction.type,
        categoryId: transaction.categoryId,
        memo: transaction.memo,
        date: new Date(),
        groupId: currentGroup.id,
        userId: user.uid,
      });

      // 새로운 거래 내역 객체 생성
      const newTransaction: Transaction = {
        id: transactionId,
        amount: transaction.amount,
        type: transaction.type,
        categoryId: transaction.categoryId,
        memo: transaction.memo,
        date: new Date(),
        groupId: currentGroup.id,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // UI 즉시 업데이트
      setRecentTransactions([newTransaction, ...recentTransactions]);

      // 월별 합계 업데이트
      if (transaction.type === 'income') {
        setMonthlyTotal(prev => ({
          ...prev,
          income: prev.income + transaction.amount,
        }));
      } else {
        setMonthlyTotal(prev => ({
          ...prev,
          expense: prev.expense + transaction.amount,
        }));
      }

      // 모달 닫기
      setShowQuickAddModal(false);
      Alert.alert('완료', '거래 내역이 저장되었습니다!');
    } catch (error) {
      console.error('거래 내역 저장 실패:', error);
      Alert.alert('오류', '거래 내역을 저장하는 중 오류가 발생했습니다.');
    }
  };

  /**
   * 모임 스위처 클릭 핸들러
   */
  const handleGroupSwitch = () => {
    // TODO: 모임 목록 화면으로 이동
    Alert.alert('모임 전환', '모임 전환 기능이 곧 추가됩니다!');
  };

  /**
   * 날짜 클릭 핸들러 (거래 내역이 있는 날짜)
   */
  const handleDateClick = (date: Date) => {
    // 해당 날짜에 거래 내역이 있는지 확인
    const hasTransaction = recentTransactions.some(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.toDateString() === date.toDateString();
    });

    if (hasTransaction) {
      setSelectedDate(date);
      setShowDailyModal(true);
    }
  };

  /**
   * 임시 로그아웃 핸들러 (개발용)
   */
  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
    }
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
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
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



        {/* 미니 달력 */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>이번 달 거래 현황</Text>
            <Text style={styles.calendarMonth}>{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</Text>
          </View>
          
          {/* 요일 헤더 */}
          <View style={styles.weekHeader}>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <Text key={index} style={styles.weekDay}>{day}</Text>
            ))}
          </View>
          
          {/* 월간 달력 */}
          <View style={styles.monthCalendar}>
            {(() => {
              const today = new Date();
              const year = today.getFullYear();
              const month = today.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const startDate = new Date(firstDay);
              startDate.setDate(startDate.getDate() - firstDay.getDay());
              
              const days = [];
              const endDate = new Date(startDate);
              endDate.setDate(endDate.getDate() + 34); // 5주
              
              for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                days.push(new Date(date));
              }
              
              return days.map((date, index) => {
                const isCurrentMonth = date.getMonth() === month;
                const isToday = date.toDateString() === today.toDateString();
                // 실제 거래 내역 데이터로 확인
                const hasTransaction = isCurrentMonth && recentTransactions.some(transaction => {
                  const transactionDate = new Date(transaction.date);
                  return transactionDate.toDateString() === date.toDateString();
                });
                
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.miniDayCell}
                    onPress={() => handleDateClick(date)}
                    disabled={!hasTransaction}
                    activeOpacity={hasTransaction ? 0.7 : 1}
                  >
                    <View style={[
                      styles.miniDay,
                      !isCurrentMonth && styles.otherMonthDay,
                      isToday && styles.todayMiniCell,
                    ]}>
                      <Text style={[
                        styles.miniDayNumber,
                        !isCurrentMonth && styles.otherMonthText,
                        isToday && styles.todayMiniNumber,
                      ]}>
                        {date.getDate()}
                      </Text>
                      {hasTransaction && (
                        <View style={styles.miniTransactionDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              });
            })()}
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

      {/* 빠른 기록 모달 */}
      <QuickAddModal
        visible={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSave={handleQuickAddSave}
      />

      {/* 날짜별 거래 내역 모달 */}
      <DailyTransactionModal
        visible={showDailyModal}
        onClose={() => setShowDailyModal(false)}
        selectedDate={selectedDate}
        transactions={recentTransactions}
      />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    marginRight: 8,
  },
  logoutText: {
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
    paddingBottom: 8,
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



  // 미니 달력 카드
  calendarCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  calendarMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  monthCalendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniDayCell: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniDay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  otherMonthDay: {
    backgroundColor: 'transparent',
  },
  todayMiniCell: {
    backgroundColor: '#E8F4FD', // 연한 파스텔 블루
    borderWidth: 2,
    borderColor: '#3B82F6', // 테두리로 오늘 날짜 강조
  },
  miniDayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  otherMonthText: {
    color: COLORS.textSecondary,
    opacity: 0.5,
  },
  todayMiniNumber: {
    color: '#1E40AF', // 진한 파란색으로 대비 강화
    fontWeight: '700', // 더 굵게
  },
  miniTransactionDot: {
    position: 'absolute',
    bottom: 1,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981', // 더 밝은 초록색
    borderWidth: 1,
    borderColor: '#FFFFFF', // 흰색 테두리로 대비 강화
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

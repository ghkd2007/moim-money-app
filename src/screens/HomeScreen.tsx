// 홈 화면 컴포넌트 - Design Blueprint 준수
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SCREEN } from '../constants';
import { formatCurrency, formatDate, formatDateShort } from '../utils';
import { Transaction, Group } from '../types';
import QuickAddModal from '../components/QuickAddModal';
import DailyTransactionModal from '../components/DailyTransactionModal';
import SMSAutoExpenseModal from '../components/SMSAutoExpenseModal';
import TransactionListModal from '../components/TransactionListModal';
import { Bell, DollarSign, Edit3, Smartphone, TrendingUp, TrendingDown, ChevronRight, Calendar, Receipt } from 'lucide-react-native';

import { transactionService, groupService, budgetService } from '../services/dataService';
import { getCurrentUser, logout } from '../services/authService';
import { useGlobalContext } from '../contexts/GlobalContext';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  // 네비게이션 props는 나중에 추가
}

const HomeScreen: React.FC<HomeScreenProps> = () => {
  // 전역 컨텍스트 사용
  const { triggerRefresh } = useGlobalContext();
  
  // 상태 관리
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState({ income: 0, expense: 0 });
  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showTransactionListModal, setShowTransactionListModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  
  // 예산 관련 상태
  const [budgetYear, setBudgetYear] = useState(new Date().getFullYear());
  const [budgetMonth, setBudgetMonth] = useState(new Date().getMonth() + 1);
  const [budgetSummary, setBudgetSummary] = useState<any>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadHomeData();
  }, [budgetYear, budgetMonth]);

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
      console.log('HomeScreen: 사용자 그룹 수:', groups.length);
      if (groups.length > 0) {
        const group = groups[0];
        console.log('HomeScreen: 선택된 그룹:', group.id, group.name);
        setCurrentGroup(group);



        // 이번 달 통계 계산
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        console.log('HomeScreen: 거래내역 조회 파라미터 - 그룹ID:', group.id, '년:', currentYear, '월:', currentMonth);
        const monthlyTransactions = await transactionService.getByMonth(
          group.id, 
          currentYear, 
          currentMonth
        );

        // monthlyTransactions 상태 설정
        console.log('HomeScreen: 월별 거래내역 로드됨:', monthlyTransactions.length, '개');
        setMonthlyTransactions(monthlyTransactions);

        const income = monthlyTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthlyTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        console.log('HomeScreen: 수입:', income, '지출:', expense);
        setMonthlyTotal({ income, expense });

        // 예산 데이터 로드
        const budgetSummary = await budgetService.getBudgetSummary(group.id, budgetYear, budgetMonth);
        setBudgetSummary(budgetSummary);
      } else {
        // 그룹이 없는 경우는 이제 GroupSelectionScreen에서 처리
        setMonthlyTotal({ income: 0, expense: 0 });
        setBudgetSummary(null);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      
      // Firebase 연결 실패 시 사용자에게 알림만 표시
      Alert.alert('연결 오류', 'Firebase 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
      
      // 더미 데이터 제거 - 실제 데이터만 사용
      setCurrentGroup(null);
      setMonthlyTotal({ income: 0, expense: 0 });
      setRecentTransactions([]);
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
  const handleQuickAddSave = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (currentGroup) {
        if (selectedTransaction) {
          // 수정 모드
          await transactionService.update(selectedTransaction.id, transactionData);
          Alert.alert('성공', '거래 내역이 수정되었습니다.');
        } else {
          // 새로 추가 모드
          await transactionService.create({
            ...transactionData,
            groupId: currentGroup.id,
            userId: getCurrentUser()?.uid || '',
          });
          Alert.alert('성공', '거래 내역이 추가되었습니다.');
        }
        
        // 데이터 새로고침
        loadHomeData();
        
        // 전역 새로고침 트리거 (모든 화면 업데이트)
        triggerRefresh();
        
        setShowQuickAddModal(false);
        setSelectedTransaction(null);
      }
    } catch (error) {
      Alert.alert('오류', '거래 내역 저장에 실패했습니다.');
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
    // 현재는 모든 날짜 클릭 시 모달 열기 (거래 내역 확인은 모달 내에서)
    setSelectedDate(date);
    setShowDailyModal(true);
  };

  /**
   * SMS에서 파싱된 지출 추가
   * @param parsedExpense 파싱된 지출 정보
   * @param shouldCloseModal 모달을 닫을지 여부 (기본값: false)
   */
  const handleSMSExpenseAdd = async (parsedExpense: any, shouldCloseModal: boolean = false) => {
    try {
      if (!currentGroup) {
        Alert.alert('오류', '그룹을 선택해주세요.');
        return;
      }

      const user = getCurrentUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // 지출 거래 생성
      const transaction = {
        groupId: currentGroup.id,
        userId: user.uid,
        type: 'expense' as const,
        amount: parsedExpense.amount,
        categoryId: 'sms_auto', // SMS 자동 인식 카테고리
        memo: parsedExpense.description,
        date: parsedExpense.date,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 거래 저장
      const transactionId = await transactionService.create(transaction);
      
      // 홈 데이터 새로고침
      await loadHomeData();
      
      // 전역 새로고침 트리거 (모든 화면 업데이트)
      triggerRefresh();
      
      // shouldCloseModal이 true일 때만 모달 닫기
      if (shouldCloseModal) {
        setShowSMSModal(false);
      }
      
      return transactionId; // 성공 시 ID 반환
      
    } catch (error) {
      console.error('SMS 지출 추가 실패:', error);
      Alert.alert('오류', '지출 추가 중 오류가 발생했습니다.');
      throw error; // 오류를 다시 던져서 상위에서 처리할 수 있도록
    }
  };

  // 거래 내역 수정/삭제 핸들러
  const handleEditTransaction = (transaction: Transaction) => {
    // 수정 모달 열기 (QuickAddModal을 수정 모드로 사용)
    setSelectedTransaction(transaction);
    setShowQuickAddModal(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    console.log('삭제 시도:', transactionId); // 디버깅 로그 추가
    
    Alert.alert(
      '거래 내역 삭제',
      '정말로 이 거래 내역을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('삭제 실행 중...'); // 디버깅 로그 추가
              
              if (currentGroup) {
                await transactionService.delete(transactionId);
                console.log('삭제 성공'); // 디버깅 로그 추가
                
                // 데이터 새로고침
                loadHomeData();
                
                // 전역 새로고침 트리거 (모든 화면 업데이트)
                triggerRefresh();
                
                Alert.alert('성공', '거래 내역이 삭제되었습니다.');
              } else {
                console.log('현재 그룹이 없음'); // 디버깅 로그 추가
                Alert.alert('오류', '그룹이 선택되지 않았습니다.');
              }
            } catch (error) {
              console.error('삭제 오류:', error); // 디버깅 로그 추가
              Alert.alert('오류', '거래 내역 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };


  // 예산 월 변경 핸들러
  const handleBudgetMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (budgetMonth === 1) {
        setBudgetMonth(12);
        setBudgetYear(budgetYear - 1);
      } else {
        setBudgetMonth(budgetMonth - 1);
      }
    } else {
      if (budgetMonth === 12) {
        setBudgetMonth(1);
        setBudgetYear(budgetYear + 1);
      } else {
        setBudgetMonth(budgetMonth + 1);
      }
    }
  };

  // 예산 저장 핸들러
  const handleBudgetSave = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      if (!currentGroup) {
        Alert.alert('오류', '그룹이 선택되지 않았습니다.');
        return;
      }

      await budgetService.createOrUpdateBudget(
        currentGroup.id,
        budgetYear,
        budgetMonth,
        parseInt(newBudgetAmount)
      );

      setEditingBudget(false);
      setNewBudgetAmount('');
      await loadHomeData();
      Alert.alert('성공', '예산이 설정되었습니다.');
    } catch (error) {
      console.error('예산 설정 실패:', error);
      Alert.alert('오류', '예산 설정에 실패했습니다.');
    }
  };

  // 예산 월 이름 가져오기
  const getBudgetMonthName = (month: number) => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[month - 1];
  };

  // 예산 진행률 색상 가져오기
  const getBudgetProgressColor = (spent: number, budget: number) => {
    const ratio = spent / budget;
    if (ratio >= 1) return '#DC2626'; // 빨간색 (초과)
    if (ratio >= 0.8) return '#F59E0B'; // 주황색 (경고)
    return '#10B981'; // 초록색 (정상)
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.groupSwitcher} onPress={handleGroupSwitch}>
          <Text style={styles.groupName}>
            {currentGroup?.name || '모임 선택'}
          </Text>
          <Text style={styles.switchIcon}>⌄</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={20} color={COLORS.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 월별 예산 카드 */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>이번 달 예산</Text>
            <View style={styles.monthNavigator}>
              <TouchableOpacity 
                style={styles.monthButton} 
                onPress={() => handleBudgetMonthChange('prev')}
              >
                <Text style={styles.monthButtonText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.currentMonthText}>
                {budgetYear}년 {getBudgetMonthName(budgetMonth)}
              </Text>
              <TouchableOpacity 
                style={styles.monthButton} 
                onPress={() => handleBudgetMonthChange('next')}
              >
                <Text style={styles.monthButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.budgetContent}>
            {editingBudget ? (
              <View style={styles.budgetEditContainer}>
                <TextInput
                  style={styles.budgetInput}
                  value={newBudgetAmount}
                  onChangeText={setNewBudgetAmount}
                  placeholder="예산 금액 입력"
                  keyboardType="numeric"
                  autoFocus
                />
                <View style={styles.budgetEditButtons}>
                  <TouchableOpacity
                    style={[styles.budgetButton, styles.cancelBudgetButton]}
                    onPress={() => {
                      setEditingBudget(false);
                      setNewBudgetAmount('');
                    }}
                  >
                    <Text style={styles.cancelBudgetButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.budgetButton, styles.saveBudgetButton]}
                    onPress={handleBudgetSave}
                  >
                    <Text style={styles.saveBudgetButtonText}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.budgetDisplay}>
                <View style={styles.budgetAmountSection}>
                  <Text style={styles.budgetAmountLabel}>설정된 예산</Text>
                  <Text style={styles.budgetAmount}>
                    {budgetSummary?.budget?.totalBudget ? formatCurrency(budgetSummary.budget.totalBudget) : '설정되지 않음'}
                  </Text>
                  <TouchableOpacity
                    style={styles.editBudgetButton}
                    onPress={() => setEditingBudget(true)}
                  >
                    <Text style={styles.editBudgetButtonText}>편집</Text>
                  </TouchableOpacity>
                </View>
                
                {budgetSummary?.budget?.totalBudget && budgetSummary.budget.totalBudget > 0 && (
                  <View style={styles.budgetProgressSection}>
                    <View style={styles.budgetProgressRow}>
                      <Text style={styles.budgetProgressLabel}>총 지출</Text>
                      <Text style={styles.budgetProgressValue}>{formatCurrency(budgetSummary.totalSpent)}</Text>
                    </View>
                    <View style={styles.budgetProgressRow}>
                      <Text style={styles.budgetProgressLabel}>남은 예산</Text>
                      <Text style={[
                        styles.budgetProgressValue,
                        { color: getBudgetProgressColor(budgetSummary.totalSpent, budgetSummary.budget.totalBudget) }
                      ]}>
                        {formatCurrency(budgetSummary.totalRemaining)}
                      </Text>
                    </View>
                    <View style={styles.budgetProgressBar}>
                      <View
                        style={[
                          styles.budgetProgressFill,
                          {
                            width: `${Math.min((budgetSummary.totalSpent / budgetSummary.budget.totalBudget) * 100, 100)}%`,
                            backgroundColor: getBudgetProgressColor(budgetSummary.totalSpent, budgetSummary.budget.totalBudget)
                          }
                        ]}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* 이번 달 수입/지출 카드 */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingUp size={24} color={COLORS.success} />
              <Text style={styles.statLabel}>이번 달 수입</Text>
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(monthlyTotal.income)}
            </Text>
            <Text style={styles.statChange}>+12.5% 지난달 대비</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <TrendingDown size={24} color={COLORS.danger} />
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
                
                // 해당 날짜의 거래 내역 확인
                const dayTransactions = monthlyTransactions.filter(transaction => {
                  const transactionDate = new Date(transaction.date);
                  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                  const nextDate = new Date(targetDate);
                  nextDate.setDate(nextDate.getDate() + 1);
                  
                  return transactionDate >= targetDate && transactionDate < nextDate;
                });
                
                const hasTransaction = dayTransactions.length > 0;
                
                return (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.miniDayCell}
                    onPress={() => handleDateClick(date)}
                    activeOpacity={0.7}
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
                      
                      {/* 거래 내역 표시 - 작은 점으로만 표시 */}
                      {hasTransaction && isCurrentMonth && (
                        <View style={styles.transactionDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              });
            })()}
          </View>
        </View>

        {/* 최근 거래내역 섹션 */}
        <View style={styles.recentTransactionsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Receipt size={20} color={COLORS.text} />
              <Text style={styles.sectionTitle}>최근 거래내역</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setShowTransactionListModal(true)}
            >
              <Text style={styles.viewAllText}>전체보기</Text>
              <ChevronRight size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {monthlyTransactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {monthlyTransactions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5) // 최근 5개만 표시
                .map((transaction, index) => (
                  <View key={transaction.id} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <View style={[
                        styles.transactionTypeIcon,
                        { backgroundColor: transaction.type === 'income' ? COLORS.success + '20' : COLORS.danger + '20' }
                      ]}>
                        {transaction.type === 'income' ? (
                          <TrendingUp size={16} color={COLORS.success} />
                        ) : (
                          <TrendingDown size={16} color={COLORS.danger} />
                        )}
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription}>
                          {transaction.description || transaction.memo || transaction.categoryId}
                        </Text>
                        {(transaction.description || transaction.memo) && (
                          <Text style={styles.transactionCategory}>
                            {transaction.categoryId}
                          </Text>
                        )}
                        <Text style={styles.transactionDate}>
                          {formatDate(new Date(transaction.date))} {new Date(transaction.date).toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: transaction.type === 'income' ? COLORS.success : COLORS.danger }
                    ]}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <View style={styles.emptyTransactions}>
              <Calendar size={32} color={COLORS.textSecondary} />
              <Text style={styles.emptyTransactionsText}>아직 거래내역이 없습니다</Text>
              <Text style={styles.emptyTransactionsSubtext}>플로팅 버튼을 눌러 첫 거래를 추가해보세요</Text>
              {/* 디버깅 정보 */}
              <Text style={styles.debugText}>
                그룹: {currentGroup?.name || '없음'} | 데이터: {monthlyTransactions.length}개
              </Text>
            </View>
          )}
        </View>

        {/* SMS 자동 지출 추가 버튼 */}
        <TouchableOpacity 
          style={styles.smsButton} 
          onPress={() => setShowSMSModal(true)}
        >
          <Smartphone size={20} color={COLORS.warning} style={styles.smsButtonIcon} />
          <Text style={styles.smsButtonText}>SMS 자동 추가</Text>
        </TouchableOpacity>



        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 빠른 기록 모달 */}
      <QuickAddModal
        visible={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        onSave={handleQuickAddSave}
        transactionToEdit={selectedTransaction}
      />

      {/* 날짜별 거래 내역 모달 */}
      <DailyTransactionModal
        visible={showDailyModal}
        onClose={() => setShowDailyModal(false)}
        selectedDate={selectedDate}
        transactions={monthlyTransactions}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* SMS 자동 지출 추가 모달 */}
      <SMSAutoExpenseModal
        visible={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        onExpenseAdd={handleSMSExpenseAdd}
      />

      {/* 거래내역 전체보기 모달 */}
      <TransactionListModal
        visible={showTransactionListModal}
        onClose={() => setShowTransactionListModal(false)}
        transactions={monthlyTransactions}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* 플로팅 기록하기 버튼 */}
      <TouchableOpacity style={styles.floatingButton} onPress={handleQuickAdd}>
        <Edit3 size={28} color="white" />
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // 기본 컨테이너
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
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
    borderBottomColor: COLORS.border,
    minHeight: 60,
  },
  groupSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  switchIcon: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
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


  // 스크롤 컨텐츠
  scrollContent: {
    flex: 1,
  },

  // 통계 카드들
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
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
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // 거래 내역 표시 점
  transactionDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF9800', // 오렌지 색상
  },
  otherMonthDay: {
    backgroundColor: 'transparent',
  },
  todayMiniCell: {
    backgroundColor: '#FFF3E0', // 따뜻한 오렌지 크림 배경
    borderWidth: 3,
    borderColor: '#FF9800', // 진한 오렌지 테두리로 오늘 날짜 강조
    elevation: 4,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    color: '#E65100', // 진한 오렌지로 대비 강화
    fontWeight: '800', // 더 굵게
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

  // 기록하기 버튼
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 12, // 하단 여백 줄임
    paddingVertical: 16, // 버튼 높이 줄임
    backgroundColor: COLORS.secondary, // 민트 톤으로 변경하여 더 부드럽게
    borderRadius: 16,
    elevation: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickAddIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  quickAddText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },

  // SMS 자동 지출 추가 버튼
  smsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.surfaceSecondary, // 다크 테마 배경
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B', // 진한 노간색 테두리
    elevation: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  smsButtonIcon: {
    marginRight: 10,
  },
  smsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text, // 다크 테마 텍스트
  },

  // 하단 여백
  bottomSpacing: {
    height: 120, // 플로팅 버튼 공간까지 확보
  },

  // 최근 거래내역 섹션
  recentTransactionsSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 4,
  },

  transactionsList: {
    gap: 12,
  },

  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  transactionTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  transactionInfo: {
    flex: 1,
  },

  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },

  transactionCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },

  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },

  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 32,
  },

  emptyTransactionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },

  emptyTransactionsSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  debugText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },



  // 예산 카드 스타일
  budgetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  currentMonthText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 80,
    textAlign: 'center',
  },
  budgetContent: {
    padding: 20,
  },
  budgetEditContainer: {
    gap: 16,
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: 'white',
  },
  budgetEditButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBudgetButton: {
    backgroundColor: '#94A3B8',
  },
  cancelBudgetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBudgetButton: {
    backgroundColor: COLORS.primary,
  },
  saveBudgetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  budgetDisplay: {
    gap: 20,
  },
  budgetAmountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetAmountLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    flex: 1,
    textAlign: 'center',
  },
  editBudgetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  editBudgetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  budgetProgressSection: {
    gap: 12,
  },
  budgetProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetProgressLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  budgetProgressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // 거래 내역이 있는 날짜 스타일
  hasTransactionDay: {
    backgroundColor: '#FFF3E0', // 따뜻한 오렌지 크림 배경
    borderWidth: 3,
    borderColor: '#FF9800', // 진한 오렌지 테두리로 오늘 날짜 강조
    elevation: 4,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // 거래 내역 표시 영역
  transactionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -12 }], // 중앙 정렬을 위해 절반 크기로 조정
    backgroundColor: '#FF9800', // 오렌지 색상
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionAmount: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  incomeAmount: {
    color: '#10B981', // 초록색
  },
  expenseAmount: {
    color: '#DC2626', // 빨간색
  },

  // 플로팅 기록하기 버튼
  floatingButton: {
    position: 'absolute',
    bottom: 100, // 탭 바 높이만큼 위로 이동
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 1000,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

});

export default HomeScreen;

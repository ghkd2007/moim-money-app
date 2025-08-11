// 달력 화면 컴포넌트
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { Transaction } from '../types';
import { getCurrentUser } from '../services/authService';
import { groupService, transactionService } from '../services/dataService';
import TransactionDetailModal from '../components/TransactionDetailModal';

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 거래 내역 수정/삭제 관련 상태
  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // 컴포넌트 마운트/언마운트 로깅
  useEffect(() => {
    console.log('CalendarScreen: 컴포넌트 마운트됨');
    return () => {
      console.log('CalendarScreen: 컴포넌트 언마운트됨');
    };
  }, []);

  // 실제 Firebase 데이터 로드
  useEffect(() => {
    console.log('CalendarScreen: useEffect 실행됨, currentDate:', currentDate);
    loadCalendarData();
  }, [currentDate]);

  /**
   * 달력 데이터 로드
   */
  const loadCalendarData = async () => {
    try {
      console.log('CalendarScreen: loadCalendarData 시작');
      setLoading(true);
      
      const user = getCurrentUser();
      if (!user) {
        console.log('CalendarScreen: 사용자 정보 없음');
        return;
      }
      
      console.log('CalendarScreen: 사용자 정보:', user);

      const groups = await groupService.getByUser(user.uid);
      console.log('CalendarScreen: 조회된 그룹:', groups);
      
      if (groups.length > 0) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        console.log(`CalendarScreen: ${year}년 ${month}월 데이터 조회 시작`);
        
        const monthTransactions = await transactionService.getByMonth(groups[0].id, year, month);
        console.log('CalendarScreen: 조회된 거래 내역:', monthTransactions);
        
        setTransactions(monthTransactions);
        console.log('CalendarScreen: transactions 상태 업데이트 완료, 개수:', monthTransactions.length);
      } else {
        console.log('CalendarScreen: 사용자가 속한 그룹 없음');
        setTransactions([]);
      }
    } catch (error) {
      console.error('CalendarScreen: 달력 데이터 로드 실패:', error);
      Alert.alert('오류', '거래 내역을 불러올 수 없습니다.');
      setTransactions([]);
    } finally {
      setLoading(false);
      console.log('CalendarScreen: loadCalendarData 완료');
    }
  };

  // 더미 데이터 제거 - 실제 데이터만 사용
  // useEffect(() => {
  //   const dummyTransactions: Transaction[] = [
  //     {
  //       id: '1',
  //       amount: 15000,
  //       type: 'expense',
  //       categoryId: '식비',
  //       memo: '점심식사',
  //       date: new Date(2024, 0, 15),
  //       groupId: '1',
  //       userId: 'user1',
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     },
  //     {
  //       id: '2',
  //       amount: 50000,
  //       type: 'income',
  //       categoryId: '용돈',
  //       memo: '월급',
  //       date: new Date(2024, 0, 15),
  //       groupId: '1',
  //       userId: 'user1',
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     },
  //     {
  //       id: '3',
  //       amount: 8000,
  //       type: 'expense',
  //       categoryId: '교통비',
  //       memo: '지하철',
  //       date: new Date(2024, 0, 16),
  //       groupId: '1',
  //       userId: 'user1',
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     },
  //   ];
  //   setTransactions(dummyTransactions);
  // }, []);

  // 달 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  // 달력 생성
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6주

    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }

    return days;
  };

  // 특정 날짜의 거래 내역 가져오기
  const getTransactionsForDate = (date: Date) => {
    console.log(`CalendarScreen: getTransactionsForDate 호출 - ${date.toDateString()}`);
    console.log(`CalendarScreen: 현재 transactions 배열 길이: ${transactions.length}`);
    console.log(`CalendarScreen: transactions 배열 내용:`, transactions);
    
    // 날짜 비교 로직 개선 - 시간대 차이 문제 해결
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    console.log(`CalendarScreen: 대상 날짜 범위: ${targetDate.toISOString()} ~ ${nextDate.toISOString()}`);
    
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const isInRange = transactionDate >= targetDate && transactionDate < nextDate;
      
      console.log(`CalendarScreen: 거래 날짜: ${transactionDate.toISOString()}, 범위 내: ${isInRange}`);
      
      return isInRange;
    });
    
    console.log(`CalendarScreen: ${date.toDateString()} 거래 내역:`, filteredTransactions);
    return filteredTransactions;
  };

  // 특정 날짜의 총 금액 계산
  const getDayTotal = (date: Date) => {
    const dayTransactions = getTransactionsForDate(date);
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const net = income - expense;
    console.log(`CalendarScreen: ${date.toDateString()} 총액 - 수입: ${income}, 지출: ${expense}, 순액: ${net}`);
    
    return { income, expense, net };
  };

  // 날짜 클릭 핸들러
  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  // 거래 내역 클릭 핸들러
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetailModal(true);
  };

  // 거래 내역 수정 핸들러
  const handleTransactionUpdate = async (updatedTransaction: Transaction) => {
    try {
      // 캘린더 데이터 새로고침
      await loadCalendarData();
    } catch (error) {
      console.error('거래 내역 수정 후 새로고침 실패:', error);
    }
  };

  // 거래 내역 삭제 핸들러
  const handleTransactionDelete = async (transactionId: string) => {
    try {
      // 캘린더 데이터 새로고침
      await loadCalendarData();
    } catch (error) {
      console.error('거래 내역 삭제 후 새로고침 실패:', error);
    }
  };

  // 선택된 날짜의 거래 내역
  const selectedDateTransactions = selectedDate ? getTransactionsForDate(selectedDate) : [];

  const calendarDays = generateCalendarDays();
  
  // 달력 렌더링 전 상태 확인
  console.log('CalendarScreen: 달력 렌더링 시작');
  console.log('CalendarScreen: 현재 transactions 상태:', transactions);
  console.log('CalendarScreen: 현재 월:', currentDate.getMonth() + 1);
  console.log('CalendarScreen: 현재 연도:', currentDate.getFullYear());

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekHeader}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <Text key={index} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      {/* 달력 */}
      <View style={styles.calendar}>
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          const dayTotal = getDayTotal(date);
          const hasTransactions = getTransactionsForDate(date).length > 0;

          // 로깅 추가
          if (isCurrentMonth && hasTransactions) {
            console.log(`CalendarScreen: ${date.toDateString()} - 거래 있음, 수입: ${dayTotal.income}, 지출: ${dayTotal.expense}`);
          }

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !isCurrentMonth && styles.otherMonth,
                isSelected && styles.selectedDay,
                isToday && styles.today,
              ]}
              onPress={() => handleDatePress(date)}
              disabled={!isCurrentMonth}
            >
              <Text style={[
                styles.dayNumber,
                !isCurrentMonth && styles.otherMonthText,
                isSelected && styles.selectedDayText,
                isToday && styles.todayText,
              ]}>
                {date.getDate()}
              </Text>
              
              {hasTransactions && isCurrentMonth && (
                <View style={styles.transactionIndicator}>
                  {dayTotal.income > 0 && (
                    <Text style={styles.incomeText}>+{formatCurrency(dayTotal.income)}</Text>
                  )}
                  {dayTotal.expense > 0 && (
                    <Text style={styles.expenseText}>-{formatCurrency(dayTotal.expense)}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 선택된 날짜의 거래 내역 */}
      {selectedDate && (
        <View style={styles.transactionSection}>
          <Text style={styles.transactionTitle}>
            {formatDate(selectedDate)} 거래 내역
          </Text>
          
          {selectedDateTransactions.length > 0 ? (
            <FlatList
              data={selectedDateTransactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.transactionItem}
                  onPress={() => handleTransactionClick(item)}
                >
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCategory}>{item.categoryId}</Text>
                    <Text style={styles.transactionMemo}>{item.memo}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                    ]}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                    </Text>
                    <View style={styles.transactionActions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleTransactionClick(item)}
                      >
                        <Text style={styles.editButtonText}>✏️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.transactionList}
            />
          ) : (
            <Text style={styles.noTransactions}>거래 내역이 없습니다.</Text>
          )}
        </View>
      )}

      {/* 거래 내역 상세/수정 모달 */}
      <TransactionDetailModal
        visible={showTransactionDetailModal}
        transaction={selectedTransaction}
        onClose={() => setShowTransactionDetailModal(false)}
        onUpdate={handleTransactionUpdate}
        onDelete={handleTransactionDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.surface,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
  },
  otherMonth: {
    backgroundColor: '#F8FAFC',
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
  },
  today: {
    backgroundColor: '#FFF3E0', // 따뜻한 오렌지 크림 배경
    borderWidth: 2,
    borderColor: '#FF9800', // 진한 오렌지 테두리
    elevation: 3,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  otherMonthText: {
    color: COLORS.textSecondary,
  },
  selectedDayText: {
    color: COLORS.surface,
  },
  todayText: {
    color: '#E65100', // 진한 오렌지로 대비 강화
    fontWeight: '800', // 더 굵게
  },
  transactionIndicator: {
    marginTop: 2,
    alignItems: 'center',
  },
  incomeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#059669',
  },
  expenseText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#DC2626',
  },
  transactionSection: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  transactionMemo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  incomeAmount: {
    color: '#059669',
  },
  expenseAmount: {
    color: '#DC2626',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: 16,
    color: 'white',
  },
  noTransactions: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 40,
  },
});

export default CalendarScreen;
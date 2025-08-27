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
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, DEFAULT_CATEGORIES } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { Transaction, Category } from '../types';
import { getCurrentUser } from '../services/authService';
import { groupService, transactionService, categoryService } from '../services/dataService';
import TransactionDetailModal from '../components/TransactionDetailModal';

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 거래 내역 수정/삭제 관련 상태
  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // 컴포넌트 마운트/언마운트 로깅
  useEffect(() => {
    console.log('CalendarScreen: 컴포넌트 마운트됨');
    console.log('CalendarScreen: DEFAULT_CATEGORIES 테스트:', DEFAULT_CATEGORIES);
    console.log('CalendarScreen: DEFAULT_CATEGORIES 길이:', DEFAULT_CATEGORIES.length);
    console.log('CalendarScreen: 의료비 카테고리 찾기 테스트:', DEFAULT_CATEGORIES.find(cat => cat.name === '의료비'));
    
    // getCategoryIcon 함수 직접 테스트
    console.log('=== getCategoryIcon 함수 직접 테스트 ===');
    console.log('의료비 테스트:', getCategoryIcon('의료비'));
    console.log('에덴이 테스트:', getCategoryIcon('에덴이'));
    console.log('식비 테스트:', getCategoryIcon('식비'));
    console.log('=== 테스트 끝 ===');
    
    // 시간 변환 테스트
    console.log('=== 시간 변환 테스트 ===');
    const testDate1 = new Date('2025-08-27T03:45:22.883Z');
    const testDate2 = new Date('2025-08-27T11:52:43.820Z');
    
    const koreanTime1 = new Date(testDate1.getTime() + (9 * 60 * 60 * 1000));
    const koreanTime2 = new Date(testDate2.getTime() + (9 * 60 * 60 * 1000));
    
    console.log('원본 UTC 시간 1:', testDate1.toISOString());
    console.log('한국 시간 1:', koreanTime1.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }));
    
    console.log('원본 UTC 시간 2:', testDate2.toISOString());
    console.log('한국 시간 2:', koreanTime2.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }));
    console.log('=== 시간 테스트 끝 ===');
    
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
   * 카테고리 아이콘 가져오기
   */
  const getCategoryIcon = (categoryId: string): string => {
    console.log('=== getCategoryIcon 디버깅 시작 ===');
    console.log('CalendarScreen: getCategoryIcon 호출 - categoryId:', categoryId);
    
    // 하드코딩 테스트 - 의료비는 무조건 🏥 반환
    if (categoryId === '의료비') {
      console.log('CalendarScreen: 의료비 하드코딩 매칭 - 🏥 반환');
      return '🏥';
    }
    
    // 에덴이는 🎁 반환 (선물 아이콘)
    if (categoryId === '에덴이') {
      console.log('CalendarScreen: 에덴이 하드코딩 매칭 - 🎁 반환');
      return '🎁';
    }
    
    // 기본 카테고리에서 찾기
    const defaultCategory = DEFAULT_CATEGORIES.find(cat => cat.name === categoryId);
    console.log('CalendarScreen: 기본 카테고리에서 찾은 결과:', defaultCategory);
    
    if (defaultCategory) {
      console.log('CalendarScreen: 기본 카테고리 아이콘 반환:', defaultCategory.icon);
      return defaultCategory.icon;
    }
    
    console.log('CalendarScreen: 매칭되는 카테고리 없음, 기본 아이콘 반환: 💰');
    console.log('=== getCategoryIcon 디버깅 끝 ===');
    return '💰';
  };

  /**
   * 카테고리 이름 가져오기
   */
  const getCategoryName = (categoryId: string): string => {
    console.log('CalendarScreen: getCategoryName 호출 - categoryId:', categoryId);
    
    // 먼저 기본 카테고리에서 찾기 (가장 먼저 확인)
    const defaultCategory = DEFAULT_CATEGORIES.find(cat => cat.name === categoryId);
    console.log('CalendarScreen: 기본 카테고리에서 찾은 이름:', defaultCategory?.name);
    if (defaultCategory) {
      return defaultCategory.name;
    }
    
    // 그룹 카테고리에서 이름으로 찾기
    const groupCategoryByName = categories.find(cat => cat.name === categoryId);
    console.log('CalendarScreen: 이름으로 찾은 그룹 카테고리 이름:', groupCategoryByName?.name);
    if (groupCategoryByName) {
      return groupCategoryByName.name;
    }
    
    // 그룹 카테고리에서 ID로 찾기
    const groupCategory = categories.find(cat => cat.id === categoryId);
    console.log('CalendarScreen: ID로 찾은 그룹 카테고리 이름:', groupCategory?.name);
    if (groupCategory) {
      return groupCategory.name;
    }
    
    console.log('CalendarScreen: 매칭되는 카테고리 없음, 원본 값 반환:', categoryId);
    return categoryId; // 찾을 수 없는 경우 원본 값 반환
  };

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
        
        // 카테고리 정보도 함께 로드
        const groupCategories = await categoryService.getByGroup(groups[0].id);
        console.log('CalendarScreen: 조회된 카테고리:', groupCategories);
        console.log('CalendarScreen: 첫 번째 거래 내역:', monthTransactions[0]);
        console.log('CalendarScreen: 첫 번째 거래의 categoryId:', monthTransactions[0]?.categoryId);
        console.log('CalendarScreen: 첫 번째 거래의 date:', monthTransactions[0]?.date);
        console.log('CalendarScreen: 첫 번째 거래의 createdAt:', monthTransactions[0]?.createdAt);
        
        setTransactions(monthTransactions);
        setCategories(groupCategories);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
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
              renderItem={({ item }) => {
                console.log('CalendarScreen: 거래 내역 렌더링 - item:', item);
                console.log('CalendarScreen: 거래 내역의 categoryId:', item.categoryId);
                console.log('CalendarScreen: 거래 내역의 date:', item.date);
                console.log('CalendarScreen: 거래 내역의 date 시간 정보 - 시간:', item.date.getHours(), '분:', item.date.getMinutes());
                console.log('CalendarScreen: 거래 내역의 date ISO 문자열:', item.date.toISOString());
                
                return (
                  <TouchableOpacity 
                    style={styles.transactionItem}
                    onPress={() => handleTransactionClick(item)}
                  >
                    <View style={styles.transactionInfo}>
                      <View style={styles.categoryContainer}>
                        <Text style={styles.categoryIcon}>{getCategoryIcon(item.categoryId)}</Text>
                        <Text style={styles.transactionCategory}>{getCategoryName(item.categoryId)}</Text>
                      </View>
                      <Text style={styles.transactionMemo}>{item.memo}</Text>
                      <Text style={styles.transactionTime}>
                        {(() => {
                          // UTC 시간을 한국 시간으로 변환
                          const utcDate = new Date(item.date);
                          const koreanTime = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
                          
                          console.log('CalendarScreen: 원본 UTC 시간:', item.date);
                          console.log('CalendarScreen: 한국 시간 변환:', koreanTime);
                          console.log('CalendarScreen: 한국 시간 - 시간:', koreanTime.getHours(), '분:', koreanTime.getMinutes());
                          
                          return koreanTime.toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          });
                        })()}
                      </Text>
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
    </SafeAreaView>
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
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
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
  transactionTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
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
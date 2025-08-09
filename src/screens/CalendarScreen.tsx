// 달력 화면 컴포넌트
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { Transaction } from '../types';

const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // 더미 데이터 (나중에 Firebase에서 가져올 예정)
  useEffect(() => {
    const dummyTransactions: Transaction[] = [
      {
        id: '1',
        amount: 15000,
        type: 'expense',
        categoryId: '식비',
        memo: '점심식사',
        date: new Date(2024, 0, 15),
        groupId: '1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        amount: 50000,
        type: 'income',
        categoryId: '용돈',
        memo: '월급',
        date: new Date(2024, 0, 15),
        groupId: '1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        amount: 8000,
        type: 'expense',
        categoryId: '교통비',
        memo: '지하철',
        date: new Date(2024, 0, 16),
        groupId: '1',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    setTransactions(dummyTransactions);
  }, []);

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
    return transactions.filter(transaction => 
      transaction.date.toDateString() === date.toDateString()
    );
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
    
    return { income, expense, net: income - expense };
  };

  // 날짜 클릭 핸들러
  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
  };

  // 선택된 날짜의 거래 내역
  const selectedDateTransactions = selectedDate ? getTransactionsForDate(selectedDate) : [];

  const calendarDays = generateCalendarDays();

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
                <View style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCategory}>{item.categoryId}</Text>
                    <Text style={styles.transactionMemo}>{item.memo}</Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    item.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
                  ]}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </Text>
                </View>
              )}
              style={styles.transactionList}
            />
          ) : (
            <Text style={styles.noTransactions}>거래 내역이 없습니다.</Text>
          )}
        </View>
      )}
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
    backgroundColor: '#FEF3C7',
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
    color: '#92400E',
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
  noTransactions: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 40,
  },
});

export default CalendarScreen;
// 빠른 기록 모달 컴포넌트 - 세련된 커스텀 캘린더 사용
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, DEFAULT_CATEGORIES } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { categoryService } from '../services/dataService';
import { Category } from '../types';
import { getCurrentUser } from '../services/authService';
import { groupService } from '../services/dataService';
import { Transaction } from '../types';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  transactionToEdit?: Transaction | null;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ visible, onClose, onSave, transactionToEdit }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  // showDateTimeModal 상태 제거됨 - 모달이 더 이상 필요 없음
  const [groupCategories, setGroupCategories] = useState<Category[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  // 그룹별 카테고리 로드
  const loadGroupCategories = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const groups = await groupService.getByUser(user.uid);
      if (groups.length > 0) {
        const group = groups[0];
        setCurrentGroupId(group.id);
        
        const categories = await categoryService.getByGroup(group.id);
        setGroupCategories(categories);
      }
    } catch (error) {
      console.error('그룹 카테고리 로드 실패:', error);
    }
  };

  // 모달이 열릴 때마다 그룹별 카테고리 로드
  useEffect(() => {
    if (visible) {
      loadGroupCategories();
    }
  }, [visible]);

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount.toString());
      setType(transactionToEdit.type);
      setSelectedCategory(transactionToEdit.categoryId || '');
      setMemo(transactionToEdit.memo || '');
      setSelectedDate(new Date(transactionToEdit.date));
    }
  }, [transactionToEdit]);

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    setAmount('');
    setType('expense');
    setSelectedCategory('');
    setMemo('');
    setSelectedDate(new Date());
    onClose();
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert('입력 오류', '금액과 카테고리를 입력해주세요.');
      return;
    }

    const finalDateTime = new Date(selectedDate);
    
    try {
      if (transactionToEdit) {
        // 수정 모드
        await onSave({
          amount: parseInt(amount),
          type,
          categoryId: selectedCategory,
          memo: memo.trim(),
          date: finalDateTime,
          groupId: currentGroupId || '',
          userId: getCurrentUser()?.uid || '',
        });
        Alert.alert('완료', '거래 내역이 수정되었습니다!');
      } else {
        // 새로 추가 모드
        await onSave({
          amount: parseInt(amount),
          type,
          categoryId: selectedCategory,
          memo: memo.trim(),
          date: finalDateTime,
          groupId: currentGroupId || '',
          userId: getCurrentUser()?.uid || '',
        });
        Alert.alert('완료', '기록이 저장되었습니다!');
      }
    handleClose();
    } catch (error) {
      Alert.alert('오류', `저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  // 날짜/시간 선택 모달 열기 - 더 이상 필요 없음
  const openDateTimeModal = () => {
    // 모달 제거됨
  };

  // 날짜/시간 선택 완료 - 더 이상 필요 없음
  const handleDateTimeConfirm = (date: Date, time: Date) => {
    // 모달 제거됨
  };

  // 오늘 날짜로 이동
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
  };

  // 캘린더 날짜 생성 함수 (세련된 버전)
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 해당 월의 첫 번째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 첫 번째 날의 요일 (0: 일요일, 1: 월요일, ...)
    const firstDayOfWeek = firstDay.getDay();
    
    // 이전 달의 마지막 날들
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays: Date[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push(new Date(year, month - 1, prevMonthLastDay.getDate() - i));
    }
    
    // 현재 월의 날들
    const currentMonthDays: Date[] = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      currentMonthDays.push(new Date(year, month, i));
    }
    
    // 다음 달의 첫 번째 날들 (캘린더를 6주로 맞추기 위해)
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingWeeks = 6 - Math.ceil(totalDays / 7);
    const nextMonthDays: Date[] = [];
    for (let i = 1; i <= remainingWeeks * 7 - (totalDays % 7); i++) {
      nextMonthDays.push(new Date(year, month + 1, i));
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // 이전/다음 월 이동 함수 - 더 이상 필요 없음
  const goToPreviousMonth = () => {
    // 스크롤 방식으로 변경됨
  };

  const goToNextMonth = () => {
    // 스크롤 방식으로 변경됨
  };

  // 날짜 선택
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // 월 선택 핸들러
  const handleMonthSelect = (month: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(month - 1);
    setSelectedDate(newDate);
  };

  // 일 선택 핸들러
  const handleDaySelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  // 시간 선택 핸들러
  const handleHourSelect = (hour: number) => {
    const newTime = new Date(selectedDate);
    newTime.setHours(hour);
    setSelectedDate(newTime);
  };

  // 분 선택 핸들러
  const handleMinuteSelect = (minute: number) => {
    const newTime = new Date(selectedDate);
    newTime.setMinutes(minute);
    setSelectedDate(newTime);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" statusBarTranslucent>
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {transactionToEdit ? '거래 내역 수정' : '지출 기록하기'}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>저장</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 수입/지출 토글 */}
          <View style={styles.section}>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                  💸 지출
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                  💰 수입
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 금액 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>금액</Text>
            <View style={styles.amountDisplayContainer}>
              <Text style={styles.currencySymbol}>₩</Text>
              <Text style={styles.amountDisplay}>
                {amount ? formatCurrency(parseInt(amount) || 0).replace('₩', '') : '0'}
              </Text>
            </View>
            
            {/* 계산기 스타일 숫자 키패드 */}
            <View style={styles.calculatorContainer}>
              <View style={styles.calculatorRow}>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '1')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '2')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '3')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>3</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calculatorRow}>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '4')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>4</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '5')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>5</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '6')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>6</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calculatorRow}>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '7')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>7</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '8')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>8</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '9')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>9</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calculatorRow}>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '0')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calculatorButton} 
                  onPress={() => setAmount(prev => prev + '00')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.calculatorButtonText}>00</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.calculatorButton, styles.deleteButton]} 
                  onPress={() => setAmount(prev => prev.slice(0, -1))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.calculatorButtonText, styles.deleteButtonText]}>⌫</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 날짜 및 시간 선택 */}
          <View style={[styles.section, styles.dateTimeSection]}>
            <View style={styles.dateTimeContainer}>
              {/* 날짜 섹션 */}
              <View style={styles.dateContainer}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateTitle}>날짜</Text>
                </View>
                
                {/* 월/일 스크롤 */}
                <View style={styles.dateInputRow}>
                  {/* 월 선택 스크롤 */}
                  <ScrollView
                    style={styles.dateScrollContainer}
                    contentContainerStyle={styles.dateScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    onScroll={(event) => {
                      const offsetY = event.nativeEvent.contentOffset.y;
                      const month = Math.round(offsetY / 40);
                      if (month >= 0 && month < 12 && month !== selectedDate.getMonth()) {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(month);
                        setSelectedDate(newDate);
                      }
                    }}
                    scrollEventThrottle={100}
                    ref={(ref) => {
                      if (ref) {
                        // 선택된 월에 맞춰 스크롤 위치 조정
                        ref.scrollTo({ y: (selectedDate.getMonth()) * 40, animated: false });
                      }
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.dateScrollItem,
                          selectedDate.getMonth() === month - 1 && styles.dateScrollItemSelected
                        ]}
                        onPress={() => handleMonthSelect(month)}
                      >
                        <Text style={[
                          styles.dateScrollItemText,
                          selectedDate.getMonth() === month - 1 && styles.dateScrollItemTextSelected
                        ]}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* 구분자 */}
                  <Text style={styles.dateSeparator}>/</Text>

                  {/* 일 선택 스크롤 */}
                  <ScrollView
                    style={styles.dateScrollContainer}
                    contentContainerStyle={styles.dateScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    onScroll={(event) => {
                      const offsetY = event.nativeEvent.contentOffset.y;
                      const day = Math.round(offsetY / 40) + 1;
                      if (day >= 1 && day <= 31 && day !== selectedDate.getDate()) {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(day);
                        setSelectedDate(newDate);
                      }
                    }}
                    scrollEventThrottle={100}
                    ref={(ref) => {
                      if (ref) {
                        // 선택된 일에 맞춰 스크롤 위치 조정
                        ref.scrollTo({ y: (selectedDate.getDate() - 1) * 40, animated: false });
                      }
                    }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dateScrollItem,
                          selectedDate.getDate() === day && styles.dateScrollItemSelected
                        ]}
                        onPress={() => handleDaySelect(day)}
                      >
                        <Text style={[
                          styles.dateScrollItemText,
                          selectedDate.getDate() === day && styles.dateScrollItemTextSelected
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* 선택된 날짜 표시 */}
                <View style={styles.selectedDateDisplay}>
                  <Text style={styles.selectedDateText}>
                    {formatDate(selectedDate)}
                  </Text>
                </View>
              </View>

              {/* 시간 섹션 */}
              <View style={styles.timeContainer}>
                <View style={styles.timeHeader}>
                  <Text style={styles.timeTitle}>시간</Text>
                  <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
                    <Text style={styles.todayButtonText}>📅</Text>
                  </TouchableOpacity>
                </View>
                
                {/* 시/분 스크롤 */}
                <View style={styles.timeInputRow}>
                  {/* 시 선택 스크롤 */}
                  <ScrollView
                    style={styles.timeScrollContainer}
                    contentContainerStyle={styles.dateScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    onScroll={(event) => {
                      const offsetY = event.nativeEvent.contentOffset.y;
                      const hour = Math.round(offsetY / 40);
                      if (hour >= 0 && hour < 24 && hour !== selectedDate.getHours()) {
                        const newDate = new Date(selectedDate);
                        newDate.setHours(hour);
                        setSelectedDate(newDate);
                      }
                    }}
                    scrollEventThrottle={100}
                    ref={(ref) => {
                      if (ref) {
                        // 선택된 시에 맞춰 스크롤 위치 조정
                        ref.scrollTo({ y: selectedDate.getHours() * 40, animated: false });
                      }
                    }}
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeScrollItem,
                          selectedDate.getHours() === hour && styles.timeScrollItemSelected
                        ]}
                        onPress={() => handleHourSelect(hour)}
                      >
                        <Text style={[
                          styles.timeScrollItemText,
                          selectedDate.getHours() === hour && styles.timeScrollItemTextSelected
                        ]}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* 구분자 */}
                  <Text style={styles.timeSeparator}>:</Text>

                  {/* 분 선택 스크롤 */}
                  <ScrollView
                    style={styles.timeScrollContainer}
                    contentContainerStyle={styles.timeScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    onScroll={(event) => {
                      const offsetY = event.nativeEvent.contentOffset.y;
                      const minute = Math.round(offsetY / 40);
                      if (minute >= 0 && minute < 60 && minute !== selectedDate.getMinutes()) {
                        const newDate = new Date(selectedDate);
                        newDate.setMinutes(minute);
                        setSelectedDate(newDate);
                      }
                    }}
                    scrollEventThrottle={100}
                    ref={(ref) => {
                      if (ref) {
                        // 선택된 분에 맞춰 스크롤 위치 조정
                        ref.scrollTo({ y: selectedDate.getMinutes() * 40, animated: false });
                      }
                    }}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timeScrollItem,
                          selectedDate.getMinutes() === minute && styles.timeScrollItemSelected
                        ]}
                        onPress={() => handleMinuteSelect(minute)}
                      >
                        <Text style={[
                          styles.timeScrollItemText,
                          selectedDate.getMinutes() === minute && styles.timeScrollItemTextSelected
                        ]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* 선택된 시간 표시 */}
                <View style={styles.currentTimeDisplay}>
                  <Text style={styles.currentTimeText}>
                    {selectedDate.toLocaleTimeString('ko-KR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 카테고리 선택 - 수평 스크롤 */}
          <View style={[styles.section, styles.categorySection]}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            
            {/* 수평 스크롤 카테고리 목록 */}
            <View style={styles.categoryScrollWrapper}>
              {/* 왼쪽 화살표 기호 */}
              <Text style={styles.scrollArrowText}>‹</Text>
              
              {/* 카테고리 스크롤 영역 */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScrollContainer}
                style={styles.categoryScrollView}
              >
                {/* 기본 카테고리 먼저 표시 */}
                {DEFAULT_CATEGORIES.map((category, index) => (
                  <TouchableOpacity
                    key={`default-${index}`}
                    style={[
                      styles.horizontalCategoryButton,
                      selectedCategory === category.name && styles.horizontalCategoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <Text style={styles.horizontalCategoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.horizontalCategoryText,
                      selectedCategory === category.name && styles.horizontalCategoryTextActive,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {/* 모임 카테고리 뒤에 표시 */}
                {groupCategories.map((category, index) => (
                  <TouchableOpacity
                    key={`group-${category.id}`}
                    style={[
                      styles.horizontalCategoryButton,
                      selectedCategory === category.name && styles.horizontalCategoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                  >
                    <Text style={styles.horizontalCategoryIcon}>{category.icon || '📁'}</Text>
                    <Text style={[
                      styles.horizontalCategoryText,
                      selectedCategory === category.name && styles.horizontalCategoryTextActive,
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* 오른쪽 화살표 기호 */}
              <Text style={styles.scrollArrowText}>›</Text>
            </View>
          </View>

          {/* 메모 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모 (선택사항)</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="메모를 입력하세요..."
              value={memo}
              onChangeText={setMemo}
              multiline
              maxLength={100}
            />
            <Text style={styles.characterCount}>{memo.length}/100</Text>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 모달 제거됨 - 날짜/시간 선택이 메인 페이지에 통합됨 */}
      </SafeAreaView>
    </Modal>
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
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 12, // 16에서 12로 줄임
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  categorySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.text,
  },
  amountDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  calculatorContainer: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calculatorButton: {
    width: '30%',
    aspectRatio: 1.5,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    }),
  },
  calculatorButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
  },
  deleteButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deleteButtonText: {
    color: COLORS.textSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // marginBottom 제거 - 불필요한 여백 정리
  },
  categoryButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 4,
  },
  categoryTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  memoInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
    height: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 20,
  },
  // 날짜/시간 모달 스타일
  dateTimeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dateTimeModalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    elevation: 5,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    }),
  },
  dateTimeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dateTimeModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  dateTimeModalClose: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '600',
    padding: 4,
  },
  dateTimeModalContent: {
    padding: 20,
    maxHeight: 500, // 최대 높이 제한
  },
  calendarSection: {
    marginBottom: 24,
  },
  // 새로운 날짜 선택 UI 스타일
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    elevation: 1,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
  },
  monthNavButtonText: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  currentMonthText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  todayButton: {
    position: 'absolute', // 절대 위치로 배치
    right: 0, // 오른쪽 끝에 배치
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 16,
    color: COLORS.surface,
  },
  selectedDateDisplay: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%', // 전체 너비 사용
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  timeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    width: '100%', // 전체 너비 사용
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 4,
    minHeight: 140, // 날짜 스크롤과 동일한 높이 보장
    maxWidth: 140, // 최대 너비 제한으로 균형 맞춤
  },
  timeScrollContainer: {
    width: 65, // 날짜와 정확히 동일하게 맞춤
    height: 120, // 원래 높이로 복원 (3개 항목이 보이도록)
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  timeScrollContent: {
    alignItems: 'center',
    paddingVertical: 50, // 스크롤 시작 위치를 중앙으로 맞춤
  },
  timeScrollItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  timeScrollItemText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  timeScrollItemSelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  timeScrollItemTextSelected: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: 2,
  },
  currentTimeDisplay: {
    marginTop: 12,
    alignItems: 'center',
    width: '100%', // 전체 너비 사용
  },
  currentTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  dateContainer: {
    flex: 1, // 왼쪽 영역 차지
    minWidth: 0,
    alignItems: 'center', // 중앙 정렬
    width: '50%', // 정확히 절반 크기
  },
  timeContainer: {
    flex: 1, // 오른쪽 영역 차지
    minWidth: 0,
    alignItems: 'center', // 중앙 정렬
    width: '50%', // 정확히 절반 크기
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'center', // 가운데 정렬로 변경
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  dateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center', // 가운데 정렬
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 4, // 월과 일 사이 간격
    minHeight: 140, // 시간 스크롤과 동일한 높이 보장
    maxWidth: 140, // 최대 너비 제한으로 균형 맞춤
  },
  dateScrollContainer: {
    width: 65, // 시간과 정확히 동일하게 맞춤
    height: 120, // 원래 높이로 복원 (3개 항목이 보이도록)
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  dateScrollContent: {
    alignItems: 'center',
    paddingVertical: 50, // 스크롤 시작 위치를 중앙으로 맞춤
  },
  dateScrollView: {
    flex: 1,
    width: '100%',
  },
  dateScrollItem: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8, // 시간과 동일하게 맞춤
  },
  dateScrollItemSelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 8, // 시간과 동일하게 맞춤
  },
  dateScrollItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateScrollItemTextSelected: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  dateSeparator: {
    fontSize: 20,
    color: COLORS.textSecondary,
    marginHorizontal: 2, // 구분자 좌우 여백
  },
  dateTimeContainer: {
    flexDirection: 'row', // 가로 배치로 변경
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 16, // 좌우 영역 사이 간격
    elevation: 2,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  noCategoryContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCategoryText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  noCategorySubText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  dateTimeSection: {
    marginBottom: 20, // 날짜/시간 섹션과 카테고리 사이 여백 추가
  },
  categorySection: {
    marginBottom: 12, // 20에서 12로 줄여서 메모와의 간격 조정
  },
  // 수평 스크롤 카테고리 스타일
  categoryScrollView: {
    marginTop: 12,
  },
  categoryScrollContainer: {
    paddingHorizontal: 8,
    gap: 6,
  },
  horizontalCategoryButton: {
    width: 110, // 한 번에 3개가 보이도록 너비 조정
    height: 80,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  horizontalCategoryButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
  },
  horizontalCategoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  horizontalCategoryText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  horizontalCategoryTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // 스크롤 화살표 기호 스타일
  categoryScrollWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  scrollArrowText: {
    fontSize: 28,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginHorizontal: 4,
  },
});

export default QuickAddModal;

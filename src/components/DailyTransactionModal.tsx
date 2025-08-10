import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils';
import { Transaction } from '../types';

interface DailyTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  transactions: Transaction[];
}

const DailyTransactionModal: React.FC<DailyTransactionModalProps> = ({
  visible,
  onClose,
  selectedDate,
  transactions,
}) => {
  if (!selectedDate) return null;

  // 선택된 날짜의 거래 내역만 필터링
  const dailyTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.toDateString() === selectedDate.toDateString();
  });

  // 수입/지출 합계 계산
  const totalIncome = dailyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = dailyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  /**
   * 거래 내역 카드 렌더링
   */
  const renderTransactionCard = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={[
          styles.typeIndicator,
          transaction.type === 'income' ? styles.incomeIndicator : styles.expenseIndicator,
        ]}>
          <Text style={styles.typeIcon}>
            {transaction.type === 'income' ? '💰' : '💸'}
          </Text>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCategory}>
            {transaction.categoryId || '기타'}
          </Text>
          {transaction.memo && (
            <Text style={styles.transactionMemo}>
              {transaction.memo}
            </Text>
          )}
        </View>
        
        <Text style={[
          styles.transactionAmount,
          transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount,
        ]}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
      </View>
      
      <Text style={styles.transactionTime}>
        {new Date(transaction.createdAt).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </Text>
            <Text style={styles.headerSubtitle}>
              총 {dailyTransactions.length}건의 거래
            </Text>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 요약 카드 */}
        {dailyTransactions.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>수입</Text>
              <Text style={[styles.summaryAmount, styles.incomeAmount]}>
                +{formatCurrency(totalIncome)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>지출</Text>
              <Text style={[styles.summaryAmount, styles.expenseAmount]}>
                -{formatCurrency(totalExpense)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>순액</Text>
              <Text style={[
                styles.summaryAmount,
                totalIncome - totalExpense >= 0 ? styles.incomeAmount : styles.expenseAmount,
              ]}>
                {totalIncome - totalExpense >= 0 ? '+' : ''}{formatCurrency(totalIncome - totalExpense)}
              </Text>
            </View>
          </View>
        )}

        {/* 거래 내역 목록 */}
        <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
          {dailyTransactions.length > 0 ? (
            <View style={styles.transactionsContainer}>
              <Text style={styles.sectionTitle}>거래 내역</Text>
              {dailyTransactions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(renderTransactionCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>거래 내역이 없습니다</Text>
              <Text style={styles.emptySubtitle}>
                이 날에는 아직 거래 내역이 없어요
              </Text>
            </View>
          )}
          
          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* 배경 터치 시 닫기 */}
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  transactionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  incomeIndicator: {
    backgroundColor: '#ECFDF5',
  },
  expenseIndicator: {
    backgroundColor: '#FEF2F2',
  },
  typeIcon: {
    fontSize: 18,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionMemo: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});

export default DailyTransactionModal;




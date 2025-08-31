import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, X, Search, Calendar } from 'lucide-react-native';

interface TransactionListModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transactionId: string) => void;
}

const TransactionListModal: React.FC<TransactionListModalProps> = ({
  visible,
  onClose,
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // 거래 내역 필터링
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchText.toLowerCase()) ||
                         transaction.category?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // 수입/지출 합계 계산
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const renderTransactionItem = (transaction: Transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={styles.transactionItem}
      onPress={() => onEditTransaction?.(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionTypeIcon,
          { backgroundColor: transaction.type === 'income' ? COLORS.success + '20' : COLORS.danger + '20' }
        ]}>
          {transaction.type === 'income' ? (
            <TrendingUp size={18} color={COLORS.success} />
          ) : (
            <TrendingDown size={18} color={COLORS.danger} />
          )}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>
            {transaction.description || transaction.category}
          </Text>
          <Text style={styles.transactionCategory}>
            {transaction.category}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(new Date(transaction.date))}
          </Text>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount,
        { color: transaction.type === 'income' ? COLORS.success : COLORS.danger }
      ]}>
        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>전체 거래내역</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* 검색 및 필터 */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={18} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="거래내역 검색..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </View>

          {/* 필터 버튼들 */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'all' && styles.activeFilter]}
              onPress={() => setFilterType('all')}
            >
              <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>
                전체
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'income' && styles.activeFilter]}
              onPress={() => setFilterType('income')}
            >
              <Text style={[styles.filterText, filterType === 'income' && styles.activeFilterText]}>
                수입
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterType === 'expense' && styles.activeFilter]}
              onPress={() => setFilterType('expense')}
            >
              <Text style={[styles.filterText, filterType === 'expense' && styles.activeFilterText]}>
                지출
              </Text>
            </TouchableOpacity>
          </View>

          {/* 합계 정보 */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>수입</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                +{formatCurrency(totalIncome)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>지출</Text>
              <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
                -{formatCurrency(totalExpense)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>순액</Text>
              <Text style={[
                styles.summaryValue,
                { color: (totalIncome - totalExpense) >= 0 ? COLORS.success : COLORS.danger }
              ]}>
                {formatCurrency(totalIncome - totalExpense)}
              </Text>
            </View>
          </View>

          {/* 거래 내역 목록 */}
          <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
            {filteredTransactions.length > 0 ? (
              <View style={styles.transactionsContainer}>
                {filteredTransactions
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(renderTransactionItem)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Calendar size={48} color={COLORS.textSecondary} />
                <Text style={styles.emptyTitle}>거래 내역이 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                  {searchText ? '검색 조건에 맞는 거래가 없습니다' : '아직 거래 내역이 없어요'}
                </Text>
              </View>
            )}
            
            {/* 하단 여백 */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>

        {/* 배경 터치 시 닫기 */}
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  
  closeButton: {
    padding: 4,
  },

  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  activeFilterText: {
    color: COLORS.background,
  },

  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },

  summaryItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  transactionsContainer: {
    paddingTop: 16,
  },
  
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 8,
  },
  
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  transactionTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    color: COLORS.textLight,
  },
  
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  bottomSpacing: {
    height: 20,
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

export default TransactionListModal;
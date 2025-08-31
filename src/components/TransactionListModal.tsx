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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 디버깅용 로그
  React.useEffect(() => {
    if (visible) {
      console.log('TransactionListModal: 모달 열림, 거래내역:', transactions.length, '개');
      console.log('TransactionListModal: 거래내역 샘플:', transactions.slice(0, 2));
    }
  }, [visible, transactions]);

  // 필터링 결과 디버깅
  React.useEffect(() => {
    if (visible) {
      console.log('TransactionListModal: 필터링 결과:', filteredTransactions.length, '개');
      console.log('TransactionListModal: 검색어:', searchText, '필터타입:', filterType, '카테고리:', selectedCategory);
    }
  }, [visible, filteredTransactions, searchText, filterType, selectedCategory]);

  // 고유한 카테고리 목록 추출
  const uniqueCategories = React.useMemo(() => {
    const categories = transactions
      .map(t => t.categoryId)
      .filter((category, index, self) => category && self.indexOf(category) === index)
      .sort();
    return ['all', ...categories];
  }, [transactions]);

  // 거래 내역 필터링
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchText === '' || 
                         transaction.description?.toLowerCase().includes(searchText.toLowerCase()) ||
                         transaction.categoryId?.toLowerCase().includes(searchText.toLowerCase()) ||
                         transaction.memo?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = selectedCategory === 'all' || transaction.categoryId === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
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
            {transaction.description || transaction.memo || transaction.categoryId}
          </Text>
          <Text style={styles.transactionCategory}>
            {transaction.categoryId}
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

          {/* 카테고리 필터 */}
          <View style={styles.categoryFilterContainer}>
            <Text style={styles.filterSectionTitle}>카테고리</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryFilterScroll}
            >
              {uniqueCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryFilterButton,
                    selectedCategory === category && styles.activeCategoryFilter
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryFilterText,
                    selectedCategory === category && styles.activeCategoryFilterText
                  ]}>
                    {category === 'all' ? '전체' : category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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

  categoryFilterContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },

  categoryFilterScroll: {
    marginBottom: 8,
  },

  categoryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    minWidth: 60,
    alignItems: 'center',
  },

  activeCategoryFilter: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },

  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  activeCategoryFilterText: {
    color: COLORS.background,
  },

  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 16,
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
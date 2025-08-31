import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { Transaction, Group } from '../types';
import { transactionService } from '../services/dataService';
import { getCurrentUser } from '../services/authService';
import { useGlobalContext } from '../../App';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentGroup: Group | null;
}

const TransactionListModal: React.FC<Props> = ({ visible, onClose, currentGroup }) => {
  const { triggerRefresh } = useGlobalContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('month');
  const [groupMembers, setGroupMembers] = useState<{[key: string]: string}>({});

  // 사용자 이름을 가져오는 함수
  const getUserDisplayName = (userId: string): string => {
    if (!userId) return '알 수 없음';
    if (userId === getCurrentUser()?.uid) return '나';
    return groupMembers[userId] || '사용자';
  };

  // 그룹 멤버 정보 로드
  const loadGroupMembers = async () => {
    if (!currentGroup) return;
    
    try {
      const members: {[key: string]: string} = {};
      currentGroup.members.forEach((memberId, index) => {
        if (memberId === getCurrentUser()?.uid) {
          members[memberId] = '나';
        } else {
          members[memberId] = `멤버${index + 1}`;
        }
      });
      setGroupMembers(members);
    } catch (error) {
      console.error('그룹 멤버 로드 실패:', error);
    }
  };

  // 거래 내역 로드
  const loadTransactions = async () => {
    if (!currentGroup) return;

    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user) return;

      // 현재 월의 거래 내역 조회
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const allTransactions = await transactionService.getByMonth(currentGroup.id, year, month);
      setTransactions(allTransactions);
      
      // 초기 필터링 적용
      applyFilters(allTransactions, selectedFilter, selectedPeriod, searchText);
    } catch (error) {
      console.error('거래 내역 로드 실패:', error);
      Alert.alert('오류', '거래 내역을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 새로고침
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // 필터 적용
  const applyFilters = (
    allTransactions: Transaction[],
    typeFilter: 'all' | 'income' | 'expense',
    periodFilter: 'all' | 'month' | 'week',
    searchQuery: string
  ) => {
    let filtered = [...allTransactions];

    // 타입 필터
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // 기간 필터 (현재는 이미 월별로 로드하므로 week만 추가 필터링)
    if (periodFilter === 'week') {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(t => new Date(t.date) >= weekStart);
    }

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.memo || '').toLowerCase().includes(query) ||
        t.categoryId.toLowerCase().includes(query)
      );
    }

    // 최신순 정렬
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredTransactions(filtered);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (
    typeFilter?: 'all' | 'income' | 'expense',
    periodFilter?: 'all' | 'month' | 'week',
    searchQuery?: string
  ) => {
    const newTypeFilter = typeFilter ?? selectedFilter;
    const newPeriodFilter = periodFilter ?? selectedPeriod;
    const newSearchQuery = searchQuery ?? searchText;

    if (typeFilter !== undefined) setSelectedFilter(typeFilter);
    if (periodFilter !== undefined) setSelectedPeriod(periodFilter);
    if (searchQuery !== undefined) setSearchText(searchQuery);

    applyFilters(transactions, newTypeFilter, newPeriodFilter, newSearchQuery);
  };

  // 거래 삭제
  const handleDeleteTransaction = async (transaction: Transaction) => {
    Alert.alert(
      '거래 삭제',
      '이 거래를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.delete(transaction.id);
              await loadTransactions();
              triggerRefresh(); // 홈화면도 새로고침
            } catch (error) {
              Alert.alert('오류', '거래 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // 통계 계산
  const getStatistics = () => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      count: filteredTransactions.length
    };
  };

  const statistics = getStatistics();

  // Modal이 열릴 때 데이터 로드
  useEffect(() => {
    if (visible && currentGroup) {
      loadTransactions();
      loadGroupMembers();
    }
  }, [visible, currentGroup]);

  // 거래 아이템 렌더링
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onLongPress={() => handleDeleteTransaction(item)}
    >
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: item.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }
        ]}>
          <Text style={styles.transactionIconText}>
            {item.type === 'income' ? '↗' : '↘'}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCategory}>
            {item.categoryId}
          </Text>
          <Text style={styles.transactionMemo}>
            {item.memo || '거래 내역'} • {getUserDisplayName(item.userId)}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.date)}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'income' ? COLORS.income : COLORS.expense }
        ]}>
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onClose}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>전체 거래 내역</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 검색바 */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="거래 내역 검색..."
            placeholderTextColor={COLORS.textLight}
            value={searchText}
            onChangeText={(text) => handleFilterChange(undefined, undefined, text)}
          />
        </View>

        {/* 필터 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'income' && styles.filterChipActive]}
            onPress={() => handleFilterChange('income')}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'income' && styles.filterChipTextActive]}>
              수입
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'expense' && styles.filterChipActive]}
            onPress={() => handleFilterChange('expense')}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'expense' && styles.filterChipTextActive]}>
              지출
            </Text>
          </TouchableOpacity>
          
          <View style={styles.filterDivider} />
          
          <TouchableOpacity
            style={[styles.filterChip, selectedPeriod === 'all' && styles.filterChipActive]}
            onPress={() => handleFilterChange(undefined, 'all')}
          >
            <Text style={[styles.filterChipText, selectedPeriod === 'all' && styles.filterChipTextActive]}>
              전체 기간
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedPeriod === 'month' && styles.filterChipActive]}
            onPress={() => handleFilterChange(undefined, 'month')}
          >
            <Text style={[styles.filterChipText, selectedPeriod === 'month' && styles.filterChipTextActive]}>
              이번 달
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedPeriod === 'week' && styles.filterChipActive]}
            onPress={() => handleFilterChange(undefined, 'week')}
          >
            <Text style={[styles.filterChipText, selectedPeriod === 'week' && styles.filterChipTextActive]}>
              이번 주
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 통계 요약 */}
        <View style={styles.statisticsContainer}>
          <View style={styles.statisticsItem}>
            <Text style={styles.statisticsLabel}>총 수입</Text>
            <Text style={[styles.statisticsValue, { color: COLORS.income }]}>
              +{formatCurrency(statistics.totalIncome)}
            </Text>
          </View>
          <View style={styles.statisticsItem}>
            <Text style={styles.statisticsLabel}>총 지출</Text>
            <Text style={[styles.statisticsValue, { color: COLORS.expense }]}>
              -{formatCurrency(statistics.totalExpense)}
            </Text>
          </View>
          <View style={styles.statisticsItem}>
            <Text style={styles.statisticsLabel}>순액</Text>
            <Text style={[
              styles.statisticsValue,
              { color: statistics.netAmount >= 0 ? COLORS.income : COLORS.expense }
            ]}>
              {statistics.netAmount >= 0 ? '+' : ''}{formatCurrency(statistics.netAmount)}
            </Text>
          </View>
          <View style={styles.statisticsItem}>
            <Text style={styles.statisticsLabel}>거래 수</Text>
            <Text style={styles.statisticsValue}>
              {statistics.count}건
            </Text>
          </View>
        </View>

        {/* 거래 목록 */}
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.transactionList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>
                {searchText ? '검색 결과가 없습니다' : '거래 내역이 없습니다'}
              </Text>
            </View>
          }
        />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 60,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
    lineHeight: 18,
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  statisticsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statisticsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statisticsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statisticsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
    fontWeight: '600',
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
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default TransactionListModal;

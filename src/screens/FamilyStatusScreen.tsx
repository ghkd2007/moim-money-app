// 구성원 현황 화면 컴포넌트
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils';
import { User, Transaction } from '../types';

interface GroupMember extends User {
  monthlyExpense: number;
  monthlyIncome: number;
  transactionCount: number;
  lastTransactionDate?: Date;
}

const FamilyStatusScreen: React.FC = () => {
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  // 실제 Firebase 데이터 로드
  useEffect(() => {
    loadFamilyStatusData();
  }, []);

  /**
   * 가족 상태 데이터 로드
   */
  const loadFamilyStatusData = async () => {
    try {
      setLoading(true);
      // TODO: Firebase에서 실제 구성원 데이터 로드
      // const user = getCurrentUser();
      // if (user) {
      //   const groups = await groupService.getByUser(user.uid);
      //   if (groups.length > 0) {
      //     // 구성원별 통계 데이터 로드 로직
      //   }
      // }
      
      // 임시로 빈 배열 설정 (실제 데이터 연결 전까지)
      setGroupMembers([]);
    } catch (error) {
      console.error('가족 상태 데이터 로드 실패:', error);
      setGroupMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // 더미 데이터 제거 - 실제 데이터만 사용
  // useEffect(() => {
  //   const dummyMembers: GroupMember[] = [
  //     {
  //       id: 'user1',
  //       email: 'dad@example.com',
  //       name: '김철수',
  //       photoURL: null,
  //       monthlyExpense: 450000,
  //       monthlyIncome: 3000000,
  //       transactionCount: 24,
  //       lastTransactionDate: new Date(2024, 0, 20),
  //     },
  //     {
  //       id: 'user2',
  //       email: 'member2@example.com',
  //       name: '이영희',
  //       photoURL: null,
  //       monthlyExpense: 380000,
  //       monthlyIncome: 2500000,
  //       transactionCount: 31,
  //       lastTransactionDate: new Date(2024, 0, 19),
  //     },
  //     {
  //       id: 'user3',
  //       email: 'member3@example.com',
  //       name: '박민수',
  //       photoURL: null,
  //       monthlyExpense: 120000,
  //       monthlyIncome: 50000,
  //       transactionCount: 15,
  //       lastTransactionDate: new Date(2024, 0, 18),
  //     },
  //   ];
  //   setGroupMembers(dummyMembers);
  // }, []);

  // 전체 구성원 통계 계산
  const getTotalStats = () => {
    const totalIncome = groupMembers.reduce((sum, member) => sum + member.monthlyIncome, 0);
    const totalExpense = groupMembers.reduce((sum, member) => sum + member.monthlyExpense, 0);
    const totalTransactions = groupMembers.reduce((sum, member) => sum + member.transactionCount, 0);
    
    return {
      totalIncome,
      totalExpense,
      totalTransactions,
      netAmount: totalIncome - totalExpense,
    };
  };

  // 멤버별 지출 비율 계산
  const getMemberExpenseRatio = (memberExpense: number) => {
    const totalExpense = groupMembers.reduce((sum, member) => sum + member.monthlyExpense, 0);
    return totalExpense > 0 ? (memberExpense / totalExpense) * 100 : 0;
  };

  // 기간 선택 핸들러
  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
  };

  const totalStats = getTotalStats();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>구성원 현황</Text>
        
        {/* 명수 표시 */}
        <View style={styles.memberCountContainer}>
          <View style={styles.memberCountBadge}>
            <Text style={styles.memberCountIcon}>👥</Text>
            <Text style={styles.memberCountText}>{groupMembers.length}명</Text>
          </View>
        </View>
        
        {/* 기간 선택 */}
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextActive,
              ]}>
                {period === 'week' ? '주간' : period === 'month' ? '월간' : '연간'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 전체 요약 카드 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>이번 달 전체 현황</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 수입</Text>
              <Text style={[styles.statValue, styles.incomeValue]}>
                +{formatCurrency(totalStats.totalIncome)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 지출</Text>
              <Text style={[styles.statValue, styles.expenseValue]}>
                -{formatCurrency(totalStats.totalExpense)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>순수익</Text>
              <Text style={[
                styles.statValue,
                totalStats.netAmount >= 0 ? styles.incomeValue : styles.expenseValue,
              ]}>
                {totalStats.netAmount >= 0 ? '+' : ''}{formatCurrency(totalStats.netAmount)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>총 거래</Text>
              <Text style={styles.statValue}>
                {totalStats.totalTransactions}건
              </Text>
            </View>
          </View>
        </View>

        {/* 멤버별 현황 */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>구성원별 현황</Text>
          
          {groupMembers.map((member) => {
            const expenseRatio = getMemberExpenseRatio(member.monthlyExpense);
            const savings = member.monthlyIncome - member.monthlyExpense;
            
            return (
              <View key={member.id} style={styles.memberCard}>
                {/* 멤버 정보 */}
                <View style={styles.memberHeader}>
                  <View style={styles.memberInfo}>
                    <View style={styles.avatar}>
                      {member.photoURL ? (
                        <Image source={{ uri: member.photoURL }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarText}>
                          {member.name.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.memberStats}>
                    <Text style={styles.transactionCount}>{member.transactionCount}건</Text>
                    <Text style={styles.lastTransaction}>
                      {member.lastTransactionDate 
                        ? `${member.lastTransactionDate.getMonth() + 1}/${member.lastTransactionDate.getDate()}`
                        : '기록 없음'
                      }
                    </Text>
                  </View>
                </View>

                {/* 수입/지출 정보 */}
                <View style={styles.memberFinances}>
                  <View style={styles.financeItem}>
                    <Text style={styles.financeLabel}>수입</Text>
                    <Text style={[styles.financeValue, styles.incomeValue]}>
                      +{formatCurrency(member.monthlyIncome)}
                    </Text>
                  </View>
                  
                  <View style={styles.financeItem}>
                    <Text style={styles.financeLabel}>지출</Text>
                    <Text style={[styles.financeValue, styles.expenseValue]}>
                      -{formatCurrency(member.monthlyExpense)}
                    </Text>
                  </View>
                  
                  <View style={styles.financeItem}>
                    <Text style={styles.financeLabel}>절약</Text>
                    <Text style={[
                      styles.financeValue,
                      savings >= 0 ? styles.incomeValue : styles.expenseValue,
                    ]}>
                      {savings >= 0 ? '+' : ''}{formatCurrency(savings)}
                    </Text>
                  </View>
                </View>

                {/* 지출 비율 바 */}
                <View style={styles.expenseRatioSection}>
                  <View style={styles.expenseRatioHeader}>
                    <Text style={styles.expenseRatioLabel}>그룹 지출 비율</Text>
                    <Text style={styles.expenseRatioValue}>{expenseRatio.toFixed(1)}%</Text>
                  </View>
                  
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${expenseRatio}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  memberCountContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  memberCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0', // 따뜻한 오렌지 크림 배경
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF9800', // 진한 오렌지 테두리
    elevation: 2,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  memberCountIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  memberCountText: {
    fontSize: 16,
    color: '#E65100', // 진한 오렌지로 대비 강화
    fontWeight: '700',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  incomeValue: {
    color: '#059669',
  },
  expenseValue: {
    color: '#DC2626',
  },
  membersSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  memberCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.surface,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  memberEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  transactionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  lastTransaction: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  memberFinances: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  financeItem: {
    flex: 1,
    alignItems: 'center',
  },
  financeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  financeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseRatioSection: {
    marginTop: 8,
  },
  expenseRatioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseRatioLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expenseRatioValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default FamilyStatusScreen;
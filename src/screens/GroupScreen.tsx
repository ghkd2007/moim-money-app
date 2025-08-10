import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants';
import { formatCurrency } from '../utils';
import { getCurrentUser } from '../services/authService';
import { groupService, userService, transactionService } from '../services/dataService';
import { Group, User, Transaction } from '../types';
import CategoryManagementModal from '../components/CategoryManagementModal';

interface MemberStats extends User {
  isOwner: boolean;
  income: number;
  expense: number;
  transactionCount: number;
  lastTransactionDate?: Date;
}



const GroupScreen: React.FC = () => {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStats[]>([]);

  const [loading, setLoading] = useState(true);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, []);

  /**
   * 모임 데이터 로드
   */
  const loadGroupData = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      // 사용자가 속한 모든 그룹 가져오기
      const groups = await groupService.getByUser(user.uid);
      setAllGroups(groups);
      
      if (groups.length === 0) return;

      const group = groups[0]; // 첫 번째 그룹을 현재 그룹으로 설정
      setCurrentGroup(group);

      // 구성원별 통계 계산
      await loadMemberStatistics(group);
    } catch (error) {
      console.error('모임 데이터 로드 실패:', error);
      Alert.alert('오류', '모임 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 구성원별 통계 로드
   */
  const loadMemberStatistics = async (group: Group) => {
    try {
      const memberStatsData: MemberStats[] = [];

      for (const memberId of group.members) {
        // 사용자 정보 가져오기
        let memberData: User | null = null;
        try {
          memberData = await userService.getById(memberId);
        } catch (error) {
          console.error(`멤버 ${memberId} 정보 조회 실패:`, error);
        }

        // 기본 멤버 정보 설정
        const baseMember: User = memberData || {
          uid: memberId,
          email: null,
          displayName: `사용자 ${memberId.substring(0, 6)}`,
          photoURL: null,
        };

        // 거래 내역 기반으로 통계 계산
        const { income, expense, transactionCount, lastTransactionDate } = 
          await calculateMemberStats(group.id, memberId);

        memberStatsData.push({
          ...baseMember,
          isOwner: memberId === group.createdBy,
          income,
          expense,
          transactionCount,
          lastTransactionDate,
        });
      }

      setMemberStats(memberStatsData);
    } catch (error) {
      console.error('구성원 통계 로드 실패:', error);
    }
  };

  /**
   * 구성원별 통계 계산
   */
  const calculateMemberStats = async (groupId: string, userId: string) => {
    try {
      // 기간 설정
      const now = new Date();
      let startDate: Date;
      
      // 이번 달 기준으로 고정
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      // 해당 기간의 모든 거래 내역 가져오기 (임시로 모든 거래를 가져온 후 필터링)
      const allTransactions = await transactionService.getByGroup(groupId, 1000);
      
      // 사용자별, 기간별 필터링
      const userTransactions = allTransactions.filter(transaction => 
        transaction.userId === userId && 
        new Date(transaction.date) >= startDate
      );

      const income = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const transactionCount = userTransactions.length;

      const lastTransactionDate = userTransactions.length > 0
        ? new Date(Math.max(...userTransactions.map(t => new Date(t.date).getTime())))
        : undefined;

      return { income, expense, transactionCount, lastTransactionDate };
    } catch (error) {
      console.error('구성원 통계 계산 실패:', error);
      return { income: 0, expense: 0, transactionCount: 0, lastTransactionDate: undefined };
    }
  };

  /**
   * 모임 변경
   */
  const handleGroupChange = async (group: Group) => {
    setCurrentGroup(group);
    setShowGroupSelector(false);
    setLoading(true);
    await loadMemberStatistics(group);
    setLoading(false);
  };



  /**
   * 참여 코드 공유하기
   */
  const handleShareInviteCode = async () => {
    if (!currentGroup?.inviteCode) {
      Alert.alert('오류', '참여 코드를 찾을 수 없습니다.');
      return;
    }

    try {
      const shareContent = {
        title: '모임 가계부 초대',
        message: `"${currentGroup.name}" 모임에 참여해보세요!\n\n참여 코드: ${currentGroup.inviteCode}\n\n모임 가계부 앱에서 이 코드를 입력하면 참여할 수 있습니다.`,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('공유 실패:', error);
      Alert.alert(
        '참여 코드',
        `참여 코드: ${currentGroup.inviteCode}\n\n이 코드를 공유하여 다른 사람들을 초대하세요!`
      );
    }
  };



  /**
   * 구성원 통계 카드 렌더링
   */
  const renderMemberCard = (member: MemberStats) => (
    <View key={member.uid} style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {member.displayName ? member.displayName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={styles.memberName}>
              {member.displayName || '이름 없음'}
            </Text>
            {member.isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>모임장</Text>
              </View>
            )}
          </View>
          <Text style={styles.memberEmail}>
            {member.email || '이메일 없음'}
          </Text>
        </View>
      </View>

      {/* 통계 정보 */}
      <View style={styles.memberStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>수입</Text>
          <Text style={[styles.statValue, styles.incomeText]}>
            +{formatCurrency(member.income)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>지출</Text>
          <Text style={[styles.statValue, styles.expenseText]}>
            -{formatCurrency(member.expense)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>거래</Text>
          <Text style={styles.statValue}>
            {member.transactionCount}건
          </Text>
        </View>
      </View>

      {/* 최근 거래일 */}
      {member.lastTransactionDate && (
        <Text style={styles.lastTransaction}>
          최근 거래: {member.lastTransactionDate.toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>모임 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <ScrollView style={styles.scrollView}>
      {/* 헤더 */}
      <View style={styles.header}>
        {/* 모임 정보 헤더 */}
        <View style={styles.groupHeader}>
          <View style={styles.groupInfoContainer}>
            <Text style={styles.groupTitle}>
              {currentGroup?.name || '모임 없음'}
            </Text>
            <View style={styles.memberInfoContainer}>
              <View style={styles.memberCountBadge}>
                <Text style={styles.memberCountIcon}>👥</Text>
                <Text style={styles.memberCountText}>
                  {memberStats.length}명
                </Text>
              </View>
            </View>
          </View>
        </View>




      </View>

      {/* 구성원 통계 */}
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>구성원 통계</Text>
        {memberStats.map(renderMemberCard)}
      </View>

      {/* 카테고리 관리 섹션 */}
      <View style={styles.categorySection}>
        <TouchableOpacity 
          style={styles.categoryButton} 
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.categoryButtonIcon}>🏷️</Text>
          <View style={styles.categoryButtonContent}>
            <Text style={styles.categoryButtonTitle}>카테고리 관리</Text>
            <Text style={styles.categoryButtonSubtitle}>
              수입/지출 카테고리를 추가하고 관리하세요
            </Text>
          </View>
          <Text style={styles.categoryButtonArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 초대 기능 (하단) */}
      <View style={styles.inviteSection}>
        <TouchableOpacity style={styles.inviteButton} onPress={handleShareInviteCode}>
          <Text style={styles.inviteButtonIcon}>👥</Text>
          <View style={styles.inviteButtonContent}>
            <Text style={styles.inviteButtonTitle}>새 멤버 초대하기</Text>
            <Text style={styles.inviteButtonSubtitle}>
              참여 코드를 공유하여 다른 사람들을 초대하세요
            </Text>
          </View>
          <Text style={styles.inviteButtonArrow}>›</Text>
        </TouchableOpacity>

        {/* 참여 코드 정보 */}
        {currentGroup?.inviteCode && (
          <View style={styles.inviteCodeCard}>
            <Text style={styles.inviteCodeLabel}>현재 참여 코드</Text>
            <Text style={styles.inviteCodeText}>{currentGroup.inviteCode}</Text>
          </View>
        )}
      </View>

      {/* 모임 변경 섹션 */}
      <View style={styles.groupSwitchSection}>
        <Text style={styles.groupSwitchTitle}>다른 모임으로 변경</Text>
        
        {allGroups.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupCardsContainer}>
            {allGroups
              .filter(group => group.id !== currentGroup?.id)
              .map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupSwitchCard}
                  onPress={() => handleGroupChange(group)}
                >
                  <View style={styles.groupCardHeader}>
                    <Text style={styles.groupCardIcon}>👥</Text>
                    <Text style={styles.groupCardName}>{group.name}</Text>
                  </View>
                  <Text style={styles.groupCardMembers}>
                    {group.members?.length || 0}명 참여 중
                  </Text>
                  <View style={styles.groupCardFooter}>
                    <Text style={styles.groupCardAction}>변경하기</Text>
                    <Text style={styles.groupCardArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        ) : (
          <View style={styles.singleGroupMessage}>
            <Text style={styles.singleGroupIcon}>🏠</Text>
            <Text style={styles.singleGroupText}>
              현재 참여 중인 모임이 1개입니다.
            </Text>
            <Text style={styles.singleGroupSubText}>
              새로운 모임을 만들거나 초대받아 참여해보세요!
            </Text>
          </View>
        )}
      </View>

      {/* 빈 공간 */}
      <View style={styles.bottomSpacing} />
    </ScrollView>

    {/* 카테고리 관리 모달 */}
    {currentGroup && (
      <CategoryManagementModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        groupId={currentGroup.id}
        onCategoryChange={() => {
          // 카테고리 변경 시 필요한 처리
    
        }}
      />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    position: 'relative',
    backgroundColor: COLORS.surface,
  },
  groupHeader: {
    marginBottom: 20,
  },
  groupInfoContainer: {
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  memberInfoContainer: {
    alignItems: 'center',
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
    fontWeight: '700', // 더 굵게
  },















  membersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  memberCard: {
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
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  ownerBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ownerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  memberEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  lastTransaction: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  categoryButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryButtonContent: {
    flex: 1,
  },
  categoryButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  categoryButtonSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoryButtonArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  inviteSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inviteButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  inviteButtonContent: {
    flex: 1,
  },
  inviteButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  inviteButtonSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  inviteButtonArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  inviteCodeCard: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  inviteCodeLabel: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  inviteCodeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4338CA',
    letterSpacing: 2,
  },
  groupSwitchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  groupSwitchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  groupCardsContainer: {
    flexDirection: 'row',
  },
  groupSwitchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupCardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  groupCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  groupCardMembers: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  groupCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupCardAction: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  groupCardArrow: {
    fontSize: 16,
    color: COLORS.primary,
  },
  singleGroupMessage: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  singleGroupIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  singleGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  singleGroupSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default GroupScreen;

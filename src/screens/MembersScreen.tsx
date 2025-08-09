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
import { getCurrentUser } from '../services/authService';
import { groupService, userService } from '../services/dataService';
import { Group, User } from '../types';

interface MemberInfo extends User {
  isOwner: boolean;
  joinedAt?: Date;
}

const MembersScreen: React.FC = () => {
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembersData();
  }, []);

  /**
   * 구성원 데이터 로드
   */
  const loadMembersData = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      // 사용자가 속한 그룹 가져오기
      const groups = await groupService.getByUser(user.uid);
      if (groups.length === 0) return;

      const group = groups[0];
      setCurrentGroup(group);

      // 그룹 멤버들의 정보 가져오기
      const memberInfos: MemberInfo[] = [];
      
      for (const memberId of group.members) {
        try {
          const memberData = await userService.getById(memberId);
          if (memberData) {
            memberInfos.push({
              ...memberData,
              isOwner: memberId === group.createdBy,
            });
          }
        } catch (error) {
          console.error(`멤버 ${memberId} 정보 조회 실패:`, error);
          // 사용자 정보를 가져올 수 없는 경우 기본 정보 표시
          memberInfos.push({
            uid: memberId,
            email: null,
            displayName: `사용자 ${memberId.substring(0, 6)}`,
            photoURL: null,
            isOwner: memberId === group.createdBy,
          });
        }
      }

      setMembers(memberInfos);
    } catch (error) {
      console.error('구성원 데이터 로드 실패:', error);
      Alert.alert('오류', '구성원 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
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
      // 공유가 실패하면 클립보드에 복사하는 대안 제공
      Alert.alert(
        '참여 코드',
        `참여 코드: ${currentGroup.inviteCode}\n\n이 코드를 공유하여 다른 사람들을 초대하세요!`,
        [
          {
            text: '확인',
            style: 'default',
          }
        ]
      );
    }
  };

  /**
   * 멤버 카드 렌더링
   */
  const renderMemberCard = (member: MemberInfo) => (
    <View key={member.uid} style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {member.displayName ? member.displayName.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>
      
      <View style={styles.memberInfo}>
        <View style={styles.memberHeader}>
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
        
        {member.joinedAt && (
          <Text style={styles.memberJoinDate}>
            참여일: {member.joinedAt.toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>구성원 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>구성원</Text>
        <Text style={styles.subtitle}>
          {currentGroup?.name || '모임'} • {members.length}명
        </Text>
      </View>

      {/* 초대 버튼 */}
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

      {/* 구성원 목록 */}
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>구성원 목록</Text>
        {members.map(renderMemberCard)}
      </View>

      {/* 빈 공간 */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
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
    marginHorizontal: 20,
    marginBottom: 20,
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
  membersSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  memberHeader: {
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
    marginBottom: 2,
  },
  memberJoinDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MembersScreen;

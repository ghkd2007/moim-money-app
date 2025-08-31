import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants';
import { groupService } from '../services/dataService';
import { getCurrentUser } from '../services/authService';

interface GroupSelectionScreenProps {
  onGroupSelected: (groupId: string) => void;
}

const GroupSelectionScreen: React.FC<GroupSelectionScreenProps> = ({ onGroupSelected }) => {
  const [mode, setMode] = useState<'selection' | 'create' | 'join'>('selection');
  const [loading, setLoading] = useState(false);
  
  // 모임 생성 관련 상태
  const [groupName, setGroupName] = useState('');
  
  // 모임 참여 관련 상태
  const [joinCode, setJoinCode] = useState('');

  /**
   * 모임 생성 처리
   */
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('오류', '모임명을 입력해주세요.');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      // 6자리 랜덤 참여 코드 생성
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const groupData = {
        name: groupName.trim(),
        members: [user.uid],
        createdBy: user.uid,
        inviteCode: inviteCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const groupId = await groupService.create(groupData);
      
      // Alert 대신 바로 다음 화면으로 이동
      onGroupSelected(groupId);
      
      // 성공 메시지는 나중에 홈 화면에서 표시
      setTimeout(() => {
        Alert.alert(
          '모임 생성 완료!', 
          `"${groupName.trim()}" 모임이 생성되었습니다.\n참여 코드: ${inviteCode}\n\n이 코드를 공유하여 다른 멤버들을 초대하세요!`
        );
      }, 500);
    } catch (error) {
      console.error('모임 생성 오류:', error);
      Alert.alert('오류', `모임 생성 중 오류가 발생했습니다: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 모임 참여 처리
   */
  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      Alert.alert('오류', '참여 코드를 입력해주세요.');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      // 참여 코드로 모임 찾기
      const group = await groupService.findByInviteCode(joinCode.trim().toUpperCase());
      
      if (!group) {
        Alert.alert('오류', '유효하지 않은 참여 코드입니다.');
        setLoading(false);
        return;
      }

      // 이미 참여한 모임인지 확인
      if (group.members.includes(user.uid)) {
        Alert.alert('알림', '이미 참여한 모임입니다.');
        onGroupSelected(group.id);
        setLoading(false);
        return;
      }

      // 모임에 멤버 추가
      await groupService.addMember(group.id, user.uid);
      
      // Alert 대신 바로 다음 화면으로 이동
              onGroupSelected(group.id);
      
      // 성공 메시지는 나중에 홈 화면에서 표시
      setTimeout(() => {
        Alert.alert(
          '모임 참여 완료!',
          `"${group.name}" 모임에 참여했습니다.`
        );
      }, 500);
    } catch (error) {
      console.error('모임 참여 오류:', error);
      Alert.alert('오류', '모임 참여 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 모임 선택 화면 (메인)
   */
  const renderSelection = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>모</Text>
          </View>
        </View>
        <Text style={styles.title}>모임머니</Text>
        <Text style={styles.subtitle}>모임을 생성하거나 참여해보세요</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.createButton]} 
          onPress={() => setMode('create')}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionTitle}>새 모임 만들기</Text>
          <Text style={styles.actionSubtitle}>새로운 모임을 생성하고 참여 코드를 받아보세요</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.joinButton]} 
          onPress={() => setMode('join')}
        >
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={styles.actionTitle}>모임 참여하기</Text>
          <Text style={styles.actionSubtitle}>참여 코드를 입력하여 기존 모임에 참여하세요</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * 모임 생성 화면
   */
  const renderCreate = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMode('selection')} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>새 모임 만들기</Text>
        <Text style={styles.subtitle}>모임명을 입력해주세요</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="모임명 (예: 대학 동기 모임, 회사 팀 등)"
          value={groupName}
          onChangeText={setGroupName}
          maxLength={30}
        />
        
        <TouchableOpacity 
          style={[styles.submitButton, !groupName.trim() && styles.disabledButton]} 
          onPress={handleCreateGroup}
          disabled={loading || !groupName.trim()}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>모임 생성하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * 모임 참여 화면
   */
  const renderJoin = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMode('selection')} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>모임 참여하기</Text>
        <Text style={styles.subtitle}>참여 코드를 입력해주세요</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="6자리 참여 코드 (예: ABC123)"
          value={joinCode}
          onChangeText={setJoinCode}
          maxLength={6}
          autoCapitalize="characters"
        />
        
        <TouchableOpacity 
          style={[styles.submitButton, !joinCode.trim() && styles.disabledButton]} 
          onPress={handleJoinGroup}
          disabled={loading || !joinCode.trim()}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>모임 참여하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // 모드에 따른 화면 렌더링
  switch (mode) {
    case 'create':
      return renderCreate();
    case 'join':
      return renderJoin();
    default:
      return renderSelection();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  logoIconText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 20,
  },
  actionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButton: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  joinButton: {
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    gap: 20,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupSelectionScreen;

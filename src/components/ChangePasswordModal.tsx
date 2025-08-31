import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { changePassword } from '../services/authService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ visible, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChangePassword = async () => {
    // 입력 검증
    if (!currentPassword.trim()) {
      Alert.alert('오류', '현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('오류', '새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('오류', '새 비밀번호는 6자리 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('오류', '새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('오류', '새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      
      Alert.alert(
        '성공',
        '비밀번호가 성공적으로 변경되었습니다.',
        [{ text: '확인', onPress: handleClose }]
      );
    } catch (error: any) {
      Alert.alert('오류', error.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>비밀번호 변경</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 폼 */}
        <View style={styles.form}>
          <Text style={styles.description}>
            보안을 위해 현재 비밀번호를 입력한 후 새 비밀번호를 설정해주세요.
          </Text>

          {/* 현재 비밀번호 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>현재 비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="현재 비밀번호를 입력하세요"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              editable={!loading}
              autoCapitalize="none"
            />
          </View>

          {/* 새 비밀번호 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>새 비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 입력하세요 (6자리 이상)"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
              autoCapitalize="none"
            />
          </View>

          {/* 새 비밀번호 확인 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>새 비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호를 다시 입력하세요"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              autoCapitalize="none"
            />
          </View>

          {/* 변경 버튼 */}
          <TouchableOpacity
            style={[styles.changeButton, loading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.changeButtonText}>비밀번호 변경</Text>
            )}
          </TouchableOpacity>

          {/* 안내 메시지 */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>비밀번호 요구사항:</Text>
            <Text style={styles.infoText}>• 최소 6자리 이상</Text>
            <Text style={styles.infoText}>• 현재 비밀번호와 다른 비밀번호</Text>
            <Text style={styles.infoText}>• 영문, 숫자 조합 권장</Text>
          </View>
        </View>
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
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerRight: {
    width: 60,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  changeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  infoContainer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default ChangePasswordModal;


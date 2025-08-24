import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, DEFAULT_CATEGORIES } from '../constants';
import { Transaction } from '../types';
import { transactionService } from '../services/dataService';

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onUpdate: (updatedTransaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  visible,
  transaction,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');

  // 편집 모드 시작
  const startEditing = () => {
    if (!transaction) return;
    
    setEditAmount(transaction.amount.toString());
    setEditDescription(transaction.description || '');
    setEditCategory(transaction.category || '');
    setEditDate(transaction.date.toISOString().split('T')[0]);
    setIsEditing(true);
  };

  // 편집 취소
  const cancelEditing = () => {
    setIsEditing(false);
    setEditAmount('');
    setEditDescription('');
    setEditCategory('');
    setEditDate('');
  };

  // 수정 저장
  const handleSave = async () => {
    if (!transaction) return;

    try {
      setLoading(true);
      
      const updatedTransaction: Transaction = {
        ...transaction,
        amount: parseInt(editAmount),
        description: editDescription,
        category: editCategory,
        date: new Date(editDate),
        updatedAt: new Date(),
      };

      await transactionService.update(updatedTransaction);
      onUpdate(updatedTransaction);
      setIsEditing(false);
      Alert.alert('성공', '거래 내역이 수정되었습니다.');
    } catch (error) {
      console.error('거래 내역 수정 실패:', error);
      Alert.alert('오류', '거래 내역 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 삭제 확인
  const handleDelete = () => {
    if (!transaction) return;

    Alert.alert(
      '거래 내역 삭제',
      '정말로 이 거래 내역을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await transactionService.delete(transaction.id);
              onDelete(transaction.id);
              onClose();
              Alert.alert('성공', '거래 내역이 삭제되었습니다.');
            } catch (error) {
              console.error('거래 내역 삭제 실패:', error);
              Alert.alert('오류', '거래 내역 삭제에 실패했습니다.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!transaction) return null;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + '원';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getTypeColor = (type: 'income' | 'expense') => {
    return type === 'income' ? COLORS.primary : '#DC2626';
  };

  const getTypeText = (type: 'income' | 'expense') => {
    return type === 'income' ? '수입' : '지출';
  };

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
            <Text style={styles.headerTitle}>
              {isEditing ? '거래 내역 수정' : '거래 내역 상세'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isEditing ? (
              // 편집 모드
              <View style={styles.editForm}>
                {/* 금액 입력 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>금액</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={editAmount}
                    onChangeText={setEditAmount}
                    placeholder="금액을 입력하세요"
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>

                {/* 설명 입력 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>설명</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder="설명을 입력하세요"
                    multiline
                  />
                </View>

                {/* 카테고리 선택 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>카테고리</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {DEFAULT_CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
                          editCategory === category && styles.selectedCategoryChip,
                        ]}
                        onPress={() => setEditCategory(category)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            editCategory === category && styles.selectedCategoryChipText,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* 날짜 선택 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>날짜</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editDate}
                    onChangeText={setEditDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                {/* 편집 버튼 */}
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={cancelEditing}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.saveButtonText}>저장</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // 상세 보기 모드
              <View style={styles.detailView}>
                {/* 거래 타입 및 금액 */}
                <View style={styles.amountSection}>
                  <Text style={styles.amountLabel}>거래 금액</Text>
                  <Text
                    style={[
                      styles.amountText,
                      { color: getTypeColor(transaction.type) },
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: getTypeColor(transaction.type) },
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {getTypeText(transaction.type)}
                    </Text>
                  </View>
                </View>

                {/* 거래 정보 */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>설명</Text>
                    <Text style={styles.infoValue}>
                      {transaction.description || '설명 없음'}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>카테고리</Text>
                    <Text style={styles.infoValue}>{transaction.category}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>날짜</Text>
                    <Text style={styles.infoValue}>{formatDate(transaction.date)}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>등록일</Text>
                    <Text style={styles.infoValue}>
                      {transaction.createdAt.toLocaleDateString('ko-KR')}
                    </Text>
                  </View>
                </View>

                {/* 액션 버튼 */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={startEditing}
                  >
                    <Text style={styles.editButtonText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.deleteButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
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
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  content: {
    padding: 20,
  },
  detailView: {
    gap: 24,
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  amountLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editForm: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: COLORS.surface,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: COLORS.surface,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectedCategoryChipText: {
    color: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#94A3B8',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionDetailModal;











// 빠른 기록 모달 컴포넌트 - 단일 화면으로 단순화
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { COLORS, DEFAULT_CATEGORIES } from '../constants';
import { formatCurrency } from '../utils';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: {
    amount: number;
    type: 'income' | 'expense';
    categoryId: string;
    memo: string;
  }) => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ visible, onClose, onSave }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [memo, setMemo] = useState('');

  // 초기화
  const resetModal = () => {
    setAmount('');
    setType('expense');
    setSelectedCategory('');
    setMemo('');
  };

  // 모달 닫기
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // 저장
  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('오류', '금액을 입력해주세요.');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('오류', '카테고리를 선택해주세요.');
      return;
    }

    onSave({
      amount: numAmount,
      type,
      categoryId: selectedCategory,
      memo: memo.trim(),
    });

    handleClose();
    Alert.alert('완료', '기록이 저장되었습니다!');
  };



  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.title}>빠른 기록</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>저장</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 수입/지출 토글 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>유형</Text>
            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
                  💸 지출
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
                  💰 수입
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 금액 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>금액</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₩</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>
          </View>

          {/* 카테고리 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <View style={styles.categoryGrid}>
              {DEFAULT_CATEGORIES.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.name && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.name && styles.categoryTextActive,
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 메모 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모 (선택사항)</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="메모를 입력하세요..."
              value={memo}
              onChangeText={setMemo}
              multiline
              maxLength={100}
            />
            <Text style={styles.characterCount}>{memo.length}/100</Text>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.text,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    padding: 0,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: COLORS.surface,
  },
  memoInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
    height: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default QuickAddModal;

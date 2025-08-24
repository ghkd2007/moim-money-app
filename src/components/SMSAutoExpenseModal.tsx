import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { COLORS, DEFAULT_CATEGORIES } from '../constants';
import {
  SMSMessage,
  ParsedExpense,
  readSMSMessages,
  parseExpenseFromSMS,
  showExpenseConfirmation,
  checkSMSPermission,
  requestSMSPermission,
} from '../services/smsService';
import { categoryService } from '../services/dataService';
import { Category } from '../types';
import { getCurrentUser } from '../services/authService';
import { groupService } from '../services/dataService';

interface SMSAutoExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onExpenseAdd: (expense: ParsedExpense, shouldCloseModal?: boolean) => void;
}

const SMSAutoExpenseModal: React.FC<SMSAutoExpenseModalProps> = ({
  visible,
  onClose,
  onExpenseAdd,
}) => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ParsedExpense | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [groupCategories, setGroupCategories] = useState<Category[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  
  // 중복 방지를 위한 상태 추가
  const [addedExpenseIds, setAddedExpenseIds] = useState<Set<string>>(new Set());
  const [filteredExpenses, setFilteredExpenses] = useState<ParsedExpense[]>([]);

  /**
   * 모달 닫기
   */
  const handleClose = () => {
    // 추가된 지출 목록 초기화
    setAddedExpenseIds(new Set());
    onClose();
  };

  useEffect(() => {
    if (visible) {
      checkPermissionAndLoadMessages();
    } else {
      // 모달이 닫힐 때 추가된 지출 목록 초기화
      setAddedExpenseIds(new Set());
    }
  }, [visible]);

  // 중복 제거된 지출 목록 업데이트
  useEffect(() => {
    const filtered = parsedExpenses.filter(expense => {
      const expenseId = generateExpenseId(expense);
      return !addedExpenseIds.has(expenseId);
    });
    setFilteredExpenses(filtered);
  }, [parsedExpenses, addedExpenseIds]);

  /**
   * 지출 고유 ID 생성 (중복 판단용)
   */
  const generateExpenseId = (expense: ParsedExpense): string => {
    // 금액 + 가맹점 + 날짜로 고유 ID 생성
    const dateStr = expense.date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${expense.amount}_${expense.description}_${dateStr}`;
  };

  /**
   * 이미 추가된 지출인지 확인
   */
  const isExpenseAlreadyAdded = (expense: ParsedExpense): boolean => {
    const expenseId = generateExpenseId(expense);
    return addedExpenseIds.has(expenseId);
  };

  /**
   * 그룹별 카테고리 로드
   */
  const loadGroupCategories = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      // 사용자가 속한 그룹 목록 조회 (첫 번째 그룹 사용)
      const groups = await groupService.getByUser(user.uid);
      if (groups.length > 0) {
        const group = groups[0];
        setCurrentGroupId(group.id);
        
        // 해당 그룹의 카테고리 목록 조회
        const categories = await categoryService.getByGroup(group.id);
        setGroupCategories(categories);
      }
    } catch (error) {
      console.error('그룹 카테고리 로드 실패:', error);
      // 오류가 발생해도 기본 카테고리는 사용 가능
    }
  };

  /**
   * 권한 확인 및 메시지 로드
   */
  const checkPermissionAndLoadMessages = async () => {
    try {
      setLoading(true);
      
      // 그룹별 카테고리 먼저 로드
      await loadGroupCategories();
      
      // 권한 확인
      const permission = await checkSMSPermission();
      setHasPermission(permission);
      
      if (permission) {
        // SMS 메시지 읽기
        const smsMessages = await readSMSMessages();
        setMessages(smsMessages);
        
        // 지출 정보 파싱
        const expenses: ParsedExpense[] = [];
        for (const message of smsMessages) {
          const parsed = parseExpenseFromSMS(message.body);
          if (parsed) {
            expenses.push(parsed);
          }
        }
        setParsedExpenses(expenses);
      }
    } catch (error) {
      console.error('SMS 로드 실패:', error);
      Alert.alert('오류', 'SMS 메시지를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * SMS 권한 요청
   */
  const handleRequestPermission = async () => {
    try {
      const granted = await requestSMSPermission();
      if (granted) {
        setHasPermission(true);
        await checkPermissionAndLoadMessages();
      } else {
        Alert.alert('권한 필요', 'SMS 자동 읽기 기능을 사용하려면 SMS 권한이 필요합니다.');
      }
    } catch (error) {
      console.error('권한 요청 실패:', error);
      Alert.alert('오류', '권한 요청 중 오류가 발생했습니다.');
    }
  };

  /**
   * 지출 편집 모달 열기
   */
  const handleEditExpense = (expense: ParsedExpense, index: number) => {
    setEditingExpense({ ...expense });
    setEditingIndex(index);
  };

  /**
   * 편집된 지출 저장
   */
  const handleSaveEdit = () => {
    if (editingExpense && editingIndex >= 0) {
      const updatedExpenses = [...parsedExpenses];
      updatedExpenses[editingIndex] = editingExpense;
      setParsedExpenses(updatedExpenses);
      setEditingExpense(null);
      setEditingIndex(-1);
    }
  };

  /**
   * 편집 취소
   */
  const handleCancelEdit = () => {
    setEditingExpense(null);
    setEditingIndex(-1);
  };

  /**
   * 지출 추가 확인
   */
  const handleExpenseAdd = (expense: ParsedExpense, index: number) => {
    // 이미 추가된 지출인지 확인
    if (isExpenseAlreadyAdded(expense)) {
      Alert.alert('알림', '이미 추가된 지출입니다.');
      return;
    }

    showExpenseConfirmation(
      expense,
      async () => {
        try {
          // 개별 추가이므로 shouldCloseModal을 false로 전달
          await onExpenseAdd(expense, false);
          
          // 추가된 지출 ID를 추적 목록에 추가
          const expenseId = generateExpenseId(expense);
          setAddedExpenseIds(prev => new Set([...prev, expenseId]));
          
          // 성공 알림
          Alert.alert('성공', '지출이 추가되었습니다!');
          
        } catch (error) {
          console.error('개별 지출 추가 중 오류:', error);
          Alert.alert('오류', '지출 추가 중 오류가 발생했습니다.');
        }
      },
      () => {
        // 취소 시 아무것도 하지 않음
      }
    );
  };

  /**
   * 모든 지출 일괄 추가
   */
  const handleAddAllExpenses = () => {
    // 중복 제거된 지출만 필터링
    const availableExpenses = filteredExpenses.filter(expense => 
      !isExpenseAlreadyAdded(expense)
    );
    
    if (availableExpenses.length === 0) {
      Alert.alert('알림', '추가할 수 있는 새로운 지출이 없습니다.');
      return;
    }
    
    Alert.alert(
      '일괄 추가',
      `${availableExpenses.length}개의 새로운 지출을 모두 추가하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '추가',
          onPress: async () => {
            try {
              // 모든 새로운 지출을 순차적으로 추가
              for (let i = 0; i < availableExpenses.length; i++) {
                const expense = availableExpenses[i];
                // 전체 추가이므로 shouldCloseModal을 true로 전달
                await onExpenseAdd(expense, true);
                
                // 추가된 지출 ID를 추적 목록에 추가
                const expenseId = generateExpenseId(expense);
                setAddedExpenseIds(prev => new Set([...prev, expenseId]));
              }
              
              // 성공 알림과 함께 바로 모달 닫기 (홈 화면으로 이동)
              Alert.alert(
                '성공', 
                `${availableExpenses.length}개의 지출이 추가되었습니다!`,
                [
                  {
                    text: '확인',
                    onPress: () => {
                      onClose(); // 바로 홈 화면으로 이동
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('SMS 모달: 일괄 추가 중 오류:', error);
              console.error('SMS 모달: 오류 상세 정보:', error.message, error.stack);
              Alert.alert('오류', '지출 추가 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  /**
   * 메시지 카드 렌더링
   */
  const renderMessageCard = (message: SMSMessage, index: number) => {
    const parsedExpense = parsedExpenses[index];
    const isAlreadyAdded = parsedExpense ? isExpenseAlreadyAdded(parsedExpense) : false;

    // 이미 추가된 항목은 표시하지 않음
    if (isAlreadyAdded) {
      return null;
    }

    return (
      <View key={message.id} style={styles.messageCard}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageAddress}>{message.address}</Text>
          <Text style={styles.messageDate}>
            {message.date.toLocaleString()}
          </Text>
        </View>
        
        <Text style={styles.messageBody}>{message.body}</Text>
        
        {parsedExpense ? (
          <View style={styles.parsedInfo}>
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>💰 금액:</Text>
              <Text style={styles.parsedValue}>
                {parsedExpense.amount.toLocaleString()}원
              </Text>
            </View>
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>📝 내용:</Text>
              <Text style={styles.parsedValue}>{parsedExpense.description}</Text>
            </View>
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>🏷️ 카테고리:</Text>
              <Text style={styles.parsedValue}>{parsedExpense.category}</Text>
            </View>
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>신뢰도:</Text>
              <Text style={styles.parsedValue}>
                {Math.round(parsedExpense.confidence * 100)}%
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              {/* 삭제 버튼 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    'SMS 삭제',
                    '이 SMS를 목록에서 제거하시겠습니까?',
                    [
                      { text: '취소', style: 'cancel' },
                      {
                        text: '삭제',
                        style: 'destructive',
                        onPress: () => {
                          // 해당 SMS를 목록에서 제거
                          const updatedMessages = messages.filter((_, i) => i !== index);
                          const updatedExpenses = parsedExpenses.filter((_, i) => i !== index);
                          setMessages(updatedMessages);
                          setParsedExpenses(updatedExpenses);
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.actionButtonIcon}>🗑️</Text>
              </TouchableOpacity>
              
              {/* 편집 버튼 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditExpense(parsedExpense, index)}
              >
                <Text style={styles.actionButtonIcon}>✏️</Text>
              </TouchableOpacity>
              
              {/* 추가 버튼 */}
              <TouchableOpacity
                style={[styles.actionButton, styles.addButton]}
                onPress={() => handleExpenseAdd(parsedExpense, index)}
              >
                <Text style={styles.actionButtonIcon}>➕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noParseInfo}>
            <Text style={styles.noParseText}>
              💡 지출 정보를 자동으로 인식할 수 없습니다.
            </Text>
            <Text style={styles.noParseSubtext}>
              수동으로 기록해주세요.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SMS 자동 지출 추가</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 권한이 없는 경우 */}
        {!hasPermission && !loading && (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>📱 SMS 권한이 필요합니다</Text>
            <Text style={styles.permissionDescription}>
              은행이나 카드사에서 보내는 결제 알림을 자동으로 읽어와서
              지출에 추가할 수 있습니다.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRequestPermission}
            >
              <Text style={styles.permissionButtonText}>권한 허용하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 로딩 중 */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>SMS 메시지를 불러오는 중...</Text>
          </View>
        )}

        {/* 메시지 목록 */}
        {hasPermission && !loading && messages.length > 0 && (
          <ScrollView style={styles.content}>
            {/* 일괄 추가 버튼 */}
            {filteredExpenses.length > 0 && (
              <TouchableOpacity
                style={styles.addAllButton}
                onPress={handleAddAllExpenses}
              >
                <Text style={styles.addAllButtonText}>
                  🚀 모든 지출 일괄 추가 ({filteredExpenses.length}개)
                </Text>
              </TouchableOpacity>
            )}

            {/* 메시지 카드들 */}
            {messages.map((message, index) => renderMessageCard(message, index))}
            
            {/* 이미 추가된 항목이 있는 경우 안내 메시지 */}
            {addedExpenseIds.size > 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  💡 이미 추가된 지출 {addedExpenseIds.size}개는 표시되지 않습니다.
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setAddedExpenseIds(new Set());
                    Alert.alert('알림', '추가된 지출 목록이 초기화되었습니다.');
                  }}
                >
                  <Text style={styles.resetButtonText}>목록 초기화</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* 메시지가 없는 경우 */}
        {hasPermission && !loading && messages.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>SMS 메시지가 없습니다</Text>
            <Text style={styles.emptyText}>
              은행이나 카드사에서 보낸 결제 알림이 없습니다.
            </Text>
          </View>
        )}
      </View>

      {/* 편집 모달 */}
      {editingExpense && (
        <Modal
          visible={true}
          presentationStyle="formSheet"
        >
          <View style={styles.editModal}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>지출 편집</Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editContent}>
              <View style={styles.editSection}>
                <Text style={styles.editLabel}>💰 금액</Text>
                <TextInput
                  style={styles.editInput}
                  value={editingExpense.amount.toString()}
                  onChangeText={(text) => {
                    const amount = parseFloat(text) || 0;
                    setEditingExpense({ ...editingExpense, amount });
                  }}
                  keyboardType="numeric"
                  placeholder="금액을 입력하세요"
                />
              </View>
              
              <View style={styles.editSection}>
                <Text style={styles.editLabel}>📝 설명</Text>
                <TextInput
                  style={styles.editInput}
                  value={editingExpense.description}
                  onChangeText={(text) => {
                    setEditingExpense({ ...editingExpense, description: text });
                  }}
                  placeholder="설명을 입력하세요"
                  multiline
                />
              </View>
              
                                   <View style={styles.editSection}>
                    <Text style={styles.editLabel}>🏷️ 카테고리</Text>
                    
                    {/* 그룹별 카테고리 섹션 */}
                    {groupCategories.length > 0 && (
                      <>
                        <Text style={styles.categorySectionTitle}>📁 모임 카테고리</Text>
                        <View style={styles.categoryGrid}>
                          {groupCategories.map((category, index) => (
                            <TouchableOpacity
                              key={`group-${category.id}`}
                              style={[
                                styles.categoryButton,
                                editingExpense.category === category.name && styles.categoryButtonActive,
                              ]}
                              onPress={() => {
                                setEditingExpense({ ...editingExpense, category: category.name });
                              }}
                            >
                              <Text style={styles.categoryIcon}>{category.icon || '📁'}</Text>
                              <Text style={[
                                styles.categoryText,
                                editingExpense.category === category.name && styles.categoryTextActive,
                              ]}>
                                {category.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}
                    
                    {/* 기본 카테고리 섹션 */}
                    <Text style={styles.categorySectionTitle}>📋 기본 카테고리</Text>
                    <View style={styles.categoryGrid}>
                      {DEFAULT_CATEGORIES.map((category, index) => (
                        <TouchableOpacity
                          key={`default-${index}`}
                          style={[
                            styles.categoryButton,
                            editingExpense.category === category.name && styles.categoryButtonActive,
                          ]}
                          onPress={() => {
                            setEditingExpense({ ...editingExpense, category: category.name });
                          }}
                        >
                          <Text style={styles.categoryIcon}>{category.icon}</Text>
                          <Text style={[
                            styles.categoryText,
                            editingExpense.category === category.name && styles.categoryTextActive,
                          ]}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
            </ScrollView>
            
            <View style={styles.editFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  addAllButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addAllButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  messageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  messageDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  messageBody: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  parsedInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  parsedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parsedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  parsedValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 2,
    textAlign: 'right',
  },
  noParseInfo: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
  },
  noParseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  noParseSubtext: {
    fontSize: 12,
    color: '#92400E',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 16,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    // 터치 피드백
    activeOpacity: 0.7,
  },
  actionButtonIcon: {
    fontSize: 24,
    color: COLORS.surface, // 아이콘 색상을 흰색으로 설정
  },
  addAllButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addAllButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // 편집 모달 스타일
  editModal: {
    flex: 1,
    backgroundColor: 'white',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  editContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  editSection: {
    marginTop: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  categorySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  editFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  infoContainer: {
    backgroundColor: '#E0F2F7',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F77',
    marginBottom: 12,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  addButton: {
    backgroundColor: '#81C784', // 차분한 민트 초록색
    borderColor: '#81C784',
  },
});

export default SMSAutoExpenseModal;

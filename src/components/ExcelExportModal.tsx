import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { Transaction, Group } from '../types';
import { transactionService } from '../services/dataService';
import { getCurrentUser } from '../services/authService';
import { exportTransactionsToExcel, getPredefinedPeriods, validateExportOptions, ExportOptions } from '../services/excelExportService';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentGroup: Group | null;
}

const ExcelExportModal: React.FC<Props> = ({ visible, onClose, currentGroup }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);
  const [groupMembers, setGroupMembers] = useState<{[key: string]: string}>({});

  const predefinedPeriods = getPredefinedPeriods();

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

  // 거래내역 개수 미리보기
  const loadTransactionCount = async () => {
    if (!currentGroup) return;

    try {
      const user = getCurrentUser();
      if (!user) return;

      let transactions: Transaction[] = [];

      if (selectedPeriod === 'all') {
        // 전체 기간 - 올해 데이터만
        const currentYear = new Date().getFullYear();
        for (let month = 1; month <= 12; month++) {
          try {
            const monthlyTransactions = await transactionService.getByMonth(currentGroup.id, currentYear, month);
            transactions = transactions.concat(monthlyTransactions);
          } catch (error) {
            // 해당 월에 데이터가 없을 수 있음
          }
        }
      } else {
        const period = predefinedPeriods.find(p => p.label === selectedPeriod);
        if (period) {
          const startYear = period.startDate.getFullYear();
          const startMonth = period.startDate.getMonth() + 1;
          const endYear = period.endDate.getFullYear();
          const endMonth = period.endDate.getMonth() + 1;

          for (let year = startYear; year <= endYear; year++) {
            const monthStart = year === startYear ? startMonth : 1;
            const monthEnd = year === endYear ? endMonth : 12;
            
            for (let month = monthStart; month <= monthEnd; month++) {
              try {
                const monthlyTransactions = await transactionService.getByMonth(currentGroup.id, year, month);
                // 기간 필터링
                const filteredTransactions = monthlyTransactions.filter(t => {
                  const transactionDate = new Date(t.date);
                  return transactionDate >= period.startDate && transactionDate <= period.endDate;
                });
                transactions = transactions.concat(filteredTransactions);
              } catch (error) {
                // 해당 월에 데이터가 없을 수 있음
              }
            }
          }
        }
      }

      setTransactionCount(transactions.length);
    } catch (error) {
      console.error('거래내역 개수 로드 실패:', error);
      setTransactionCount(0);
    }
  };

  // 엑셀 내보내기 실행
  const handleExport = async () => {
    if (!currentGroup) {
      Alert.alert('오류', '모임 정보를 찾을 수 없습니다.');
      return;
    }

    if (transactionCount === 0) {
      Alert.alert('알림', '내보낼 거래내역이 없습니다.');
      return;
    }

    try {
      setLoading(true);
      
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // 거래내역 로드
      let transactions: Transaction[] = [];
      let exportOptions: ExportOptions = {
        groupId: currentGroup.id,
        groupName: currentGroup.name,
      };

      if (selectedPeriod === 'all') {
        // 전체 기간
        const currentYear = new Date().getFullYear();
        for (let month = 1; month <= 12; month++) {
          try {
            const monthlyTransactions = await transactionService.getByMonth(currentGroup.id, currentYear, month);
            transactions = transactions.concat(monthlyTransactions);
          } catch (error) {
            // 해당 월에 데이터가 없을 수 있음
          }
        }
      } else {
        const period = predefinedPeriods.find(p => p.label === selectedPeriod);
        if (period) {
          exportOptions.startDate = period.startDate;
          exportOptions.endDate = period.endDate;

          const startYear = period.startDate.getFullYear();
          const startMonth = period.startDate.getMonth() + 1;
          const endYear = period.endDate.getFullYear();
          const endMonth = period.endDate.getMonth() + 1;

          for (let year = startYear; year <= endYear; year++) {
            const monthStart = year === startYear ? startMonth : 1;
            const monthEnd = year === endYear ? endMonth : 12;
            
            for (let month = monthStart; month <= monthEnd; month++) {
              try {
                const monthlyTransactions = await transactionService.getByMonth(currentGroup.id, year, month);
                // 기간 필터링
                const filteredTransactions = monthlyTransactions.filter(t => {
                  const transactionDate = new Date(t.date);
                  return transactionDate >= period.startDate && transactionDate <= period.endDate;
                });
                transactions = transactions.concat(filteredTransactions);
              } catch (error) {
                // 해당 월에 데이터가 없을 수 있음
              }
            }
          }
        }
      }

      // 날짜순 정렬 (최신순)
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // 엑셀 내보내기
      await exportTransactionsToExcel(transactions, currentGroup, exportOptions);
      
      Alert.alert(
        '성공',
        `${transactions.length}건의 거래내역을 엑셀 파일로 내보냈습니다.`,
        [{ text: '확인', onPress: onClose }]
      );

    } catch (error: any) {
      Alert.alert('오류', error.message || '엑셀 내보내기 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Modal이 열릴 때 데이터 로드
  useEffect(() => {
    if (visible && currentGroup) {
      loadGroupMembers();
      loadTransactionCount();
    }
  }, [visible, currentGroup, selectedPeriod]);

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
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>엑셀 내보내기</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 설명 */}
          <Text style={styles.description}>
            거래내역을 엑셀 파일로 내보내서 다른 앱에서 확인하거나 편집할 수 있습니다.
          </Text>

          {/* 현재 모임 정보 */}
          <View style={styles.groupInfo}>
            <Text style={styles.groupInfoTitle}>내보낼 모임</Text>
            <Text style={styles.groupInfoName}>{currentGroup?.name || '모임 없음'}</Text>
          </View>

          {/* 기간 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내보낼 기간</Text>
            
            <TouchableOpacity
              style={[styles.periodOption, selectedPeriod === 'all' && styles.periodOptionSelected]}
              onPress={() => setSelectedPeriod('all')}
            >
              <Text style={[
                styles.periodOptionText,
                selectedPeriod === 'all' && styles.periodOptionTextSelected
              ]}>
                전체 (올해)
              </Text>
            </TouchableOpacity>

            {predefinedPeriods.map((period) => (
              <TouchableOpacity
                key={period.label}
                style={[styles.periodOption, selectedPeriod === period.label && styles.periodOptionSelected]}
                onPress={() => setSelectedPeriod(period.label)}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === period.label && styles.periodOptionTextSelected
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 미리보기 */}
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>내보낼 데이터</Text>
            <Text style={styles.previewCount}>
              총 {transactionCount}건의 거래내역
            </Text>
            <Text style={styles.previewColumns}>
              컬럼: 날짜, 구분, 카테고리, 금액, 메모, 작성자
            </Text>
          </View>

          {/* 내보내기 버튼 */}
          <TouchableOpacity
            style={[styles.exportButton, loading && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.exportButtonText}>엑셀 파일로 내보내기</Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  groupInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  groupInfoTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  groupInfoName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  periodOption: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  periodOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  preview: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  previewCount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  previewColumns: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default ExcelExportModal;

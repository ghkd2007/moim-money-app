import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { COLORS, CATEGORY_ICONS, DEFAULT_CATEGORIES } from '../constants';
import { Category } from '../types';
import { categoryService } from '../services/dataService';

const { width: screenWidth } = Dimensions.get('window');

interface CategoryManagementModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  onCategoryChange: () => void;
}

const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  visible,
  onClose,
  groupId,
  onCategoryChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>(CATEGORY_ICONS[0] || "💰");
  const [currentPage, setCurrentPage] = useState(0);
  const iconsPerPage = 16; // 4x4 그리드 (한 페이지당 16개 아이콘)

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible, groupId]);

  /**
   * 카테고리 목록 로드
   */
  const loadCategories = async () => {
    try {
      const loadedCategories = await categoryService.getByGroup(groupId);
      
      // 기본 카테고리와 그룹별 카테고리를 합쳐서 표시
      const allCategories = [
        // 기본 카테고리들을 먼저 표시
        ...DEFAULT_CATEGORIES.map(defaultCat => ({
          ...defaultCat,
          id: `default-${defaultCat.name}`,
          groupId: groupId,
          createdAt: new Date(),
        })),
        // 그룹별 카테고리들
        ...loadedCategories.filter(cat => !cat.isDefault)
      ];
      
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('오류', '카테고리를 불러올 수 없습니다.');
    }
  };

  /**
   * 카테고리 추가/수정 모달 열기
   */
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setNewCategoryName(category.name);
      setSelectedIcon(category.icon || CATEGORY_ICONS[0] || "💰");
    } else {
      setEditingCategory(null);
      setNewCategoryName('');
      setSelectedIcon(CATEGORY_ICONS[0] || "💰");
    }
    setCurrentPage(0); // 페이지 리셋
    setShowAddModal(true);
  };

  /**
   * 카테고리 저장
   */
  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('오류', '카테고리 이름을 입력해주세요.');
      return;
    }

    if (editingCategory) {
      // 수정 - 기본 카테고리도 수정 가능
      try {
        await categoryService.update(editingCategory.id, {
          name: newCategoryName.trim(),
          icon: selectedIcon,
          // 기본 카테고리인 경우 isDefault 속성 유지
          isDefault: editingCategory.isDefault,
        });
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: newCategoryName.trim(), icon: selectedIcon }
            : cat
        ));
        Alert.alert('완료', '카테고리가 수정되었습니다.');
        onCategoryChange();
      } catch (error) {
        console.error('Error updating category:', error);
        Alert.alert('오류', '카테고리를 수정할 수 없습니다.');
      }
    } else {
      // 추가
      try {
        const newCategory: Category = {
          id: Date.now().toString(), // 임시 ID, 실제 사용 시 서버에서 생성
          groupId: groupId,
          name: newCategoryName.trim(),
          icon: selectedIcon,
          isDefault: false,
          createdAt: new Date(),
        };
        await categoryService.create(newCategory);
        setCategories(prev => [...prev, newCategory]);
        Alert.alert('완료', '카테고리가 추가되었습니다.');
        onCategoryChange();
      } catch (error) {
        console.error('Error adding category:', error);
        Alert.alert('오류', '카테고리를 추가할 수 없습니다.');
      }
    }

    setShowAddModal(false);
  };

  /**
   * 카테고리 삭제
   */
  const handleDeleteCategory = async (category: Category) => {
    if (category.isDefault) {
      Alert.alert('알림', '기본 카테고리는 삭제할 수 없습니다.');
      return;
    }

    Alert.alert(
      '카테고리 삭제',
      `"${category.name}" 카테고리를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryService.delete(category.id);
              setCategories(prev => prev.filter(cat => cat.id !== category.id));
              onCategoryChange();
              Alert.alert('완료', '카테고리가 삭제되었습니다.');
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('오류', '카테고리를 삭제할 수 없습니다.');
            }
          }
        }
      ]
    );
  };

  /**
   * 카테고리 카드 렌더링
   */
  const renderCategoryCard = (category: Category) => (
    <View key={category.id} style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <View style={styles.categoryText}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {category.isDefault && (
            <Text style={styles.defaultBadge}>기본</Text>
          )}
        </View>
      </View>
      
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openCategoryModal(category)}
        >
          <Text style={styles.editButtonText}>수정</Text>
        </TouchableOpacity>
        
        {!category.isDefault && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCategory(category)}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  /**
   * 아이콘 선택기 렌더링 - 강제 4x4 그리드
   */
  const renderIconPicker = () => {
    const startIndex = currentPage * iconsPerPage;
    const endIndex = startIndex + iconsPerPage;
    const currentIcons = CATEGORY_ICONS.slice(startIndex, endIndex);
    const totalPages = Math.ceil(CATEGORY_ICONS.length / iconsPerPage);

    // 강제 4x4 그리드 계산
    const gridSize = Math.min(screenWidth - 80, 300); // 최대 300px로 제한
    const iconSize = gridSize / 4; // 정확히 4등분
    const gridPadding = 20;

    console.log(`그리드 크기: ${gridSize}px, 아이콘 크기: ${iconSize}px`);

    // 4x4 그리드 위치 계산 함수
    const getIconPosition = (index: number) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const left = col * iconSize + gridPadding;
      const top = row * iconSize + gridPadding;
      return { left, top };
    };

    return (
      <View style={styles.iconPicker}>
        <Text style={styles.iconPickerTitle}>아이콘 선택</Text>
        
        {/* 강제 4x4 그리드 */}
        <View style={[
          styles.forcedIconGrid,
          {
            width: gridSize + gridPadding * 2,
            height: gridSize + gridPadding * 2,
          }
        ]}>
          {currentIcons.map((icon, index) => {
            const position = getIconPosition(index);
            return (
              <TouchableOpacity
                key={startIndex + index}
                style={[
                  styles.forcedIconButton,
                  {
                    position: 'absolute',
                    left: position.left,
                    top: position.top,
                    width: iconSize - 4,
                    height: iconSize - 4,
                  },
                  selectedIcon === icon && styles.forcedIconButtonSelected,
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Text style={styles.forcedIconText}>{icon}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <View style={styles.forcedPagination}>
            <TouchableOpacity
              style={[
                styles.forcedPageButton,
                currentPage === 0 && styles.forcedPageButtonDisabled
              ]}
              onPress={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              <Text style={styles.forcedPageButtonText}>◀</Text>
            </TouchableOpacity>
            
            <Text style={styles.forcedPageInfo}>
              {currentPage + 1} / {totalPages}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.forcedPageButton,
                currentPage === totalPages - 1 && styles.forcedPageButtonDisabled
              ]}
              onPress={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              <Text style={styles.forcedPageButtonText}>▶</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* 메인 카테고리 관리 모달 */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>카테고리 관리</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 카테고리 목록 */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>카테고리 목록</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openCategoryModal()}
                >
                  <Text style={styles.addButtonText}>+ 추가</Text>
                </TouchableOpacity>
              </View>
              
              {categories.map(renderCategoryCard)}
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
      </Modal>

      {/* 카테고리 추가/수정 모달 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingCategory ? '카테고리 수정' : '카테고리 추가'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 폼 */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>카테고리 이름</Text>
              <TextInput
                style={styles.formInput}
                placeholder="카테고리 이름을 입력하세요"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                maxLength={20}
              />
            </View>

            {renderIconPicker()}

            {/* 미리보기 */}
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>미리보기</Text>
              <View style={styles.previewCard}>
                <Text style={styles.previewIcon}>{selectedIcon}</Text>
                <Text style={styles.previewName}>
                  {newCategoryName.trim() || '카테고리 이름'}
                </Text>
              </View>
            </View>

            {/* 저장 버튼 */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                !newCategoryName.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveCategory}
              disabled={!newCategoryName.trim()}
            >
              <Text style={styles.saveButtonText}>
                {editingCategory ? '수정 완료' : '카테고리 추가'}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  defaultBadge: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  deleteButtonText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  formSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  iconPicker: {
    marginBottom: 24,
  },
  iconPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  // 강제 4x4 그리드 스타일
  forcedIconGrid: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
    position: 'relative',
  },
  forcedIconButton: {
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface,
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  forcedIconButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 2,
  },
  forcedIconText: {
    fontSize: 18,
    color: COLORS.text,
  },
  // 강제 페이지네이션 스타일
  forcedPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
    paddingHorizontal: 20,
  },
  forcedPageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  forcedPageButtonDisabled: {
    backgroundColor: COLORS.surface,
  },
  forcedPageButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  forcedPageInfo: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  previewIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.surface,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CategoryManagementModal;




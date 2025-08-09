// 앱 상수 정의

// 색상 상수
export const COLORS = {
  // 기본 색상
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  
  // 수입/지출 색상
  income: '#34C759', // 파란색 → 초록색으로 변경 (더 직관적)
  expense: '#FF3B30', // 빨간색
  
  // 배경 색상
  background: '#F2F2F7',
  surface: '#FFFFFF',
  
  // 텍스트 색상
  text: '#000000',
  textSecondary: '#6D6D80',
  textLight: '#8E8E93',
  
  // 테두리 색상
  border: '#C6C6C8',
  separator: '#E5E5EA',
} as const;

// 기본 카테고리 목록
export const DEFAULT_CATEGORIES = [
  { name: '식비', color: '#FF9500', icon: '🍽️' },
  { name: '교통비', color: '#007AFF', icon: '🚗' },
  { name: '문화생활', color: '#5856D6', icon: '🎬' },
  { name: '쇼핑', color: '#FF3B30', icon: '🛍️' },
  { name: '의료비', color: '#34C759', icon: '🏥' },
  { name: '교육비', color: '#FF2D92', icon: '📚' },
  { name: '기타', color: '#8E8E93', icon: '💰' },
] as const;

// 화면 크기 관련 상수
export const SCREEN = {
  padding: 16,
  borderRadius: 12,
  headerHeight: 60,
} as const;

// 애니메이션 상수
export const ANIMATION = {
  duration: 300,
  easing: 'ease-in-out',
} as const;

// 앱 정보
export const APP_INFO = {
  name: '모임 가계부',
  version: '1.0.0',
  description: '모임 단위로 수입/지출을 관리하는 공동 가계부',
} as const;

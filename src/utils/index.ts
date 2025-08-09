// 유틸리티 함수들

/**
 * 금액을 한국 원화 형식으로 포맷팅
 * @param amount 금액
 * @returns 포맷된 금액 문자열 (예: "10,000원")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
};

/**
 * 숫자를 천 단위 콤마로 포맷팅
 * @param number 숫자
 * @returns 포맷된 숫자 문자열 (예: "10,000")
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('ko-KR').format(number);
};

/**
 * 날짜를 한국 형식으로 포맷팅
 * @param date 날짜 객체
 * @returns 포맷된 날짜 문자열 (예: "2024년 1월 15일")
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * 날짜를 짧은 형식으로 포맷팅
 * @param date 날짜 객체
 * @returns 포맷된 날짜 문자열 (예: "1/15")
 */
export const formatDateShort = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(date);
};

/**
 * 시간을 포맷팅
 * @param date 날짜 객체
 * @returns 포맷된 시간 문자열 (예: "오후 2:30")
 */
export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * 이메일 유효성 검사
 * @param email 이메일 주소
 * @returns 유효한 이메일인지 여부
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 유효성 검사
 * @param password 비밀번호
 * @returns 유효한 비밀번호인지 여부 (최소 6자리)
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * 문자열이 비어있는지 확인
 * @param str 문자열
 * @returns 비어있는지 여부
 */
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * 랜덤 ID 생성
 * @returns 랜덤 문자열 ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * 월의 첫 번째와 마지막 날짜 구하기
 * @param date 기준 날짜
 * @returns 월의 첫 번째와 마지막 날짜
 */
export const getMonthRange = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start, end };
};

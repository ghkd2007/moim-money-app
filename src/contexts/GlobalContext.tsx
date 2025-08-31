import React, { createContext, useContext } from 'react';

// 전역 상태 컨텍스트 타입 정의
interface GlobalContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  currentGroup: any | null;
}

// 기본값으로 컨텍스트 생성
const GlobalContext = createContext<GlobalContextType>({
  refreshTrigger: 0,
  triggerRefresh: () => {},
  currentGroup: null,
});

// 커스텀 훅으로 컨텍스트 사용을 간편하게
export const useGlobalContext = () => useContext(GlobalContext);

// 컨텍스트 기본 export
export default GlobalContext;

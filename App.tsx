import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import GroupSelectionScreen from './src/screens/GroupSelectionScreen';
// import { FirebaseTest } from './src/components/FirebaseTest'; // 테스트 완료로 제거
import { onAuthChange, AuthUser, getCurrentUser } from './src/services/authService';
import { groupService } from './src/services/dataService';
import { COLORS } from './src/constants';
import GlobalContext from './src/contexts/GlobalContext';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentGroup, setCurrentGroup] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 전역 새로고침 트리거 함수
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Firebase Auth 상태 변경 리스너
    const unsubscribe = onAuthChange(async (authUser) => {

      
      setUser(authUser);
      
      if (authUser) {
        // 로그인된 경우 사용자의 그룹 확인
        try {
          const groups = await groupService.getByUser(authUser.uid);
          
          if (groups.length > 0) {
            setHasGroup(true);
            setCurrentGroupId(groups[0].id);
            setCurrentGroup(groups[0]);
          } else {
            setHasGroup(false);
            setCurrentGroup(null);
          }
        } catch (error) {
          console.error('App: 그룹 조회 오류:', error);
          setHasGroup(false);
        }
      } else {
        // 로그아웃된 경우

        setHasGroup(null);
        setCurrentGroupId(null);
        setCurrentGroup(null);
      }
      
      setIsLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return unsubscribe;
  }, []);

  // 그룹 선택 완료 핸들러
  const handleGroupSelected = async (groupId: string) => {
    setCurrentGroupId(groupId);
    setHasGroup(true);
    
    // 선택된 그룹의 전체 정보를 로드
    try {
      const user = getCurrentUser();
      if (user) {
        const groups = await groupService.getByUser(user.uid);
        const selectedGroup = groups.find(g => g.id === groupId);
        setCurrentGroup(selectedGroup || null);
      }
    } catch (error) {
      console.error('그룹 정보 로드 실패:', error);
    }
  };

  // 로딩 중 화면
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GlobalContext.Provider value={{ refreshTrigger, triggerRefresh, currentGroup }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <NavigationContainer>
            {!user ? (
              // 로그인하지 않은 경우
              <LoginScreen onLoginSuccess={() => {}} />
            ) : hasGroup === false ? (
              // 로그인했지만 그룹이 없는 경우
              <GroupSelectionScreen onGroupSelected={handleGroupSelected} />
            ) : (
              // 로그인하고 그룹이 있는 경우
              <TabNavigator />
            )}
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GlobalContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import GroupSelectionScreen from './src/screens/GroupSelectionScreen';
// import { FirebaseTest } from './src/components/FirebaseTest'; // 테스트 완료로 제거
import { onAuthChange, AuthUser } from './src/services/authService';
import { groupService } from './src/services/dataService';
import { COLORS } from './src/constants';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

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
          } else {
            setHasGroup(false);
          }
        } catch (error) {
          console.error('그룹 조회 오류:', error);
          setHasGroup(false);
        }
      } else {
        setHasGroup(null);
        setCurrentGroupId(null);
      }
      
      setIsLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return unsubscribe;
  }, []);

  // 그룹 선택 완료 핸들러
  const handleGroupSelected = (groupId: string) => {
    setCurrentGroupId(groupId);
    setHasGroup(true);
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

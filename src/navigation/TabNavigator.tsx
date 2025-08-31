// 하단 탭 네비게이션 - Dribbble 스타일 다크 테마
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

import HomeScreen from '../screens/HomeScreen';
import GroupScreen from '../screens/GroupScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GroupSelectionScreen from '../screens/GroupSelectionScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Group Stack Navigator
const GroupStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="GroupMain" 
        component={GroupScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GroupSelection" 
        component={GroupSelectionScreen} 
        options={{ 
          title: '새 모임 만들기',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Lucide 스타일 아이콘 컴포넌트 - 글래스모피즘 효과
const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <View style={[styles.iconBackground, focused && styles.iconBackgroundFocused]}>
      <Text style={[styles.iconText, { color: focused ? COLORS.background : COLORS.text }]}>
        ⌂
      </Text>
    </View>
    <Text 
      style={[
        styles.iconLabel, 
        { color: focused ? COLORS.primaryLight : COLORS.textSecondary },
        focused && styles.iconLabelFocused
      ]}
      numberOfLines={1}
      ellipsizeMode="clip"
    >
      홈
    </Text>
  </View>
);

const GroupIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <View style={[styles.iconBackground, focused && styles.iconBackgroundFocused]}>
      <Text style={[styles.iconText, { color: focused ? COLORS.background : COLORS.text }]}>
        ⚇
      </Text>
    </View>
    <Text 
      style={[
        styles.iconLabel, 
        { color: focused ? COLORS.primaryLight : COLORS.textSecondary },
        focused && styles.iconLabelFocused
      ]}
      numberOfLines={1}
      ellipsizeMode="clip"
    >
      모임
    </Text>
  </View>
);

const SettingsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <View style={[styles.iconBackground, focused && styles.iconBackgroundFocused]}>
      <Text style={[styles.iconText, { color: focused ? COLORS.background : COLORS.text }]}>
        ⚙
      </Text>
    </View>
    <Text 
      style={[
        styles.iconLabel, 
        { color: focused ? COLORS.primaryLight : COLORS.textSecondary },
        focused && styles.iconLabelFocused
      ]}
      numberOfLines={1}
      ellipsizeMode="clip"
    >
      설정
    </Text>
  </View>
);

const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.glass,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 0,
          shadowOpacity: 0,
          paddingVertical: 15, // 패딩을 더 늘림
          height: 90 + Math.max(insets.bottom, 10), // 높이를 더 늘림
          paddingBottom: Math.max(insets.bottom, 10),
          backdropFilter: 'blur(20px)',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon color={color} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Group"
        component={GroupStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <GroupIcon color={color} focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <SettingsIcon color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  iconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconBackgroundFocused: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconLabel: {
    fontSize: 10, // 폰트 크기 적당히 조정
    fontWeight: '500', // 폰트 굵기도 줄임
    textAlign: 'center',
    minWidth: 60, // 최소 너비를 더 넓게
    maxWidth: 70, // 최대 너비도 더 넓게
    flexShrink: 0, // 텍스트가 줄어들지 않도록
  },
  iconLabelFocused: {
    // 선택된 상태 배경 효과
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 14, // 여유 공간을 더 확보
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 60, // 최소 너비를 더 넓게
    maxWidth: 70, // 최대 너비도 더 넓게
    flexShrink: 0, // 텍스트가 줄어들지 않도록
  },
});

export default TabNavigator;
// 하단 탭 네비게이션
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

import HomeScreen from '../screens/HomeScreen';
import GroupScreen from '../screens/GroupScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// 모던한 아이콘 컴포넌트 - 배경색 없이 깔끔하게
const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <Text style={[styles.iconText, { color: COLORS.primary }]}>
      🏠
    </Text>
    <Text style={[styles.iconLabel, { color: focused ? COLORS.primary : COLORS.textSecondary }]}>
      홈
    </Text>
  </View>
);

const GroupIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <Text style={[styles.iconText, { color: COLORS.primary }]}>
      👥
    </Text>
    <Text style={[styles.iconLabel, { color: focused ? COLORS.primary : COLORS.textSecondary }]}>
      모임
    </Text>
  </View>
);

const SettingsIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <Text style={[styles.iconText, { color: COLORS.primary }]}>
      ⚙️
    </Text>
    <Text style={[styles.iconLabel, { color: focused ? COLORS.primary : COLORS.textSecondary }]}>
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
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingVertical: 8,
          height: 60 + Math.max(insets.bottom, 10), // 적절한 크기로 조정
          paddingBottom: Math.max(insets.bottom, 10),
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarShowLabel: false, // 기본 라벨 숨김 (커스텀 라벨 사용)
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
        component={GroupScreen}
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
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 8, // 상단 여백 추가
  },
  iconContainerFocused: {
    transform: [{ scale: 1.05 }], // 확대 효과 줄임
  },
  iconText: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
});

export default TabNavigator;




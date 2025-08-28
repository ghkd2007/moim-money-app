// 하단 탭 네비게이션 - Dribbble 스타일 다크 테마
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

import HomeScreen from '../screens/HomeScreen';
import GroupScreen from '../screens/GroupScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Lucide 스타일 아이콘 컴포넌트 - 글래스모피즘 효과
const HomeIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <View style={[styles.iconBackground, focused && styles.iconBackgroundFocused]}>
      <Text style={[styles.iconText, { color: focused ? COLORS.background : COLORS.text }]}>
        ⌂
      </Text>
    </View>
    <Text style={[
      styles.iconLabel, 
      { color: focused ? COLORS.primaryLight : COLORS.textSecondary },
      focused && styles.iconLabelFocused
    ]}>
      홈
    </Text>
  </View>
);

const GroupIcon = ({ color, focused }: { color: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <View style={[styles.iconBackground, focused && styles.iconBackgroundFocused]}>
      <Text style={[styles.iconText, { color: focused ? COLORS.background : COLORS.text }]}>
        👥
      </Text>
    </View>
    <Text style={[
      styles.iconLabel, 
      { color: focused ? COLORS.primaryLight : COLORS.textSecondary },
      focused && styles.iconLabelFocused
    ]}>
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
    <Text style={[
      styles.iconLabel, 
      { color: focused ? COLORS.primaryLight : COLORS.textSecondary },
      focused && styles.iconLabelFocused
    ]}>
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
          paddingVertical: 12,
          height: 80 + Math.max(insets.bottom, 10),
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
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLabelFocused: {
    // 선택된 상태 배경 효과
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default TabNavigator;
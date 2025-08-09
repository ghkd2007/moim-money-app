// 하단 탭 네비게이션
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { COLORS } from '../constants';

import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import FamilyStatusScreen from '../screens/FamilyStatusScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingVertical: 8,
          height: 80,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>
              {focused ? '🏠' : '🏠'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: '달력',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>
              {focused ? '📅' : '📅'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="FamilyStatus"
        component={FamilyStatusScreen}
        options={{
          tabBarLabel: '가족현황',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>
              {focused ? '👨‍👩‍👧‍👦' : '👨‍👩‍👧‍👦'}
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>
              {focused ? '⚙️' : '⚙️'}
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

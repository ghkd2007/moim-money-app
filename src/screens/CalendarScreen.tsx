// 달력 화면
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const CalendarScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>달력</Text>
      <Text style={styles.subtitle}>달력 기능이 곧 추가됩니다!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default CalendarScreen;




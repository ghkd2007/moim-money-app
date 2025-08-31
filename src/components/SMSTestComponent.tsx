import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants';
import { SMSTestUtils } from '../services/realSMSService';

interface SMSTestComponentProps {
  onClose: () => void;
}

const SMSTestComponent: React.FC<SMSTestComponentProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log('SMS Test:', message);
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  const testPermissions = async () => {
    setLoading(true);
    addLog('권한 테스트 시작...');
    
    try {
      const status = await SMSTestUtils.testPermissions();
      addLog(`권한 상태: ${JSON.stringify(status, null, 2)}`);
      
      if (status.hasPermission) {
        Alert.alert('성공!', 'SMS 읽기 권한이 허용되었습니다.');
      } else if (status.canRequest) {
        Alert.alert('권한 필요', '권한을 요청해주세요.');
      } else {
        Alert.alert('지원 안함', status.message);
      }
    } catch (error) {
      addLog(`권한 테스트 실패: ${error.message}`);
      Alert.alert('오류', '권한 테스트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const testReadSMS = async () => {
    setLoading(true);
    addLog('SMS 읽기 테스트 시작...');
    
    try {
      const messages = await SMSTestUtils.testReadSMS();
      addLog(`SMS 읽기 성공: ${messages.length}개 메시지 발견`);
      
      messages.forEach((msg, index) => {
        addLog(`메시지 ${index + 1}: ${msg.address} - ${msg.body.substring(0, 50)}...`);
      });
      
      Alert.alert(
        '성공!', 
        `${messages.length}개의 SMS 메시지를 성공적으로 읽었습니다.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      addLog(`SMS 읽기 실패: ${error.message}`);
      Alert.alert('오류', `SMS 읽기 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SMS 권한 및 읽기 테스트</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.testButton, styles.permissionButton]} 
          onPress={testPermissions}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>
            📱 SMS 권한 테스트
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, styles.readButton]} 
          onPress={testReadSMS}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>
            📨 SMS 읽기 테스트
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, styles.clearButton]} 
          onPress={clearLogs}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>
            🗑️ 로그 지우기
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>테스트 진행 중...</Text>
        </View>
      )}

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>테스트 로그:</Text>
        <ScrollView style={styles.logScroll} showsVerticalScrollIndicator={true}>
          {testResults.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
          {testResults.length === 0 && (
            <Text style={styles.noLogText}>
              테스트를 실행하면 로그가 여기에 표시됩니다.
            </Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>📋 테스트 안내:</Text>
        <Text style={styles.infoText}>
          • 권한 테스트: Android SMS 읽기 권한 요청 및 확인{'\n'}
          • SMS 읽기 테스트: 실제 SMS 메시지 읽기 시도{'\n'}
          • Android 기기에서만 작동합니다{'\n'}
          • 권한이 허용되면 시뮬레이션 데이터가 표시됩니다
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  testButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
  },
  readButton: {
    backgroundColor: COLORS.secondary,
  },
  clearButton: {
    backgroundColor: COLORS.surface,
  },
  testButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: COLORS.text,
    marginTop: 10,
    fontSize: 14,
  },
  logContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  logScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  noLogText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  infoContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 15,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default SMSTestComponent;


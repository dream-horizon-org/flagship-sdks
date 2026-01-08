import { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform, NativeModules, ScrollView } from 'react-native';
import { multiply, setContext, getBooleanValue, getStringValue, getIntegerValue, getDoubleValue, getObjectValue, initializeAsync, initializeSync } from '@d11/flagship-rn-sdk';
import config from './config.json';

const { NativeNavigation } = NativeModules;

const result = multiply(3, 7);

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [contextSet, setContextSet] = useState<boolean | null>(null);
  const [syncTestResult, setSyncTestResult] = useState<string | null>(null);
  const [asyncTestResult, setAsyncTestResult] = useState<string | null>(null);
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean | null>(null);
  const [stringValue, setStringValue] = useState<string | null>(null);
  const [integerValue, setIntegerValue] = useState<number | null>(null);
  const [doubleValue, setDoubleValue] = useState<number | null>(null);
  const [objectValue, setObjectValue] = useState<any | null>(null);

  const testSyncInit = () => {
    const startTime = Date.now();
    try {
      const baseUrl = config.baseUrl;
      const success = initializeSync({
        baseUrl,
        flagshipApiKey: config.flagshipApiKey, 
        refreshInterval: 5,
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      setSyncTestResult(`✓ Success in ${duration}ms`);
      setIsInitialized(success);
      console.log(`[SYNC] Initialized in ${duration}ms`);
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      setSyncTestResult(`✗ Failed in ${duration}ms: ${error.message}`);
      setInitError(error.message || 'Initialization failed');
      console.error('[SYNC] Initialization failed:', error);
    }
  };

  const testAsyncInit = async () => {
    const startTime = Date.now();
    try {
      const baseUrl = config.baseUrl;
      await initializeAsync({
        baseUrl,
        flagshipApiKey: config.flagshipApiKey, 
        refreshInterval: 5,
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      setAsyncTestResult(`✓ Success in ${duration}ms`);
      setIsInitialized(true);
      console.log(`[ASYNC] Initialized in ${duration}ms`);
    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      setAsyncTestResult(`✗ Failed in ${duration}ms: ${error.message}`);
      setInitError(error.message || 'Initialization failed');
      console.error('[ASYNC] Initialization failed:', error);
    }
  };

  const handleSetContext = () => {
    try {
      const success = setContext({
        targetingKey: '3456',
        user_tier: 'premium',
        country: 'US',
        user_group: 'beta_testers',
        is_logged_in: true,
        is_accessibility_user: true,
        device: 'mobile',
        theme_pref: 'light',
        session_count: 150.0,
        region: 'US',
        userId: 3456,
        app_version: '2.3.0',
        profile: {
          age: 31,
          city: 'Mumbai',
          skills: ['Kotlin', 'React Native', 'TypeScript'],
        },
      });
      setContextSet(success);
      console.log('FlagshipRnSdk setContext result:', success);
    } catch (error) {
      console.error('FlagshipRnSdk setContext failed:', error);
      setContextSet(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Flagship RN SDK Example</Text>
      <Text style={styles.result}>Multiply Result: {result}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Control Panel</Text>
        <TouchableOpacity style={[styles.button, styles.asyncButton]} onPress={testAsyncInit}>
          <Text style={styles.buttonText}>Initialize Async</Text>
        </TouchableOpacity>
        {asyncTestResult && (
          <Text style={styles.testResult}>{asyncTestResult}</Text>
        )}
        
        <TouchableOpacity style={[styles.button, styles.syncButton]} onPress={testSyncInit}>
          <Text style={styles.buttonText}>Initialize Sync</Text>
        </TouchableOpacity>
        {syncTestResult && (
          <Text style={styles.testResult}>{syncTestResult}</Text>
        )}
        
        <TouchableOpacity style={[styles.button, styles.contextButton]} onPress={handleSetContext}>
          <Text style={styles.buttonText}>Set Context</Text>
        </TouchableOpacity>
        {contextSet !== null && (
          <Text style={contextSet ? styles.statusSuccess : styles.statusError}>
            Context: {contextSet ? '✓ Set' : '✗ Failed'}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SDK Status</Text>
        {isInitialized ? (
          <Text style={styles.statusSuccess}>✓ Initialized</Text>
        ) : initError ? (
          <Text style={styles.statusError}>✗ Error: {initError}</Text>
        ) : (
          <Text style={styles.statusPending}>⏳ Not Initialized</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          try {
            const value = getBooleanValue('should_enable_vmax_sdk', false);
            setDarkModeEnabled(value);
            console.log('FlagshipRnSdk getBooleanValue dark_mode_toggle:', value);
          } catch (error) {
            console.error('FlagshipRnSdk getBooleanValue failed:', error);
            setDarkModeEnabled(null);
          }
        }}
      >
        <Text style={styles.buttonText}>Evaluate Dark Mode Toggle</Text>
      </TouchableOpacity>
      {darkModeEnabled !== null && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Dark Mode Toggle:</Text>
          <Text style={darkModeEnabled ? styles.statusSuccess : styles.statusPending}>
            {darkModeEnabled ? '✓ Enabled' : '✗ Disabled'}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          try {
            const value = getIntegerValue('search_result_limit', 10);
            setIntegerValue(value);
            console.log('FlagshipRnSdk getIntegerValue search_result_limit:', value);
          } catch (error) {
            console.error('FlagshipRnSdk getIntegerValue failed:', error);
            setIntegerValue(null);
          }
        }}
      >
        <Text style={styles.buttonText}>Evaluate Search Result Limit</Text>
      </TouchableOpacity>
      {integerValue !== null && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Search Result Limit (Integer):</Text>
          <Text style={styles.statusSuccess}>Value: {integerValue}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          try {
            const value = getStringValue('homepage_layout_test', 'default');
            setStringValue(value);
            console.log('FlagshipRnSdk getStringValue homepage_layout_test:', value);
          } catch (error) {
            console.error('FlagshipRnSdk getStringValue failed:', error);
            setStringValue(null);
          }
        }}
      >
        <Text style={styles.buttonText}>Evaluate Homepage Layout</Text>
      </TouchableOpacity>
      {stringValue !== null && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Homepage Layout:</Text>
          <Text style={styles.statusSuccess}>Value: {stringValue}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          try {
            const value = getDoubleValue('search_result_limit', 10.0);
            setDoubleValue(value);
            console.log('FlagshipRnSdk getDoubleValue search_result_limit:', value);
          } catch (error) {
            console.error('FlagshipRnSdk getDoubleValue failed:', error);
            setDoubleValue(null);
          }
        }}
      >
        <Text style={styles.buttonText}>Evaluate Search Result Limit (Double)</Text>
      </TouchableOpacity>
      {doubleValue !== null && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Search Result Limit (Double):</Text>
          <Text style={styles.statusSuccess}>Value: {doubleValue}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          try {
            const value = getObjectValue('recommendations_config', { limit: 10, enabled: false });
            setObjectValue(value);
            console.log('FlagshipRnSdk getObjectValue recommendations_config:', value);
          } catch (error) {
            console.error('FlagshipRnSdk getObjectValue failed:', error);
            setObjectValue(null);
          }
        }}
      >
        <Text style={styles.buttonText}>Evaluate Recommendations Config</Text>
      </TouchableOpacity>
      {objectValue !== null && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Recommendations Config:</Text>
          <Text style={styles.statusSuccess}>
            {JSON.stringify(objectValue, null, 2)}
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.button, styles.nativeButton]}
        onPress={() => {
          NativeNavigation?.openNativeFeatureFlagScreen();
        }}
      >
        <Text style={styles.buttonText}>Open Native {Platform.OS === 'android' ? 'Android' : 'iOS'} Screen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  section: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  testResult: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  result: {
    fontSize: 18,
    marginBottom: 30,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  statusSuccess: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
  },
  statusError: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  statusPending: {
    fontSize: 16,
    color: 'orange',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    opacity: 1,
    width: '100%',
  },
  asyncButton: {
    backgroundColor: '#4CAF50',
  },
  syncButton: {
    backgroundColor: '#FF9800',
  },
  contextButton: {
    backgroundColor: '#9C27B0',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nativeButton: {
    backgroundColor: '#4CAF50',
  },
});

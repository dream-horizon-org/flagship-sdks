import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OpenFeature } from '@openfeature/web-sdk';
import { FlagshipProvider, multiply } from '@flagship/js-provider';

const provider = new FlagshipProvider({
  baseURL: 'https://api.flagship.io',
  flagshipApiKey: 'test-key',
  refreshInterval: 30
});

OpenFeature.setProvider(provider);

function AppContent() {
  const [multiplyResult, setMultiplyResult] = useState<number | null>(null);
  const [booleanResult, setBooleanResult] = useState<boolean | null>(null);
  const [stringResult, setStringResult] = useState<string | null>(null);
  const [numberResult, setNumberResult] = useState<number | null>(null);
  const [objectResult, setObjectResult] = useState<any | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [stringFlag, setStringFlag] = useState<string>('default');
  const [numberFlag, setNumberFlag] = useState<number>(10);
  const [objectFlag, setObjectFlag] = useState<any>({ limit: 10, enabled: false });

  useEffect(() => {
    const client = OpenFeature.getClient();
    
    OpenFeature.setContext({
      targetingKey: '3456',
      user_tier: 'premium',
      country: 'US',
      user_group: 'beta_testers',
      is_logged_in: true,
      is_accessibility_user: true,
      device: 'mobile',
      theme_pref: 'light',
      session_count: 150,
      region: 'US',
      userId: 3456,
      app_version: '2.3.0'
    });

    setDarkMode(client.getBooleanValue('dark-mode', false));
    setStringFlag(client.getStringValue('homepage_layout', 'default'));
    setNumberFlag(client.getNumberValue('search_result_limit', 10));
    setObjectFlag(client.getObjectValue('recommendations_config', { limit: 10, enabled: false }));
  }, []);

  const handleMultiply = () => {
    const result = multiply(3, 7);
    setMultiplyResult(result);
  };

  const handleBooleanTest = () => {
    const client = OpenFeature.getClient();
    const value = client.getBooleanValue('dark-mode', false);
    setBooleanResult(value);
  };

  const handleStringTest = () => {
    const client = OpenFeature.getClient();
    const value = client.getStringValue('homepage_layout', 'default');
    setStringResult(value);
  };

  const handleNumberTest = () => {
    const client = OpenFeature.getClient();
    const value = client.getNumberValue('search_result_limit', 10);
    setNumberResult(value);
  };

  const handleObjectTest = () => {
    const client = OpenFeature.getClient();
    const value = client.getObjectValue('recommendations_config', { limit: 10, enabled: false });
    setObjectResult(value);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Flagship JS Provider Example</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Multiply Function Test</Text>
        <TouchableOpacity style={styles.button} onPress={handleMultiply}>
          <Text style={styles.buttonText}>Test Multiply (3 × 7)</Text>
        </TouchableOpacity>
        {multiplyResult !== null && (
          <Text style={styles.result}>Result: {multiplyResult}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feature Flags (Hooks)</Text>
        <View style={styles.flagDisplay}>
          <Text style={styles.flagText}>
            <Text style={styles.bold}>Dark Mode (Boolean):</Text> {darkMode ? 'ON' : 'OFF'}
          </Text>
          <Text style={styles.flagText}>
            <Text style={styles.bold}>Homepage Layout (String):</Text> {stringFlag}
          </Text>
          <Text style={styles.flagText}>
            <Text style={styles.bold}>Search Limit (Number):</Text> {numberFlag}
          </Text>
          <Text style={styles.flagText}>
            <Text style={styles.bold}>Recommendations (Object):</Text> {JSON.stringify(objectFlag)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feature Flag Tests (Client API)</Text>
        
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleBooleanTest}>
          <Text style={styles.buttonText}>Test Boolean Flag</Text>
        </TouchableOpacity>
        {booleanResult !== null && (
          <Text style={styles.result}>Boolean: {booleanResult ? 'true' : 'false'}</Text>
        )}

        <TouchableOpacity style={[styles.button, styles.buttonSuccess]} onPress={handleStringTest}>
          <Text style={styles.buttonText}>Test String Flag</Text>
        </TouchableOpacity>
        {stringResult !== null && (
          <Text style={styles.result}>String: {stringResult}</Text>
        )}

        <TouchableOpacity style={[styles.button, styles.buttonWarning]} onPress={handleNumberTest}>
          <Text style={styles.buttonText}>Test Number Flag</Text>
        </TouchableOpacity>
        {numberResult !== null && (
          <Text style={styles.result}>Number: {numberResult}</Text>
        )}

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleObjectTest}>
          <Text style={styles.buttonText}>Test Object Flag</Text>
        </TouchableOpacity>
        {objectResult !== null && (
          <Text style={styles.result}>Object: {JSON.stringify(objectResult, null, 2)}</Text>
        )}
      </View>
    </ScrollView>
  );
}

export default function App() {
  return <AppContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonWarning: {
    backgroundColor: '#FF9500',
  },
  buttonSecondary: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    fontSize: 14,
  },
  flagDisplay: {
    marginTop: 10,
  },
  flagText: {
    marginBottom: 8,
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
});

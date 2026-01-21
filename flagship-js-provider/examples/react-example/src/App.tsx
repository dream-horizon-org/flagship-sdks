import { useState, useEffect } from 'react';
import { OpenFeature, OpenFeatureProvider, useFlag, useStringFlagValue, useNumberFlagValue, useObjectFlagValue } from '@openfeature/react-sdk';
import { FlagshipProvider, multiply } from '@flagship/js-provider';
import './App.css';

let provider: FlagshipProvider | null = null;

function initializeProvider() {
  if (!provider) {
    try {
      provider = new FlagshipProvider({
        baseURL: 'https://api.flagship.io',
        flagshipApiKey: 'test-key',
        refreshInterval: 30
      });
      OpenFeature.setProvider(provider);
    } catch (error) {
      console.error('Failed to initialize FlagshipProvider:', error);
    }
  }
  return provider;
}

function AppContent() {
  const [multiplyResult, setMultiplyResult] = useState<number | null>(null);
  const [booleanResult, setBooleanResult] = useState<boolean | null>(null);
  const [stringResult, setStringResult] = useState<string | null>(null);
  const [numberResult, setNumberResult] = useState<number | null>(null);
  const [objectResult, setObjectResult] = useState<any | null>(null);

  const darkMode = useFlag('dark-mode', false);
  const stringFlag = useStringFlagValue('homepage_layout', 'default');
  const numberFlag = useNumberFlagValue('search_result_limit', 10);
  const objectFlag = useObjectFlagValue('recommendations_config', { limit: 10, enabled: false });

  useEffect(() => {
    initializeProvider();
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
    <div className="App">
      <header className="App-header">
        <h1>Flagship JS Provider Example</h1>
        
        <section className="section">
          <h2>Multiply Function Test</h2>
          <button onClick={handleMultiply}>Test Multiply (3 × 7)</button>
          {multiplyResult !== null && (
            <p className="result">Result: {multiplyResult}</p>
          )}
        </section>

        <section className="section">
          <h2>Feature Flags (Hooks)</h2>
          <div className="flag-display">
            <p><strong>Dark Mode (Boolean):</strong> {darkMode.value ? 'ON' : 'OFF'}</p>
            <p><strong>Homepage Layout (String):</strong> {stringFlag}</p>
            <p><strong>Search Limit (Number):</strong> {numberFlag}</p>
            <p><strong>Recommendations (Object):</strong> {JSON.stringify(objectFlag)}</p>
          </div>
        </section>

        <section className="section">
          <h2>Feature Flag Tests (Client API)</h2>
          
          <div className="button-group">
            <button className="btn-primary" onClick={handleBooleanTest}>
              Test Boolean Flag
            </button>
            {booleanResult !== null && (
              <p className="result">Boolean: {booleanResult ? 'true' : 'false'}</p>
            )}
          </div>

          <div className="button-group">
            <button className="btn-success" onClick={handleStringTest}>
              Test String Flag
            </button>
            {stringResult !== null && (
              <p className="result">String: {stringResult}</p>
            )}
          </div>

          <div className="button-group">
            <button className="btn-warning" onClick={handleNumberTest}>
              Test Number Flag
            </button>
            {numberResult !== null && (
              <p className="result">Number: {numberResult}</p>
            )}
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={handleObjectTest}>
              Test Object Flag
            </button>
            {objectResult !== null && (
              <p className="result">Object: {JSON.stringify(objectResult, null, 2)}</p>
            )}
          </div>
        </section>
      </header>
    </div>
  );
}

function App() {
  return (
    <OpenFeatureProvider>
      <AppContent />
    </OpenFeatureProvider>
  );
}

export default App;

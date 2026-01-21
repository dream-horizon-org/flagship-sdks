import readline from 'readline';
import { OpenFeature } from '@openfeature/server-sdk';
import { FlagshipProvider, multiply } from '../../src/index.ts';

let provider;
let client;

async function initializeProvider() {
  provider = new FlagshipProvider({
    baseURL: 'https://api.flagship.io',
    flagshipApiKey: 'test-key',
    refreshInterval: 30
  });
  
  await provider.ensureInitialized();
  OpenFeature.setProvider(provider);
  client = OpenFeature.getClient();
}

// Set initial context
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

// Create interactive interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\n📋 Flagship Provider Test Menu:');
  console.log('================================');
  console.log('1. Test Boolean Flag (dark-mode)');
  console.log('2. Test String Flag (homepage_layout)');
  console.log('3. Test Number Flag (search_result_limit)');
  console.log('4. Test Object Flag (recommendations_config)');
  console.log('5. Test Multiply Function');
  console.log('6. Set Context');
  console.log('7. Show Current Context');
  console.log('8. Test All Flags');
  console.log('9. Exit');
  console.log('\nEnter your choice (1-9):');
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function handleChoice(choice) {
  console.log('');
  
  switch(choice.trim()) {
    case '1':
      try {
        const boolValue = client.getBooleanValue('dark-mode', false);
        console.log(`✅ Boolean Flag Result: ${boolValue ? 'true' : 'false'}`);
        console.log(`   Flag Key: dark-mode`);
        console.log(`   Default Value: false`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      break;
      
    case '2':
      try {
        const stringValue = client.getStringValue('homepage_layout', 'default');
        console.log(`✅ String Flag Result: "${stringValue}"`);
        console.log(`   Flag Key: homepage_layout`);
        console.log(`   Default Value: "default"`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      break;
      
    case '3':
      try {
        const numberValue = client.getNumberValue('search_result_limit', 10);
        console.log(`✅ Number Flag Result: ${numberValue}`);
        console.log(`   Flag Key: search_result_limit`);
        console.log(`   Default Value: 10`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      break;
      
    case '4':
      try {
        const objectValue = client.getObjectValue('recommendations_config', { limit: 10, enabled: false });
        console.log(`✅ Object Flag Result:`);
        console.log(JSON.stringify(objectValue, null, 2));
        console.log(`   Flag Key: recommendations_config`);
        console.log(`   Default Value: { limit: 10, enabled: false }`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      break;
      
    case '5':
      try {
        const result = multiply(3, 7);
        console.log(`✅ Multiply Function Result: 3 × 7 = ${result}`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      break;
      
    case '6':
      try {
        console.log('📝 Setting Context...');
        const targetingKey = await askQuestion('Enter targetingKey (or press Enter to keep current): ');
        const country = await askQuestion('Enter country (or press Enter to keep current): ');
        const userTier = await askQuestion('Enter user_tier (or press Enter to keep current): ');
        
        const newContext = {};
        if (targetingKey) newContext.targetingKey = targetingKey;
        if (country) newContext.country = country;
        if (userTier) newContext.user_tier = userTier;
        
        const currentContext = OpenFeature.getContext();
        OpenFeature.setContext({
          ...currentContext,
          ...newContext
        });
        
        console.log('✅ Context updated successfully!');
        console.log('New context:', JSON.stringify(OpenFeature.getContext(), null, 2));
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      break;
      
    case '7':
      try {
        const context = OpenFeature.getContext();
        console.log('📝 Current Context:');
        console.log(JSON.stringify(context, null, 2));
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      break;
      
    case '8':
      try {
        console.log('🧪 Testing All Flags...\n');
        
        console.log('1. Boolean Flag:');
        const boolValue = client.getBooleanValue('dark-mode', false);
        console.log(`   ✅ Result: ${boolValue ? 'true' : 'false'}\n`);
        
        console.log('2. String Flag:');
        const stringValue = client.getStringValue('homepage_layout', 'default');
        console.log(`   ✅ Result: "${stringValue}"\n`);
        
        console.log('3. Number Flag:');
        const numberValue = client.getNumberValue('search_result_limit', 10);
        console.log(`   ✅ Result: ${numberValue}\n`);
        
        console.log('4. Object Flag:');
        const objectValue = client.getObjectValue('recommendations_config', { limit: 10, enabled: false });
        console.log(`   ✅ Result:`, JSON.stringify(objectValue, null, 2));
        console.log('');
        
        console.log('5. Multiply Function:');
        const multiplyResult = multiply(3, 7);
        console.log(`   ✅ Result: 3 × 7 = ${multiplyResult}\n`);
        
        console.log('✅ All tests completed!');
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      break;
      
    case '9':
      console.log('\n👋 Goodbye!');
      rl.close();
      process.exit(0);
      break;
      
    default:
      console.log('❌ Invalid choice. Please enter a number between 1-9.');
  }
}

async function start() {
  console.clear();
  console.log('🚀 Flagship Provider Interactive Tester');
  console.log('========================================\n');
  
  try {
    await initializeProvider();
    console.log('Provider initialized successfully!');
    console.log('Initial context set.');
    console.log('\nUse the menu below to test the provider:');
  } catch (error) {
    console.error('Failed to initialize provider:', error);
    process.exit(1);
  }
  
  while (true) {
    showMenu();
    const choice = await askQuestion('');
    await handleChoice(choice);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

start();


// Simple test script for the chat API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Chat API...\n');

  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test chat endpoint
  try {
    console.log('\n2. Testing chat endpoint...');
    const chatRes = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Tell me about Tejas Ghodke'
      })
    });
    
    const chatData = await chatRes.json();
    console.log('✅ Chat response:', chatData);
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
  }

  // Test invalid request
  try {
    console.log('\n3. Testing invalid request...');
    const invalidRes = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const invalidData = await invalidRes.json();
    console.log('✅ Invalid request handled:', invalidData);
  } catch (error) {
    console.log('❌ Invalid request test failed:', error.message);
  }

  console.log('\n🎉 API testing complete!');
}

// Run the test
testAPI().catch(console.error); 
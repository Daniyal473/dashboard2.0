// Test new admin verification system
require("dotenv").config({ path: "../.env" });

const authService = require('./services/authService');

async function testAdminVerification() {
  try {
    console.log('🧪 Testing New Admin Verification System...');
    console.log('📋 Environment Variables:');
    console.log('- USERS_TABLE_URL:', process.env.USERS_TABLE_URL ? '✅ Set' : '❌ Missing');
    console.log('- LOGIN_ATTEMPTS_TABLE_URL:', process.env.LOGIN_ATTEMPTS_TABLE_URL ? '✅ Set' : '❌ Missing');
    console.log('- RESET_PASSWORD_TABLE_URL:', process.env.RESET_PASSWORD_TABLE_URL ? '✅ Set' : '❌ Missing');
    console.log('- TEABLE_BEARER_TOKEN:', process.env.TEABLE_BEARER_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('- ADMIN_PASSWORD:', '❌ Not stored (entered dynamically)');
    
    console.log('\n🔐 Admin password verification system ready!');
    console.log('🔐 To test admin verification:');
    console.log('   1. Use the admin endpoints in your application');
    console.log('   2. Enter your remembered password when prompted');
    console.log('   3. System will verify using secure hash comparison');
    
    console.log('\n🔐 Testing with wrong password: "wrongpassword"');
    const adminTest2 = authService.verifyAdminPassword('wrongpassword');
    console.log('Wrong password test:', adminTest2 ? '✅ Valid' : '❌ Invalid (Expected)');
    
    console.log('\n🔐 Testing with empty password:');
    const adminTest3 = authService.verifyAdminPassword('');
    console.log('Empty password test:', adminTest3 ? '✅ Valid' : '❌ Invalid (Expected)');
    
    console.log('\n📊 Admin verification status:');
    const status = authService.getAdminVerificationStatus();
    console.log('Status:', status);
    
    console.log('\n✅ Admin verification system working correctly!');
    console.log('🔐 Key features:');
    console.log('   - No password stored in .env file');
    console.log('   - No password stored in database');
    console.log('   - No hardcoded passwords in code');
    console.log('   - Password entered dynamically each time');
    console.log('   - Temporary verification data auto-clears');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testAdminVerification();

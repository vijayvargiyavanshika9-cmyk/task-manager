import { connectDB, disconnectDB } from './config/db.js';
import User from './models/User.js';
import * as authService from './services/auth.service.js';
import jwt from 'jsonwebtoken';
import env from './config/env.js';

async function runAuthTests() {
  console.log('🧪 Starting End-to-End Authentication Tests...\n');

  try {
    await connectDB();

    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testName = 'Test Engineer';

    // Test 1: Register User
    console.log('Test 1: Registering new user...');
    const registerResult = await authService.registerUser({
      name: testName,
      email: testEmail,
      password: testPassword,
    });

    if (!registerResult.token) throw new Error('Token was not generated on registration');
    if (!registerResult.user.id) throw new Error('User ID was not returned');
    if (registerResult.user.password) throw new Error('Password was leaked in sanitized user object!');
    console.log('✅ Test 1 Passed: User registered and sanitized successfully.');

    // Test 2: Duplicate Email Prevention
    console.log('Test 2: Verifying duplicate email rejection...');
    try {
      await authService.registerUser({
        name: testName,
        email: testEmail,
        password: testPassword,
      });
      throw new Error('Duplicate email registration should have failed!');
    } catch (err) {
      if (err.statusCode === 409) {
        console.log('✅ Test 2 Passed: Duplicate email properly rejected with HTTP 409.');
      } else {
        throw err;
      }
    }

    // Test 3: Successful Login
    console.log('Test 3: Testing login with valid credentials...');
    const loginResult = await authService.loginUser({
      email: testEmail,
      password: testPassword,
    });
    if (!loginResult.token) throw new Error('Login failed to return token');
    if (loginResult.user.password) throw new Error('Password leaked on login response!');
    console.log('✅ Test 3 Passed: Login successful with JWT token issued.');

    // Test 4: Invalid Password Rejection
    console.log('Test 4: Testing login with invalid password...');
    try {
      await authService.loginUser({
        email: testEmail,
        password: 'wrong_password_123',
      });
      throw new Error('Invalid password should have been rejected!');
    } catch (err) {
      if (err.statusCode === 401) {
        console.log('✅ Test 4 Passed: Invalid password rejected with HTTP 401.');
      } else {
        throw err;
      }
    }

    // Test 5: Verify Token and User Fetch
    console.log('Test 5: Verifying JWT decoding and user retrieval...');
    const decoded = jwt.verify(loginResult.token, env.JWT_SECRET);
    const profile = await authService.getUserById(decoded.id);
    if (profile.email !== testEmail) throw new Error('Fetched user profile email does not match');
    console.log('✅ Test 5 Passed: JWT verified and user profile loaded.');

    // Cleanup
    console.log('Cleaning up test data...');
    await User.deleteOne({ email: testEmail });
    console.log('✅ Test user cleaned up.');

    console.log('\n🎉 ALL 5 AUTHENTICATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

runAuthTests();

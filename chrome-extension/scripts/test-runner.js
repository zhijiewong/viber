#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 DOM Agent Chrome Extension - Test Runner\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the chrome-extension directory.');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';

console.log(`📋 Running tests: ${command}\n`);

try {
  switch (command) {
    case 'unit':
      runUnitTests();
      break;
    case 'integration':
      runIntegrationTests();
      break;
    case 'e2e':
      runE2ETests();
      break;
    case 'coverage':
      runCoverageTests();
      break;
    case 'watch':
      runWatchTests();
      break;
    case 'lint':
      runLintTests();
      break;
    case 'type-check':
      runTypeCheck();
      break;
    case 'all':
      runAllTests();
      break;
    default:
      console.log('❓ Usage: npm run test:custom [unit|integration|e2e|coverage|watch|lint|type-check|all]');
      process.exit(1);
  }
} catch (error) {
  console.error('❌ Test run failed:', error.message);
  process.exit(1);
}

function runUnitTests() {
  console.log('🧪 Running unit tests...');
  execSync('npm test -- --testPathPattern=unit', { stdio: 'inherit' });
  console.log('✅ Unit tests completed\n');
}

function runIntegrationTests() {
  console.log('🔗 Running integration tests...');
  execSync('npm test -- --testPathPattern=integration', { stdio: 'inherit' });
  console.log('✅ Integration tests completed\n');
}

function runE2ETests() {
  console.log('🌐 Running end-to-end tests...');
  // Check if Puppeteer is available
  try {
    require('puppeteer');
    execSync('npm test -- --testPathPattern=e2e', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Puppeteer not found. Installing for E2E tests...');
    execSync('npm install --save-dev puppeteer', { stdio: 'inherit' });
    execSync('npm test -- --testPathPattern=e2e', { stdio: 'inherit' });
  }
  console.log('✅ E2E tests completed\n');
}

function runCoverageTests() {
  console.log('📊 Running tests with coverage...');
  execSync('npm run test:coverage', { stdio: 'inherit' });
  console.log('✅ Coverage tests completed\n');
}

function runWatchTests() {
  console.log('👀 Running tests in watch mode...');
  console.log('💡 Press "q" to quit, "Enter" to run all tests');
  execSync('npm run test:watch', { stdio: 'inherit' });
}

function runLintTests() {
  console.log('🔍 Running linting...');
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting completed\n');
}

function runTypeCheck() {
  console.log('🔧 Running TypeScript type checking...');
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type checking completed\n');
}

function runAllTests() {
  console.log('🚀 Running all tests...\n');

  try {
    runLintTests();
    runTypeCheck();
    runUnitTests();
    runIntegrationTests();

    // Only run E2E if explicitly requested due to setup requirements
    if (args.includes('--e2e')) {
      runE2ETests();
    }

    console.log('🎉 All tests passed!\n');

    // Show summary
    console.log('📊 Test Summary:');
    console.log('  ✅ Linting: Passed');
    console.log('  ✅ TypeScript: Passed');
    console.log('  ✅ Unit Tests: Passed');
    console.log('  ✅ Integration Tests: Passed');
    if (args.includes('--e2e')) {
      console.log('  ✅ E2E Tests: Passed');
    }
    console.log('\n🎯 Ready for deployment!');

  } catch (error) {
    console.error('❌ Some tests failed. Please fix the issues before deploying.');
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  runUnitTests,
  runIntegrationTests,
  runE2ETests,
  runCoverageTests,
  runWatchTests,
  runLintTests,
  runTypeCheck,
  runAllTests
};

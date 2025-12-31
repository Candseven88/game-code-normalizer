/**
 * game-code-normalizer - Basic Usage Examples
 * 
 * Run this file with: node examples/basic.js
 */

const { normalizeCode, normalizeCodes } = require('../index.js');

console.log('='.repeat(60));
console.log('game-code-normalizer - Example Output');
console.log('='.repeat(60));
console.log();

// Test data from specification
const testCases = [
  ' 30IKES ',
  'Merristmas',
  '25-IKES',
  'bad code!!',
  { code: 'STAT-RESET', meta: { source: 'discord', discoveredAt: '2025-12-28' } }
];

// Process each test case individually
console.log('--- Individual normalizeCode() calls ---\n');

testCases.forEach((input, index) => {
  const displayInput = typeof input === 'object' 
    ? JSON.stringify(input) 
    : `"${input}"`;
  
  console.log(`[${index + 1}] Input: ${displayInput}`);
  
  const result = normalizeCode(input);
  console.log('    Output:');
  console.log(JSON.stringify(result, null, 4).split('\n').map(l => '    ' + l).join('\n'));
  console.log();
});

// Batch processing example
console.log('--- Batch normalizeCodes() call ---\n');

const batchResults = normalizeCodes(testCases);
console.log('Input array:', JSON.stringify(testCases.map(t => 
  typeof t === 'object' ? t : t
), null, 2));
console.log();
console.log('Output array:');
console.log(JSON.stringify(batchResults, null, 2));
console.log();

// Custom configuration example
console.log('--- Custom Configuration Example ---\n');

const customConfig = {
  minLength: 2,
  maxLength: 20,
  prefixes: {
    'XMAS': 'event_reward'
  },
  keywords: {
    'BONUS': 'currency'
  }
};

console.log('Config:', JSON.stringify(customConfig, null, 2));
console.log();

const customResult = normalizeCode('XMAS2025BONUS', customConfig);
console.log('Input: "XMAS2025BONUS"');
console.log('Output:');
console.log(JSON.stringify(customResult, null, 2));
console.log();

// Edge cases demonstration
console.log('--- Edge Cases ---\n');

const edgeCases = [
  '',                    // Empty string
  '   ',                 // Only whitespace
  '---',                 // Only dashes
  'AB',                  // Too short (default min is 4)
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // Too long (default max is 16)
  'VALID1234'            // Valid simple code
];

edgeCases.forEach(input => {
  const result = normalizeCode(input);
  console.log(`Input: "${input}"`);
  console.log(`  normalized: "${result.normalized}", isValidFormat: ${result.isValidFormat}, hints: [${result.hints.join(', ')}]`);
});

console.log();
console.log('='.repeat(60));
console.log('Done! Visit https://ariseragnarok.org/resources/code-normalizer');
console.log('='.repeat(60));

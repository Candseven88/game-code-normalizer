/**
 * game-code-normalizer
 * 
 * Normalizes and validates game redemption/announcement codes.
 * Provides pattern detection for common code types like class rerolls,
 * stat resets, currency rewards, and event codes.
 */

'use strict';

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Default length constraints for code validation.
 * Most game codes fall within 4-16 characters after normalization.
 */
const DEFAULT_MIN_LENGTH = 4;
const DEFAULT_MAX_LENGTH = 16;

/**
 * Prefix patterns mapped to probable code types.
 * Prefixes have higher priority than keywords when determining type.
 * Key: substring to match (will be checked against normalized uppercase code)
 * Value: the probableType to assign
 */
const DEFAULT_PREFIXES = {
  'IKES': 'class_reroll'
};

/**
 * Keyword patterns mapped to probable code types.
 * Keywords are checked after prefixes, in the order defined here.
 * Multiple keyword matches will be recorded in hints, but only the
 * first match determines probableType (if no prefix matched).
 */
const DEFAULT_KEYWORDS = {
  'MERR': 'event_reward',    // Covers Merry, Merristmas, MerryChristmas, etc.
  'STAT': 'stat_reset',
  'COIN': 'currency',
  'GEM': 'currency',
  'CASH': 'currency'
};

// ============================================================================
// Core Normalization Logic
// ============================================================================

/**
 * Normalizes a single game code input.
 * 
 * @param {string | { code: string, meta?: Record<string, any> }} input - The code to normalize
 * @param {Object} [config] - Optional configuration overrides
 * @param {number} [config.minLength] - Minimum valid length (default: 4)
 * @param {number} [config.maxLength] - Maximum valid length (default: 16)
 * @param {Record<string, string>} [config.prefixes] - Custom prefix patterns (merged with defaults)
 * @param {Record<string, string>} [config.keywords] - Custom keyword patterns (merged with defaults)
 * @returns {Object} Normalized code result object
 */
function normalizeCode(input, config = {}) {
  // Extract the raw code string from input
  // If input is an object, use its `code` property; otherwise treat as string
  const isObjectInput = input !== null && typeof input === 'object';
  const rawCode = isObjectInput ? String(input.code || '') : String(input || '');
  const meta = isObjectInput ? input.meta : undefined;

  // Merge configuration with defaults
  // User-provided prefixes/keywords override defaults with same key
  const minLength = config.minLength ?? DEFAULT_MIN_LENGTH;
  const maxLength = config.maxLength ?? DEFAULT_MAX_LENGTH;
  const prefixes = { ...DEFAULT_PREFIXES, ...config.prefixes };
  const keywords = { ...DEFAULT_KEYWORDS, ...config.keywords };

  // Step 1: Normalize the code
  // - Trim whitespace from both ends
  // - Remove all spaces and dashes (common separators in codes)
  // - Convert to uppercase for consistent matching
  const normalized = rawCode
    .trim()
    .replace(/[\s-]/g, '')  // Remove spaces and dashes
    .toUpperCase();

  // Step 2: Validate character set
  // Game codes typically only contain alphanumeric characters (A-Z, 0-9)
  // We check AFTER normalization since we've already removed valid separators
  const hints = [];
  const hasInvalidChars = /[^A-Z0-9]/.test(normalized);
  
  if (hasInvalidChars) {
    hints.push('INVALID:CHAR');
  }

  // Step 3: Validate length
  // Empty strings or codes outside the length range are invalid
  const length = normalized.length;
  const isLengthValid = length >= minLength && length <= maxLength;
  
  // Edge case: empty string after normalization (e.g., input was "---" or "   ")
  // This is definitely invalid, but we don't add a separate hint since
  // length validation will catch it
  const isValidFormat = !hasInvalidChars && isLengthValid && length > 0;

  // Step 4: Determine probable type by matching patterns
  // Priority: prefixes first, then keywords
  // All matches go into hints, but only the highest-priority match sets probableType
  let probableType = 'unknown';
  let typeAlreadySet = false;

  // Check prefixes (higher priority)
  for (const [pattern, type] of Object.entries(prefixes)) {
    if (normalized.includes(pattern)) {
      hints.push(`PREFIX:${pattern}`);
      if (!typeAlreadySet) {
        probableType = type;
        typeAlreadySet = true;
        // Continue checking to collect all matching hints
      }
    }
  }

  // Check keywords (lower priority than prefixes)
  for (const [pattern, type] of Object.entries(keywords)) {
    if (normalized.includes(pattern)) {
      hints.push(`KEYWORD:${pattern}`);
      if (!typeAlreadySet) {
        probableType = type;
        typeAlreadySet = true;
        // Continue checking to collect all matching hints
      }
    }
  }

  // Special handling for MERR pattern (covers Merry, Merristmas, MerryChristmas)
  // Replace KEYWORD:MERR with EVENT:MERRY for better semantics and spec compliance
  const merrKeywordIndex = hints.indexOf('KEYWORD:MERR');
  if (merrKeywordIndex !== -1) {
    hints[merrKeywordIndex] = 'EVENT:MERRY';
  }

  // Build the result object
  const result = {
    normalized,
    raw: rawCode,
    isValidFormat,
    probableType,
    hints,
    // Status is always 'unknown' - actual validity must be checked against
    // the game's server/database. This field is a placeholder for downstream
    // systems to populate after verification.
    status: 'unknown',
    length,
    createdAt: new Date().toISOString()
  };

  // Only include meta if it was provided in the input
  // This keeps the output clean for simple string inputs
  if (meta !== undefined) {
    result.meta = meta;
  }

  return result;
}

/**
 * Normalizes multiple game codes at once.
 * 
 * @param {Array<string | { code: string, meta?: Record<string, any> }>} inputs - Array of codes to normalize
 * @param {Object} [config] - Optional configuration (applied to all codes)
 * @returns {Array<Object>} Array of normalized code result objects
 */
function normalizeCodes(inputs, config = {}) {
  // Handle edge cases: null, undefined, or non-array inputs
  if (!Array.isArray(inputs)) {
    return [];
  }

  // Process each input through normalizeCode
  // This ensures consistent behavior between single and batch processing
  return inputs.map(input => normalizeCode(input, config));
}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
  normalizeCode,
  normalizeCodes
};

/**
 * Type definitions for game-code-normalizer
 */

/**
 * Probable type of the game code based on pattern matching.
 */
export type ProbableType = 
  | 'class_reroll'
  | 'stat_reset'
  | 'currency'
  | 'event_reward'
  | 'unknown';

/**
 * Status of the code. Always 'unknown' by default since actual
 * validity must be verified against the game's server.
 */
export type CodeStatus = 'active' | 'expired' | 'unknown';

/**
 * Input format when providing a code as an object.
 */
export interface CodeInput {
  /** The raw code string to normalize */
  code: string;
  /** Optional metadata to pass through to the result */
  meta?: Record<string, any>;
}

/**
 * Configuration options for normalization.
 */
export interface NormalizeConfig {
  /** Minimum valid length after normalization (default: 4) */
  minLength?: number;
  /** Maximum valid length after normalization (default: 16) */
  maxLength?: number;
  /** 
   * Custom prefix patterns mapped to probable types.
   * Merged with defaults; same keys override default values.
   * Prefixes have higher priority than keywords.
   */
  prefixes?: Record<string, ProbableType>;
  /**
   * Custom keyword patterns mapped to probable types.
   * Merged with defaults; same keys override default values.
   */
  keywords?: Record<string, ProbableType>;
}

/**
 * Result object from normalizing a game code.
 */
export interface NormalizeResult {
  /** Normalized code: uppercase, no spaces or dashes */
  normalized: string;
  /** Original input string (from object.code if object input, otherwise the raw string) */
  raw: string;
  /** Whether the code passes basic format validation (charset + length) */
  isValidFormat: boolean;
  /** Detected code type based on pattern matching */
  probableType: ProbableType;
  /** Array of matched patterns and validation hints */
  hints: string[];
  /** Code status - always 'unknown' (actual status determined by game server) */
  status: CodeStatus;
  /** Length of the normalized code */
  length: number;
  /** ISO timestamp when normalization was performed */
  createdAt: string;
  /** Pass-through metadata from input object (only present if provided) */
  meta?: Record<string, any>;
}

/**
 * Normalizes a single game code.
 * 
 * @param input - String or object containing the code to normalize
 * @param config - Optional configuration overrides
 * @returns Normalized code result object
 * 
 * @example
 * // String input
 * normalizeCode(' 30IKES ');
 * 
 * @example
 * // Object input with metadata
 * normalizeCode({ code: 'STAT-RESET', meta: { source: 'discord' } });
 * 
 * @example
 * // With custom configuration
 * normalizeCode('MYCODE', { minLength: 2, maxLength: 20 });
 */
export function normalizeCode(
  input: string | CodeInput,
  config?: NormalizeConfig
): NormalizeResult;

/**
 * Normalizes multiple game codes at once.
 * 
 * @param inputs - Array of strings or objects containing codes to normalize
 * @param config - Optional configuration (applied to all codes)
 * @returns Array of normalized code result objects
 * 
 * @example
 * normalizeCodes([' 30IKES ', 'Merristmas', { code: 'STAT-RESET' }]);
 */
export function normalizeCodes(
  inputs: Array<string | CodeInput>,
  config?: NormalizeConfig
): NormalizeResult[];

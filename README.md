# game-code-normalizer

Normalize and validate game redemption codes with automatic pattern detection for class rerolls, stat resets, currency rewards, and event codes.

## Installation

```bash
npm install game-code-normalizer
```

## Usage

### Basic Usage

```javascript
const { normalizeCode, normalizeCodes } = require('game-code-normalizer');

// String input
const result = normalizeCode(' 30IKES ');
console.log(result);
// {
//   normalized: '30IKES',
//   raw: ' 30IKES ',
//   isValidFormat: true,
//   probableType: 'class_reroll',
//   hints: ['PREFIX:IKES'],
//   status: 'unknown',
//   length: 6,
//   createdAt: '2025-12-31T...'
// }

// Object input with metadata
const result2 = normalizeCode({
  code: 'STAT-RESET',
  meta: { source: 'discord', discoveredAt: '2025-12-28' }
});
console.log(result2);
// {
//   normalized: 'STATRESET',
//   raw: 'STAT-RESET',
//   isValidFormat: true,
//   probableType: 'stat_reset',
//   hints: ['KEYWORD:STAT'],
//   status: 'unknown',
//   length: 9,
//   createdAt: '2025-12-31T...',
//   meta: { source: 'discord', discoveredAt: '2025-12-28' }
// }
```

### Batch Processing

```javascript
const { normalizeCodes } = require('game-code-normalizer');

const results = normalizeCodes([
  ' 30IKES ',
  'Merristmas',
  '25-IKES',
  'bad code!!',
  { code: 'STAT-RESET', meta: { source: 'discord' } }
]);

console.log(results);
```

### Custom Configuration

```javascript
const { normalizeCode } = require('game-code-normalizer');

// Custom length constraints
const result = normalizeCode('AB', { minLength: 2, maxLength: 20 });

// Custom patterns (merged with defaults)
const result2 = normalizeCode('XMAS2025', {
  prefixes: {
    'XMAS': 'event_reward'  // Add new prefix pattern
  },
  keywords: {
    'BONUS': 'currency'     // Add new keyword pattern
  }
});
```

## Output Format

Each normalized code returns an object with:

| Field | Type | Description |
|-------|------|-------------|
| `normalized` | `string` | Uppercase, no spaces/dashes |
| `raw` | `string` | Original input string |
| `isValidFormat` | `boolean` | Passes charset (A-Z, 0-9) and length validation |
| `probableType` | `string` | `'class_reroll'` \| `'stat_reset'` \| `'currency'` \| `'event_reward'` \| `'unknown'` |
| `hints` | `string[]` | Matched patterns: `'PREFIX:...'`, `'KEYWORD:...'`, `'EVENT:...'`, `'INVALID:CHAR'` |
| `status` | `string` | Always `'unknown'` (actual status determined by game server) |
| `length` | `number` | Length of normalized code |
| `createdAt` | `string` | ISO timestamp |
| `meta` | `object?` | Pass-through metadata (only if provided in input) |

## Example Output

```json
{
  "normalized": "30IKES",
  "raw": " 30IKES ",
  "isValidFormat": true,
  "probableType": "class_reroll",
  "hints": ["PREFIX:IKES"],
  "status": "unknown",
  "length": 6,
  "createdAt": "2025-12-31T12:00:00.000Z"
}
```

## Built-in Pattern Detection

### Prefixes (Higher Priority)
- `IKES` → `class_reroll`

### Keywords
- `MERR` → `event_reward` (matches Merry, Merristmas, MerryChristmas, etc.)
- `STAT` → `stat_reset`
- `COIN`, `GEM`, `CASH` → `currency`

## Security Notes

- The `status` field is always `'unknown'` by default. Actual code validity must be verified against the game's server/database.
- This library performs client-side normalization only and does not make any network requests.
- No sensitive information is stored or transmitted.

## Links / Docs

- Documentation & Demo: https://ariseragnarok.org/codes/

## License

MIT

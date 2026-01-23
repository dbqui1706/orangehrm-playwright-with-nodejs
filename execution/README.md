# Execution Scripts

This directory contains **deterministic TypeScript scripts** that perform the actual work. These are Layer 3 of the 3-layer architecture.

## Purpose

Execution scripts handle:
- API calls
- Data processing
- File operations
- Database interactions
- Any other deterministic operations

## Why TypeScript?

- **Type safety**: Catch errors at compile time
- **Reliability**: Deterministic behavior, no LLM randomness
- **Testable**: Easy to write unit tests
- **Fast**: Compiled code runs quickly
- **Well-documented**: Types serve as inline documentation

## Coding Standards

### 1. Type Everything

```typescript
interface ScriptInput {
  url: string;
  depth: number;
  options?: ScraperOptions;
}

interface ScriptOutput {
  data: any[];
  savedTo: string;
  timestamp: string;
}
```

### 2. Error Handling

Always use try-catch blocks and provide meaningful error messages:

```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error.message);
  throw new Error(`Failed to complete operation: ${error.message}`);
}
```

### 3. Logging

Log important steps for debugging:

```typescript
console.log('Starting process...');
console.log(`Processing ${items.length} items`);
console.log('Process complete');
```

### 4. Environment Variables

Use `dotenv` for configuration:

```typescript
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY not found in environment variables');
}
```

### 5. File Structure

```typescript
// Imports
import { something } from 'somewhere';

// Interfaces/Types
interface MyInput { ... }
interface MyOutput { ... }

// Main function
async function main(input: MyInput): Promise<MyOutput> {
  // Implementation
}

// CLI handling (if script is run directly)
if (require.main === module) {
  const input = JSON.parse(process.argv[2]);
  main(input)
    .then(output => console.log(JSON.stringify(output)))
    .catch(error => {
      console.error(error.message);
      process.exit(1);
    });
}

export { main };
```

## Running Scripts

Scripts can be run in two ways:

1. **Directly via CLI**:
   ```bash
   npx ts-node execution/script_name.ts '{"param": "value"}'
   ```

2. **Imported and called**:
   ```typescript
   import { main } from './execution/script_name';
   const result = await main({ param: 'value' });
   ```

## Best Practices

1. **Single Responsibility**: Each script should do one thing well
2. **Idempotent**: Running the same script twice with the same input should produce the same result
3. **Validated Inputs**: Always validate inputs at the start
4. **Meaningful Names**: Use descriptive function and variable names
5. **Comments**: Explain WHY, not WHAT (the code shows what)
6. **Error Recovery**: Handle errors gracefully and provide actionable error messages

## Example Scripts

- `scrape_single_site.ts` - Scrapes a single website
- `process_data.ts` - Transforms raw data into structured format
- `upload_to_sheets.ts` - Uploads data to Google Sheets

# [Directive Name]

## Goal

Describe what this directive accomplishes in 1-2 sentences.

## Inputs

List all required inputs:
- **Input 1**: Description and format
- **Input 2**: Description and format
- **Input 3**: Description and format

## Tools/Scripts

List the execution scripts to use:
- `execution/script_name.ts`: Brief description of what it does
- `execution/another_script.ts`: Brief description

## Process

Step-by-step workflow:
1. Validate inputs
2. Call `execution/script_name.ts` with parameters
3. Handle the output
4. If error occurs, check edge cases below
5. Return final result

## Outputs

Describe what gets produced:
- **Output 1**: Description and location
- **Output 2**: Description and location

## Edge Cases

Common errors and how to handle them:
- **Error 1**: Description and solution
- **Error 2**: Description and solution
- **Rate limits**: How to handle API rate limits
- **Missing data**: What to do when expected data is missing

## Notes

Additional context:
- API constraints or limits
- Timing expectations
- Dependencies on other directives
- Any other important information

## Example

```
Input: { "url": "https://example.com", "depth": 2 }
Output: { "data": [...], "saved_to": ".tmp/scraped_data.json" }
```

## Version History

- v1.0 (YYYY-MM-DD): Initial version
- v1.1 (YYYY-MM-DD): Added handling for rate limits

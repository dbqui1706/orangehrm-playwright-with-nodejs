/**
 * Example Execution Script
 * 
 * This demonstrates best practices for writing execution scripts:
 * - Type safety with interfaces
 * - Error handling
 * - Logging
 * - Environment variables
 * - CLI and programmatic usage
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Define input and output types
interface ExampleInput {
    message: string;
    count?: number;
    outputPath?: string;
}

interface ExampleOutput {
    success: boolean;
    processedCount: number;
    savedTo: string;
    timestamp: string;
}

/**
 * Main execution function
 * @param input - The input parameters
 * @returns The output result
 */
async function main(input: ExampleInput): Promise<ExampleOutput> {
    try {
        // Validate inputs
        if (!input.message) {
            throw new Error('Message is required');
        }

        const count = input.count || 1;
        const outputPath = input.outputPath || path.join('.tmp', 'example_output.json');

        console.log('Starting example process...');
        console.log(`Message: ${input.message}`);
        console.log(`Count: ${count}`);

        // Process the data
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push({
                index: i + 1,
                message: input.message,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`Processed ${results.length} items`);

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        await fs.mkdir(outputDir, { recursive: true });

        // Save results
        await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf-8');
        console.log(`Saved results to: ${outputPath}`);

        // Return output
        const output: ExampleOutput = {
            success: true,
            processedCount: results.length,
            savedTo: outputPath,
            timestamp: new Date().toISOString()
        };

        console.log('Process complete');
        return output;

    } catch (error) {
        console.error('Error in main execution:', error instanceof Error ? error.message : error);
        throw new Error(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// CLI handling - allows script to be run directly
if (require.main === module) {
    // Parse command line arguments
    const inputArg = process.argv[2];

    if (!inputArg) {
        console.error('Usage: npx ts-node execution/example.ts \'{"message": "Hello", "count": 3}\'');
        process.exit(1);
    }

    try {
        const input: ExampleInput = JSON.parse(inputArg);

        main(input)
            .then(output => {
                console.log('\nOutput:');
                console.log(JSON.stringify(output, null, 2));
                process.exit(0);
            })
            .catch(error => {
                console.error('\nExecution failed:', error.message);
                process.exit(1);
            });
    } catch (error) {
        console.error('Invalid JSON input:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Export for programmatic usage
export { main, ExampleInput, ExampleOutput };

import { test } from '@playwright/test';
import * as path from 'path';

const slides = [
    'title_slide',
    'slide_02_toc',
    'slide_03_project_info',
    'slide_04_scope',
    'slide_05_approach',
    'slide_06_framework',
    'slide_07_results_summary',
    'slide_08_module_results'
];

for (const slide of slides) {
    test(`generate image for ${slide}`, async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Absolute path is safest
        const htmlPath = path.resolve(__dirname, `../slides_html/${slide}.html`);
        console.log(`Navigating to: file://${htmlPath}`);

        await page.goto(`file://${htmlPath}`);

        // Wait for any animations or fonts (just in case)
        await page.waitForTimeout(500);

        const outputPath = path.resolve(__dirname, `../slides_html/${slide}.png`);
        await page.screenshot({ path: outputPath, fullPage: true });

        console.log(`Saved screenshot to: ${outputPath}`);
    });
}

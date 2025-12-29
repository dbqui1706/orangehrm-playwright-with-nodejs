import { test, expect } from '@playwright/test';
import { VALID_USERNAME, VALID_PASSWORD, BASE_URL } from '../../config/config';
import * as testData from '../../test-data/projects_data.json';
import { get_current_timestamp } from '../../utils/utils';

// Extract test cases from JSON
const PROJECT_DATA = testData.test_cases;

/**
 * Test suite for Projects and Activities functionality in Time module.
 */
test.describe('Project Management Tests', () => {
    let needsCleanup: boolean;

    /**
     * Before each test: Login and navigate to Projects page     */
    test.beforeEach(async ({ page }) => {
        // Navigate to login page
        test.setTimeout(120000);
        needsCleanup = false;
        await page.goto(BASE_URL);

        // Login
        await page.getByPlaceholder('Username').fill(VALID_USERNAME);
        await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
        await page.getByRole('button', { name: 'Login' }).click();

        // Navigate to Time module
        await page.getByRole('link', { name: 'Time' }).click();
        await page.waitForLoadState('networkidle');

        // Navigate to Projects page
        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Projects' }).click();
        await page.waitForLoadState('networkidle');
    });

    test.afterEach(async ({ page }) => {
        if (!needsCleanup) return;

        // Cleanup: Delete the created project
        await page.locator('.oxd-icon.bi-check').first().click();
        await page.getByRole('button', { name: ' Delete Selected' }).click();
        await page.getByRole('button', { name: ' Yes, Delete' }).click();
    });

    // ==================== POSITIVE TEST CASES ====================

    test('PRJ_TC01: Add project with required fields', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC01
         * Description: Verify that a project can be added with only required fields (name and customer)
         * Expected: Project is successfully created and saved
         */
        needsCleanup = true;

        // Arrange
        const data = PROJECT_DATA.PRJ_TC01;
        const projectName = data.test_data.project_name + '_' + get_current_timestamp();
        const customerName = data.test_data.customer_name;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();

        // Fill project name
        await page.getByRole('textbox').nth(1).fill(projectName);

        // Select customer from dropdown
        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();

        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_result'])).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Projects' }).click();

        await expect(page.getByRole('table').getByRole('row').filter({ hasText: projectName })
        ).toBeVisible();
    });

    test('PRJ_TC02: Add project with all fields', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC02
         * Description: Verify that a project can be added with all fields including description and admin
         * Expected: Project is successfully created and saved
         */
        needsCleanup = true;

        // Arrange
        const data = PROJECT_DATA.PRJ_TC02;
        const projectName = data.test_data.project_name + '_' + get_current_timestamp();
        const customerName = data.test_data.customer_name;
        const description = data.test_data.description;
        const adminName = data.test_data.project_admin;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();

        // Fill project name
        await page.getByRole('textbox').nth(1).fill(projectName);

        // Select customer from dropdown
        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();

        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);

        // Select project admin
        await page.getByRole('textbox', { name: 'Type for hints...' }).nth(1).fill(adminName);
        await page.getByRole('option', { name: adminName }).click();

        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_result'])).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Verify project appears in list
        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Projects' }).click();
        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('table')).toContainText(projectName);
    });

    test('PRJ_TC03: Add project with multiple admins', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC03
         * Description: Verify that a project can be added with multiple project admins
         * Expected: Project is successfully created and saved with multiple admins
         */
        needsCleanup = true;

        // Arrange
        const data = PROJECT_DATA.PRJ_TC03;
        const projectName = data.test_data.project_name + '_' + get_current_timestamp();
        const customerName = data.test_data.customer_name;
        const adminNames = data.test_data.project_admin; // Array of admin names

        // Act
        await page.getByRole('button', { name: ' Add' }).click();

        // Fill project name
        await page.getByRole('textbox').nth(1).fill(projectName);
        // Select customer from dropdown
        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();

        // Select multiple project admins
        for (let index = 0; index < adminNames.length; index++) {
            if (index > 0) {
                // Click to add another admin field
                await page.getByRole('button', { name: ' Add Another' }).click();
            }
            const adminName = adminNames[index];
            await page.getByRole('textbox', { name: 'Type for hints...' }).nth(index + 1).fill(adminName);
            await page.getByRole('option', { name: new RegExp(adminName) }).click();
        }

        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_result'])).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Projects' }).click();
        await page.waitForLoadState('networkidle');

        // check project appears in list
        await expect(page.getByRole('table')).toContainText(projectName);

        // check all admins appear in column name "Project Admins"
        const row = page.getByRole('row').filter({ hasText: projectName });
        for (const adminName of adminNames) {
            await expect(row).toContainText(adminName);
        }
    });

    // ==================== NEGATIVE TEST CASES ====================

    test('PRJ_TC04: Empty project name validation', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC04
         * Description: Verify that project cannot be created without a name
         * Expected: Required error message is displayed
         */
        needsCleanup = false;

        // Arrange
        const data = PROJECT_DATA.PRJ_TC04.test_data;
        const customerName = data.customer_name;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();

        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();

        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText('Required', { exact: true })).toBeVisible();

        // capture screenshot
        await page.screenshot({ path: `screenshots/projects/PRJ_TC04.png` });
    });

    test('PRJ_TC05: Missing customer validation', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC05
         * Description: Verify that project cannot be created without selecting a customer
         * Expected: Required error message is displayed
         */
        needsCleanup = false;

        // Arrange
        const data = PROJECT_DATA.PRJ_TC05;
        const projectName = data.test_data.project_name + '_' + get_current_timestamp();

        // Act
        await page.getByRole('button', { name: ' Add' }).click();

        await page.getByRole('textbox').nth(1).fill(projectName);

        // Don't select customer
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_error'], { exact: true })).toBeVisible();
        await page.screenshot({ path: `screenshots/projects/PRJ_TC05.png` });
    });

    test('PRJ_TC06: Project name at boundary (exactly 50 chars)', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC06
         * Description: Test boundary condition with exactly 50 characters for project name
         * Expected: Project should be created successfully
         */
        needsCleanup = true;

        // Arrange
        const data = PROJECT_DATA.PRJ_TC06;
        const projectName = data.test_data.project_name; // Exactly 50 characters
        const customerName = data.test_data.customer_name;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();

        await page.getByRole('textbox').nth(1).fill(projectName);

        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();

        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_result'])).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Projects' }).click();
        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('table')).toContainText(projectName.substring(0, 20));
    });

    test('PRJ_TC07: Project name exceeding max length', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC07
         * Description: Verify validation for project name exceeding 50 characters
         * Expected: Validation error message is displayed
         */
        needsCleanup = false;

        // Arrange
        const data = PROJECT_DATA.PRJ_TC07;
        const projectName = data.test_data.project_name; // 51 characters
        const customerName = data.test_data.customer_name;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();

        await page.getByRole('textbox').nth(1).fill(projectName);

        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();

        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_error'])).toBeVisible();
        await page.screenshot({ path: `screenshots/projects/PRJ_TC07.png` });
    });

    test('PRJ_TC08: Duplicate project name', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC08
         * Description: Verify that duplicate project name is not allowed
         * Expected: Error message indicating project name already exists
         */
        // Arrange
        const data = PROJECT_DATA.PRJ_TC08;
        const projectName = data.test_data.project_name + '_' + get_current_timestamp();
        const customerName = data.test_data.customer_name;

        // Create first project
        await page.getByRole('button', { name: ' Add' }).click();
        await page.getByRole('textbox').nth(1).fill(projectName);
        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText(data['expected_frist_result'])).toBeVisible();

        // nagivate back to Projects page
        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Projects' }).click();
        await page.waitForLoadState('networkidle');

        // Try to create duplicate project
        await page.getByRole('button', { name: ' Add' }).click();
        await page.getByRole('textbox').nth(1).fill(projectName);
        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText('Already exists')).toBeVisible();
        await page.screenshot({ path: `screenshots/projects/PRJ_TC08.png` });

        await page.getByRole('button', { name: ' Cancel' }).click();

        needsCleanup = true;
    });

    // ==================== DISCOVERY TEST CASES ====================

    test('PRJ_TC09: Special characters in project name', async ({ page }) => {
        /**
         * Test Case ID: PRJ_TC09
         * Description: Discover how system handles special characters in project name
         * Expected: Observe system behavior for special characters
         */
        // Arrange
        const data = PROJECT_DATA.PRJ_TC09;
        const projectName = data.test_data.project_name;
        const customerName = data.test_data.customer_name;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.getByRole('textbox').nth(1).fill(projectName);
        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill(customerName);
        await page.getByRole('option', { name: customerName }).click();
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert - Discovery test
        const successMessage = page.getByText('Successfully Saved');
        const errorSystemMessage = page.getByText('Invalid Parameter');

        await Promise.race([
            successMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { }),
            errorSystemMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { })
        ]);
        
        const hasSuccess = await successMessage.isVisible().catch(() => false);
        const hasError = await errorSystemMessage.isVisible().catch(() => false);

        console.log(`PRJ_TC09 Result: Success=${hasSuccess}, Error=${hasError}`);

        if (hasSuccess) {
            needsCleanup = true;
            await page.waitForLoadState('networkidle');
        } else {
            await page.screenshot({ path: `screenshots/projects/PRJ_TC09.png` });
            throw new Error('🐛 BUG: System error occurred when using special characters in project name.');
        }
    });
});

/**
 * Test suite for Activity Management within Projects
 */
test.describe('Activity Management Tests', () => {
    let needsCleanup = true;
    let testProjectName: string;

    test.beforeEach(async ({ page }) => {
        test.setTimeout(300_000);
        testProjectName = 'Website Redesign-' + get_current_timestamp();

        // Navigate to login page
        await page.goto(BASE_URL);

        await page.getByPlaceholder('Username').fill(VALID_USERNAME);
        await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
        await page.getByRole('button', { name: 'Login' }).click();

        await page.getByRole('link', { name: 'Time' }).click();
        await page.waitForLoadState('networkidle');

        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Projects' }).click();
        await page.waitForLoadState('networkidle');

        // Create test project
        await page.getByRole('button', { name: ' Add' }).click();
        await page.getByRole('textbox').nth(1).fill(testProjectName);
        await page.getByRole('textbox', { name: 'Type for hints...' }).first().fill('ACME Ltd');
        await page.getByRole('option', { name: 'ACME Ltd' }).click();
        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page.getByText('Successfully Saved')).toBeVisible();
    });

    test.afterEach(async ({ page }) => {
        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Projects' }).click();
        await page.waitForLoadState('networkidle');

        // Cleanup: Delete the created project
        await page.locator('.oxd-icon.bi-check').first().click();
        await page.getByRole('button', { name: ' Delete Selected' }).click();
        await page.getByRole('button', { name: ' Yes, Delete' }).click();
    });

    // ==================== POSITIVE TEST CASES ====================

    test('PROJ_TC10: Add activity with valid name', async ({ page }) => {
        /**
         * Test Case ID: PROJ_TC10
         * Description: Verify that an activity can be added with valid name for a project
         * Expected: Activity is successfully created and saved
         */
        // Arrange
        const data = PROJECT_DATA.PROJ_TC10;
        const activityName = data.test_data.activity_name;

        // Click Add button in Activities section
        await page.getByRole('button', { name: ' Add', exact: true }).click();

        // Act
        await page.getByRole('dialog').getByRole('textbox').fill(activityName);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_result'])).toBeVisible();

        // scroll to activity table
        await page.locator('div.oxd-table').scrollIntoViewIfNeeded();

        await expect(page.getByRole('table')).toContainText(activityName);
    });

    // ==================== NEGATIVE TEST CASES ====================

    test('PROJ_TC11: Add activity with empty name', async ({ page }) => {
        /**
         * Test Case ID: PROJ_TC11
         * Description: Verify validation when activity name is left empty
         * Expected: Required error message is displayed
         */
        // Arrange
        const data = PROJECT_DATA.PROJ_TC11;
        const activityName = data.test_data.activity_name;

        // Act
        await page.getByRole('button', { name: ' Add', exact: true }).click();

        await page.getByRole('dialog').getByRole('textbox').fill(activityName);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_error'], { exact: true })).toBeVisible();

        await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    });

    test('PROJ_TC12: Add activity with name exceeding max length', async ({ page }) => {
        /**
         * Test Case ID: PROJ_TC12
         * Description: Verify validation when activity name exceeds 100 characters
         * Expected: Validation error message is displayed
         */
        // Arrange
        const data = PROJECT_DATA.PROJ_TC12;
        const activityName = data.test_data.activity_name; // 101 characters

        // Act
        await page.getByRole('button', { name: ' Add', exact: true }).click();

        await page.getByRole('dialog').getByRole('textbox').fill(activityName);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText(data['expected_error'])).toBeVisible();

        await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    });

    test('PROJ_TC13: Add duplicate activity name', async ({ page }) => {
        /**
         * Test Case ID: PROJ_TC13
         * Description: Verify validation when attempting to create duplicate activity
         * Expected: Error message indicating activity already exists
         */
        // Arrange
        const data = PROJECT_DATA.PROJ_TC13;
        const activityName = data.test_data.activity_name + '_' + get_current_timestamp();

        // Create first activity
        await page.getByRole('button', { name: ' Add', exact: true }).click();
        await page.getByRole('dialog').getByRole('textbox').fill(activityName);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Successfully Saved')).toBeVisible();
        await page.waitForLoadState('networkidle');

        // Try to create duplicate activity
        await page.getByRole('button', { name: ' Add', exact: true }).click();
        await page.getByRole('dialog').getByRole('textbox').fill(activityName);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();

        const isDuplicateError = await page.getByText('Already exists').isVisible().catch(() => false);
        await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

        // Assert
        await expect(isDuplicateError,
            `🐛 DUPLICATE ACTIVITY BUG:\n` +
            `Expected: Duplicate validation error for activity name "${activityName}"\n` +
            `Actual: No duplicate error shown\n` +
            `Issue: System allowed creation of duplicate activity names`
        ).toBe(true);

    });

    test('PROJ_TC14: Add activity with special characters in name', async ({ page }) => {
        /**
         * Test Case ID: PROJ_TC14
         * Description: Verify that an activity can be added with special characters in the name
         * Expected: Observe system behavior for special characters
         */
        // Arrange
        const data = PROJECT_DATA.PROJ_TC14;
        const activityName = data.test_data.activity_name;

        // Act
        await page.getByRole('button', { name: ' Add', exact: true }).click();
        await page.getByRole('dialog').getByRole('textbox').fill(activityName);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();

        // Assert - Discovery test
        const successMessage = page.getByText('Successfully Saved');
        const errorMessage = page.locator('.oxd-input-field-error-message');

        await Promise.race([
            successMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { }),
            errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { })
        ]);

        const hasSuccess = await successMessage.isVisible().catch(() => false);
        const hasError = await errorMessage.isVisible().catch(() => false);

        console.log(`PROJ_TC14 Result: Success=${hasSuccess}, Error=${hasError}`);

        if (hasSuccess) {
            // Activity created successfully
            await page.waitForLoadState('networkidle');
        } else {
            await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
        }
    });

    test('PROJ_TC15: Add multiple activities to a project', async ({ page }) => {
        /**
         * Test Case ID: PROJ_TC15
         * Description: Verify that multiple activities can be added to a single project
         * Expected: All activities are successfully created and saved
         */
        // Arrange
        const data = PROJECT_DATA.PROJ_TC15;
        const activityNames = data.test_data.activity_names;

        // Act - Add multiple activities
        for (const activityName of activityNames) {
            await page.getByRole('button', { name: ' Add', exact: true }).click();
            await page.getByRole('dialog').getByRole('textbox').fill(activityName + '_' + get_current_timestamp());
            await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
        }

        // Assert - Verify all activities appear in the table
        await page.locator('div.oxd-table').scrollIntoViewIfNeeded();
        const table = page.getByRole('table');
        for (const activityName of activityNames) {
            console.log(`PROJ_TC15: Checking for activity "${activityName}" in table`);
            await expect(table.getByRole('cell', { name: activityName })).toBeVisible();
        }
    });

    test('PROJ_TC16: Add activity trim whitespace in name', async ({ page }) => {
        /**
         * Test Case ID: PROJ_TC16
         * Description: Verify that leading/trailing whitespace in activity name is trimmed
         * Expected: Whitespace is trimmed, activity created successfully
         */
        // Arrange
        const data = PROJECT_DATA.PROJ_TC16;
        const activityNameWithSpaces = data.test_data.activity_name; // "   Development   "
        const trimmedName = activityNameWithSpaces.trim();

        // Act
        await page.getByRole('button', { name: ' Add', exact: true }).click();
        await page.getByRole('dialog').getByRole('textbox').fill(activityNameWithSpaces);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText('Successfully Saved')).toBeVisible();

        // Check if trimmed version appears in table
        await page.locator('div.oxd-table').scrollIntoViewIfNeeded();
        const row = page.getByRole('row').filter({ hasText: trimmedName });
        await row.getByRole('button').nth(1).click();

        const actualName = await page.getByRole('dialog').getByRole('textbox').inputValue();
        console.log(`PROJ_TC16: Activity created with name="${actualName}"`);
        const isTrimmed = actualName === trimmedName;

        await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

        await expect(isTrimmed,
            `🐛 WHITESPACE TRIMMING BUG:\n` +
            `Expected: Activity name to be trimmed to "${trimmedName}"\n` +
            `Actual: Activity name is "${actualName}"\n` +
            `Issue: System did not trim leading/trailing whitespace in activity name`
        ).toBe(true);
    });

    test('PROJ_TC17: Add activity with duplicate and whitespace in name', async ({ page }) => {
        /**
         * Test Case ID: PROJ_TC17
         * Description: Verify duplicate validation when activity name has leading/trailing whitespace
         * Expected: Error message 'Already exists' after trimming whitespace
         * This test validates if system properly trims spaces before duplicate checking
         */

        test.fail(); // Marking as expected to fail if there's a bug with whitespace handling

        // Arrange
        const data = PROJECT_DATA.PROJ_TC17;
        const activityNameWithSpaces = data.test_data.activity_name; // "   Development   "
        const trimmedName = activityNameWithSpaces.trim();

        // Step 1: Create first activity WITHOUT spaces
        await page.getByRole('button', { name: ' Add', exact: true }).click();
        await page.getByRole('dialog').getByRole('textbox').fill(trimmedName);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Successfully Saved')).toBeVisible();
        await page.waitForLoadState('networkidle');

        console.log(`PROJ_TC17: Created first activity: "${trimmedName}"`);

        // Step 2: Try to create duplicate activity WITH leading/trailing spaces
        await page.getByRole('button', { name: ' Add', exact: true }).click();
        await page.getByRole('dialog').getByRole('textbox').fill(activityNameWithSpaces);
        await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();

        // Assert - Should show "Already exists" error
        const errorMessage = page.getByText('Already exists');
        const errorSystemMessage = page.getByText('Invalid Parameter');

        await Promise.race([
            errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { }),
            errorSystemMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { })
        ]);

        const hasDuplicateError = await errorMessage.isVisible().catch(() => false);
        const hasSystemError = await errorSystemMessage.isVisible().catch(() => false);

        console.log(`PROJ_TC17 Result: Input="${activityNameWithSpaces}", Trimmed="${trimmedName}", DuplicateError=${hasDuplicateError}, SystemError=${hasSystemError}`);

        if (hasSystemError) {
            console.log(`🐛 BUG: System error occurred instead of duplicate validation for activity name with whitespace.`);
            page.screenshot({ path: `screenshots/projects/PROJ_TC17.png` });
            test.fail(true, `System error occurred instead of duplicate validation for activity name with whitespace.`);
        } else {
            await expect(hasDuplicateError,
                `🐛 WHITESPACE DUPLICATE BUG:\n` +
                `Expected: Duplicate validation error for activity name "${activityNameWithSpaces}"\n` +
                `Actual: No duplicate error shown\n` +
                `Issue: System did not trim whitespace before checking for duplicates`
            ).toBe(true);
        }

        await page.locator('button.oxd-dialog-close-button').click();
    });
});

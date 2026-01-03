import { test, expect } from '@playwright/test';
import { VALID_USERNAME, VALID_PASSWORD, BASE_URL } from '../../config/config';
import * as testData from '../../test-data/customers_data.json';
import { get_current_timestamp } from '../../utils/utils';

// Extract test cases from JSON
const CUSTOMER_DATA = testData.test_cases;

/**
 * Test suite for Add Customer functionality in Time module.
 */
test.describe('Customer Management Tests', () => {
    // Flag to track created customer for cleanup
    let needsCleanup = true;

    /**
     * Before each test: Login and navigate to Customer page
     */
    test.beforeEach(async ({ page }) => {
        test.setTimeout(60000); // Set timeout to 60 seconds
        // Navigate to login page
        await page.goto(BASE_URL);
        await page.waitForTimeout(2000);

        // Login
        await page.getByPlaceholder('Username').fill(VALID_USERNAME);
        await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
        await page.getByRole('button', { name: 'Login' }).click();

        // Navigate to Time module
        await page.getByRole('link', { name: 'Time' }).click();
        await page.waitForLoadState('networkidle');

        // Navigate to Customers page
        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Customers' }).click();
        await page.waitForLoadState('networkidle');
    });

    test.afterEach(async ({ page }) => {
        if (!needsCleanup) return;

        // Cleanup: Delete the created customer
        await page.locator('.oxd-icon.bi-check').first().click();
        // get button contain text Delete Selected 
        await page.getByRole('button', { name: ' Delete Selected' }).click();
        await page.getByRole('button', { name: ' Yes, Delete' }).click();
    });

    // ==================== POSITIVE TEST CASES ====================

    test('TC01: Add customer with valid name and description', async ({ page }) => {
        /**
         * Test Case ID: TC01
         * Description: Verify that a customer can be added with both name and description
         * Expected: Customer is successfully created and saved
         */
        needsCleanup = true;
        // Arrange
        const data = CUSTOMER_DATA.CUST_TC01.test_data;
        const customerName = data.customer_name + '_' + get_current_timestamp();
        const description = data.description;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        expect(await page.getByText('Successfully Saved')).toBeVisible();

        // Verify customer appears in list
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Wait for table to update
        await expect(page.getByRole('table')).toContainText(customerName);
    });

    test('TC02: Add customer with name only (empty description)', async ({ page }) => {
        /**
         * Test Case ID: TC02
         * Description: Verify that a customer can be added with name only (description is optional)
         * Expected: Customer is successfully created and saved
         */

        needsCleanup = true;

        // Arrange
        const data = CUSTOMER_DATA.CUST_TC02.test_data;
        const customerName = data.customer_name + '_' + get_current_timestamp();
        const description = data.description;
        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();
        // Assert
        expect(await page.getByText('Successfully Saved')).toBeVisible();
        // Verify customer appears in list
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Wait for table to update
        await expect(page.getByRole('table')).toContainText(customerName);
    });


    // ==================== NEGATIVE TEST CASES ====================

    test('TC03: Add customer with empty name', async ({ page }) => {
        /**
         * Test Case ID: TC03
         * Description: Verify that customer cannot be added with empty name
         * Expected: Required error message is displayed
         */

        // trigger cleanup in afterEach
        needsCleanup = false;

        // Arrange
        const data = CUSTOMER_DATA.CUST_TC03.test_data;
        const customerName = data.customer_name;
        const description = data.description;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText('Required', { exact: true })).toBeVisible();

        // cancel to Navigate back to customer list
        await page.getByRole('button', { name: ' Cancel' }).click();
    });

    test('TC04: Add customer with name exceeding 50 characters', async ({ page }) => {
        /**
         * Test Case ID: TC04
         * Description: Verify validation for customer name exceeding 50 characters
         * Expected: Validation error message or input truncated to 50 characters
         */
        // Arrange
        const data = CUSTOMER_DATA.CUST_TC04.test_data;
        const customerName = data.customer_name; // 51 characters
        const description = data.description;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert - Check for validation error
        await expect(page.getByText('Should not exceed 50 characters')).toBeVisible();
        needsCleanup = false;
    });

    test('TC05: Add customer with duplicate name', async ({ page }) => {
        /**
         * Test Case ID: TC05
         * Description: Verify that duplicate customer name is not allowed
         * Expected: Error message indicating customer name already exists
         */
        // Arrange - First create a customer
        const data = CUSTOMER_DATA.CUST_TC05.test_data;
        const customerName = data.customer_name + '_' + get_current_timestamp();
        const description = data.description;

        // Create first customer
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Successfully Saved')).toBeVisible();
        await page.waitForLoadState('networkidle');

        // Act - Try to create duplicate customer
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText('Already exists')).toBeVisible();

        await page.getByRole('button', { name: ' Cancel' }).click();
        needsCleanup = true;
    });

    // ==================== DISCOVERY/BOUNDARY TEST CASES ====================

    test('TC06: Add customer with special characters in name', async ({ page }) => {
        /**
         * Test Case ID: TC06
         * Description: Discover how system handles special characters like <, >, &
         * Expected: System should either accept, reject, or escape special characters
         */
        // Arrange
        const data = CUSTOMER_DATA.CUST_TC06;
        const customerName = data.test_data.customer_name
        const description = data.test_data.description;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert - Discovery test, observe actual behavior
        const successMessage = page.getByText('Successfully Saved');
        const expectResult = data['expected_result'];

        // Wait for either success or error
        await Promise.race([
            successMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { }),
        ]);

        // Document the actual behavior
        const hasSuccess = await successMessage.isVisible().catch(() => false);

        console.log(`TC06 Result: Expected="${expectResult}", Actual="${hasSuccess ? 'Successfully Saved' : 'Error'}"`);
    });

    test('TC07: Add customer with name at boundary (exactly 50 chars)', async ({ page }) => {
        /**
         * Test Case ID: TC07
         * Description: Test boundary condition with exactly 50 characters
         * Expected: Customer should be created successfully
         */
        // Arrange
        needsCleanup = true;

        const data = CUSTOMER_DATA.CUST_TC07;
        const customerName = data.test_data.customer_name; // Exactly 50 characters
        const description = data.test_data.description;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText('Successfully Saved')).toBeVisible();

        // Verify customer appears in list
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Wait for table to update
        await expect(page.getByRole('table')).toContainText(customerName);
    });

    test('TC08: Add customer with various special characters', async ({ page }) => {
        /**
         * Test Case ID: TC08
         * Description: Discover how system handles various special characters @#$%
         * Expected: Observe system behavior for multiple special characters
         */
        // Arrange
        const data = CUSTOMER_DATA.CUST_TC08.test_data;
        const customerName = data.customer_name;
        const description = data.description;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        const successMessage = page.getByText('Successfully Saved');

        await successMessage.waitFor({ state: 'visible', timeout: 5000 });

        const row = page.getByRole('row').filter({ hasText: customerName });
        await row.getByRole('button').nth(1).click(); // Click edit button to check actual stored name
        // Wait for form to load
        await page.waitForLoadState('networkidle');
        const nameInput = page.locator('form input').first();
        const actualValue = await nameInput.inputValue();
        
        await page.getByRole('button', { name: ' Cancel' }).click();
        needsCleanup = true;

        expect(actualValue).toBe(customerName);
    });

    test('TC09: Add customer with leading/trailing spaces', async ({ page }) => {
        /**
         * Test Case ID: TC09
         * Description: Discover if system trims spaces or accepts them as-is
         * Expected: System should reject leading/trailing spaces or trim them
         */

        // Arrange
        const data = CUSTOMER_DATA.CUST_TC09;
        const customerName = data.test_data.customer_name;
        const description = data.test_data.description;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText('Successfully Saved')).toBeVisible();

        // Verify customer appears in list and check if spaces were trimmed
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Check if trimmed version or original version appears
        const trimmedName = customerName.trim();
        const row = page.getByRole('row').filter({ hasText: trimmedName });
        await row.getByRole('button').nth(1).click(); // Click edit button to check actual stored name
        // Wait for form to load
        await page.waitForLoadState('networkidle');

        const nameInput1 = page.locator('form input').first();
        const actualValue = await nameInput1.inputValue();
        console.log(`TC09 Debug input: value="${actualValue}" length=${actualValue.length}, expected="${trimmedName}" length=${trimmedName.length}`);

        await page.getByRole('button', { name: ' Cancel' }).click();
        needsCleanup = true;

        // Assert the trimmed name matches actual value
        if (actualValue.length !== trimmedName.length) {
            await page.screenshot({ path: `screenshots/customers/TC09_LeadingTrailingSpaces.png` });
            expect(actualValue,
                `🐛 LEADING/TRAILING SPACES BUG:\n` +
                `Expected: Customer name to be trimmed to "${trimmedName}" (length ${trimmedName.length})\n` +
                `Actual: Customer name stored as "${actualValue}" (length ${actualValue.length})\n` +
                `Issue: System does not trim leading/trailing spaces from customer name`
            ).toBe(trimmedName);
        }
    });

    test('TC10: Add customer with numeric name only', async ({ page }) => {
        /**
         * Test Case ID: TC10
         * Description: Discover if numeric-only names are accepted
         * Expected: System should accept numeric customer names
         */
        // Arrange
        const data = CUSTOMER_DATA.CUST_TC10.test_data;
        const customerName = data.customer_name
        const description = data.description;

        // Act
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerName);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert - Discovery test
        await expect(page.getByText('Successfully Saved')).toBeVisible();
        needsCleanup = true;

        // Verify customer appears in list
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await expect(page.getByRole('table')).toContainText(customerName);
    });

    test('TC11: Add customer with duplicate name containing leading/trailing spaces', async ({ page }) => {
        /**
         * Test Case ID: TC11
         * Description: Verify that duplicate detection works correctly with leading/trailing spaces
         * This test validates a BUG where the system allows duplicate customers if one has spaces
         * Expected: System should recognize "  ABC Corporation  " as duplicate of "ABC Corporation"
         * Actual: System treats them as different customers (BUG)
         */

        // Arrange
        const data = CUSTOMER_DATA.CUST_TC11.test_data;
        const customerNameWithSpaces = data.customer_name; // "  ABC Corporation  "
        const description = data.description;

        // Step 1: Create first customer spaces
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerNameWithSpaces);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.getByText('Successfully Saved')).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        console.log(`TC11: Created first customer: "${customerNameWithSpaces}"`);

        // Step 2: Try to create duplicate customer WITH leading/trailing spaces
        await page.getByRole('button', { name: ' Add' }).click();
        await page.locator('form input').fill(customerNameWithSpaces);
        await page.getByRole('textbox', { name: 'Type description here' }).fill(description);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert - Should show "Already exists" error
        const errorMessage = page.getByText('Already exists');
        const successMessage = page.getByText('Successfully Saved');

        await Promise.race([
            errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { }),
            successMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { })
        ]);

        const hasSuccess = await successMessage.isVisible().catch(() => false);

        console.log(`TC11 Result: Expected="Already exists", Actual="${hasSuccess ? 'Successfully Saved (BUG!)' : 'Already exists'}"`);
       
        // capture screenshot for evidence if success
        hasSuccess && await page.screenshot({ path: `screenshots/customers/TC11_DuplicateWithSpaces.png` });

        // await page.getByRole('button', { name: 'Cancel' }).click();
        needsCleanup = true;

        // Assert: This should fail because of the bug
        expect(hasSuccess,
            `🐛 DUPLICATE DETECTION BUG:\n` +
            `Expected: "Already exists" error\n` +
            `Actual: Customer was created successfully\n` +
            `Issue: System does not trim spaces before duplicate checking\n` +
            `Created: "${customerNameWithSpaces}" and "${customerNameWithSpaces}" as separate customers`
        ).toBe(false);
    });
});

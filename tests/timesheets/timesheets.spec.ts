import { test, expect } from '@playwright/test';
import { VALID_USERNAME, VALID_PASSWORD, BASE_URL } from '../../config/config';
import * as testData from '../../test-data/timesheet_data.json';
import { get_current_timestamp } from '../../utils/utils';

// Extract test cases from JSON
const TIMESHEET_DATA = testData.test_cases;

test.describe('Timesheets Test Suite', () => {
    let employeeData: {
        firstName: string;
        lastName: string;
        username: string;
        password: string;
    };

    // function utils
    function logout(page: any) {
        return page.locator('.oxd-userdropdown').click()
            .then(() => page.getByRole('menuitem', { name: 'Logout' }).click())
            .then(() => page.waitForLoadState());
    }
    function login(page: any, username: string, password: string) {
        return page.getByPlaceholder('Username').fill(username)
            .then(() => page.getByPlaceholder('Password').fill(password))
            .then(() => page.getByRole('button', { name: 'Login' }).click());
    }

    function nagivate(page: any, moudle: string, listiem: string, menuitem?: string) {
        return page.getByRole('link', { name: moudle }).click()
            .then(() => page.getByRole('listitem').filter({ hasText: listiem }).click())
            .then(() => page.getByRole('menuitem', { name: menuitem }).click())
            .then(() => page.waitForLoadState('networkidle'));
    }

    // ========== SETUP =============
    test.beforeEach(async ({ page }) => {
        // Navigate to login page
        test.setTimeout(300_000);
        await page.goto(BASE_URL);

        // Login
        await page.getByPlaceholder('Username').fill(VALID_USERNAME);
        await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
        await page.getByRole('button', { name: 'Login' }).click();

        // Navigate to PIM module
        await page.getByRole('link', { name: 'PIM' }).click();
        await page.getByRole('button', { name: ' Add' }).click();

        // Prepare unique employee details
        const firstName = "employee"
        const lastName = get_current_timestamp().toString();
        const username = firstName + "." + lastName;
        const pass = "Psjksl123!";

        employeeData = {
            firstName: firstName,
            lastName: lastName,
            username: username,
            password: pass
        };

        // Add new employee
        await page.getByRole('textbox', { name: 'First Name' }).fill(firstName);
        await page.getByRole('textbox', { name: 'Last Name' }).fill(lastName);
        await page.locator('.oxd-switch-input').click();
        await page.getByRole('textbox').nth(5).fill(username);
        await page.locator('input[type="password"]').first().fill(pass);
        await page.locator('input[type="password"]').nth(1).fill(pass);
        await page.getByRole('button', { name: 'Save' }).click();

        // assert
        await expect(page.getByText('Successfully Saved')).toBeVisible();

        // logout
        await logout(page);

        await page.waitForLoadState();

        // login as new employee
        await login(page, employeeData.username, employeeData.password);

        // Navigate to Time module
        await nagivate(page, 'Time', 'Timesheets', 'My Timesheets');
        await page.waitForLoadState('networkidle');
    });

    //  ========== TEST CASES =============
    test('TIMESHEETS_01: Employee creates timesheet, submits, Supervisor approves', async ({ page }) => {
        /*
        E2E-01: Happy Path - Employee creates timesheet → Submits → Supervisor approves

        Prerequisites:
        - Employee and Supervisor accounts exist
        - In this case Supervisor is Admin user and Employee is a mock user created
        for the test from fixture "create_mock_employee"

        Flow:
        -----
        Step 1: Employee logs in and creates timesheet or edits existing
        Step 2: Employee adds project, activity, and hours
        Step 3: Employee submits timesheet
        Step 4: Supervisor logs in and views submitted timesheet
        Step 5: Supervisor approves timesheet
        Step 6: Search and View for Employee's Timesheet
        Step 7: Employee verifies approved status

        Expected Result:
        ---------------
        - Timesheet status changes: Not Submitted → Submitted → Approved
        - Employee can see approved status*/

        const data = TIMESHEET_DATA['TIMESHEETS_01'];
        const projectName = data.test_data.project;
        const activityName = data.test_data.activity;
        const hoursPerDay: { [key: string]: string } = data.test_data.hours;

        const employeeFullName = `${employeeData.firstName} ${employeeData.lastName}`;

        // Edit timesheet
        await page.getByRole('button', { name: 'Edit' }).click();
        // Fill in timesheet details
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(projectName);
        await page.getByRole('option', { name: new RegExp(`${projectName}`) }).first().click();

        // get first element in the options list dropdown
        await page.locator('.oxd-icon.bi-caret-down-fill.oxd-select-text--arrow').click();
        await page.getByRole('listbox').waitFor();
        await page.getByRole('option', { name: activityName }).click();

        // press tab to move to hours input
        await page.keyboard.press('Tab');
        // fill hours for current cusorsor position
        for (const [day, hours] of Object.entries(hoursPerDay)) {
            await page.keyboard.type(hours);
            await page.keyboard.press('Tab');
        }

        // Save timesheet
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert timesheet saved
        await expect(page.getByText('Successfully Saved')).toBeVisible();

        // Submit timesheet
        await page.getByRole('button', { name: 'Submit' }).click();

        // Assert timesheet changed to Submitted status
        const statusText = `Status: ${data.test_data['expected_status_after_submit']}`;
        await expect(page.getByText(statusText)).toBeVisible();

        // Logout employee
        await logout(page);

        // Login as supervisor
        await login(page, VALID_USERNAME, VALID_PASSWORD);

        // Navigate to Employee Timesheets
        await nagivate(page, 'Time', 'Timesheets', 'Employee Timesheets');
        // Search for employee
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(employeeFullName);
        await page.getByRole('option', { name: new RegExp(employeeFullName) }).click();

        await page.locator('form').getByRole('button', { name: 'View' }).click();

        // Approve timesheet
        await page.getByRole('button', { name: 'Approve' }).click();

        // Assert
        await expect(page.getByText('Timesheet Approved')).toBeVisible();
        await expect(page.getByText('Status: Approved')).toBeVisible();

        // logout supervisor
        await logout(page);

        // login as employee
        await login(page, employeeData.username, employeeData.password);
        await nagivate(page, 'Time', 'Timesheets', 'My Timesheets');

        // Assert timesheet status is Approved
        const approvedStatusText = `Status: ${data.test_data['expected_status_after_approve']}`;
        await expect(page.getByText(approvedStatusText)).toBeVisible();
    });

    test('TIMESHEETS_02: Employee submits, Supervisor rejects with comment, Employee resubmits', async ({ page }) => {
        /*
            E2E-02: Rejection Flow - Submit → Reject → Employee edits → Re-submits → Approve
            Flow:
            -----
            Step 1: Employee creates and submits timesheet (with incorrect hours)
            Step 2: Supervisor logs in and rejects with comment
            Step 3: Employee logs in, sees rejection, edits hours
            Step 4: Employee re-submits corrected timesheet
            Step 5: Supervisor approves the corrected timesheet
            Step 6: Employee verifies final approval

            Expected Result:
            ---------------
            - Status flow: Not Submitted → Submitted → Rejected → Not Submitted → Submitted → Approved
            - Employee can see rejection comment
            - Employee can edit and resubmit after rejection
        */

        const data = TIMESHEET_DATA['TIMESHEETS_02'];
        const projectName = data.test_data.project;
        const activityName = data.test_data.activity;
        const initialHours: { [key: string]: string } = data.test_data.initial_hours;
        const correctedHours: { [key: string]: string } = data.test_data.corrected_hours;

        const employeeFullName = `${employeeData.firstName} ${employeeData.lastName}`;

        // Edit timesheet
        await page.getByRole('button', { name: 'Edit' }).click();
        // Fill in timesheet details
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(projectName);
        await page.getByRole('option', { name: new RegExp(`${projectName}`) }).first().click();

        // get first element in the options list dropdown
        await page.locator('.oxd-icon.bi-caret-down-fill.oxd-select-text--arrow').click();
        await page.getByRole('listbox').waitFor();
        await page.getByRole('option', { name: activityName }).click();

        // fill initial incorrect hours
        await page.keyboard.press('Tab');
        for (const [day, hours] of Object.entries(initialHours)) {
            await page.keyboard.type(hours);
            await page.keyboard.press('Tab');
        }

        // Save timesheet
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert timesheet saved
        await expect(page.getByText('Successfully Saved')).toBeVisible();

        // Submit timesheet
        await page.getByRole('button', { name: 'Submit' }).click();

        // Assert timesheet changed to Submitted status
        const statusText = `Status: ${data.test_data['expected_status_after_submit']}`;
        await expect(page.getByText(statusText)).toBeVisible();

        // Logout employee
        await logout(page);

        // Login as supervisor
        await login(page, VALID_USERNAME, VALID_PASSWORD);

        // Navigate to Employee Timesheets
        await nagivate(page, 'Time', 'Timesheets', 'Employee Timesheets');
        // Search for employee
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(employeeFullName);
        await page.getByRole('option', { name: new RegExp(employeeFullName) }).click();

        await page.locator('form').getByRole('button', { name: 'View' }).click();

        // Reject timesheet
        await page.getByRole('button', { name: 'Reject' }).click();

        // Assert
        await expect(page.getByText('Timesheet Rejected')).toBeVisible();
        await expect(page.getByText('Status: Rejected')).toBeVisible();

        // logout supervisor
        await logout(page);

        // login as employee
        await login(page, employeeData.username, employeeData.password);
        await nagivate(page, 'Time', 'Timesheets', 'My Timesheets');

        // Assert timesheet status is Approved
        const approvedStatusText = `Status: ${data.test_data['expected_status_after_reject']}`;
        await expect(page.getByText(approvedStatusText)).toBeVisible();

        // Edit timesheet with corrected hours
        await page.getByRole('button', { name: 'Edit' }).click();
        // click to clear and then focus hours input
        await page.getByRole('textbox').nth(2).clear().then(() => page.getByRole('textbox').nth(2).focus());
        // fill corrected hours
        for (const [day, hours] of Object.entries(correctedHours)) {
            await page.keyboard.type(hours);
            await page.keyboard.press('Tab');
        }

        // Save timesheet
        await page.getByRole('button', { name: 'Save' }).click();
        // Assert timesheet saved
        await expect(page.getByText('Successfully Saved')).toBeVisible();
        // Re-submit timesheet
        await page.getByRole('button', { name: 'Submit' }).click();
        // Assert timesheet changed to Submitted status
        await expect(page.getByText(`Status: ${data.test_data['expected_status_after_resubmit']}`)).toBeVisible();
        // Logout employee
        await logout(page);
        // Login as supervisor
        await login(page, VALID_USERNAME, VALID_PASSWORD);
        // Navigate to Employee Timesheets

        await nagivate(page, 'Time', 'Timesheets', 'Employee Timesheets');
        // Search for employee
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(employeeFullName);
        await page.getByRole('option', { name: new RegExp(employeeFullName) }).click();
        await page.locator('form').getByRole('button', { name: 'View' }).click();
        // Approve timesheet
        await page.getByRole('button', { name: 'Approve' }).click();
        // Assert
        await expect(page.getByText('Timesheet Approved')).toBeVisible();
        await expect(page.getByText('Status: Approved')).toBeVisible();
        // logout supervisor
        await logout(page);
        // login as employee
        await login(page, employeeData.username, employeeData.password);
        await nagivate(page, 'Time', 'Timesheets', 'My Timesheets');
        // Assert timesheet status is Approved
        await expect(page.getByText('Status: Approved')).toBeVisible();
    });

    test('TIMESHEETS_03: Employee attempts to submit timesheet with empty record', async ({ page }) => {
        /*
            NEG-01: Negative Test - Attempt to submit timesheet with empty record
            Flow:
            -----
            Step 1: Employee logs in and creates timesheet
            Step 2: Employee attempts to submit without adding any project/activity/hours

            Expected Result:
            ---------------
            - Submission should be blocked
            - Appropriate error message should be displayed
        */
        // Attempt to submit without editing timesheet
        test.fail();

        await page.getByRole('button', { name: 'Submit' }).click();
        // Assert error message
        const hasSuccess = await page.getByText('Successfully Submitted').isVisible().catch(() => false);

        // capture screenshot for evidence if success
        hasSuccess && await page.screenshot({ path: `screenshots/timesheets/TC03_EmptyTimesheetSubmission.png` });
        
        // Assert

        await expect(hasSuccess,
            `🐛 EMPTY TIMESHEET SUBMISSION BUG:\n` +
            `Expected: Submission blocked with error message\n` +
            `Actual: Timesheet was submitted successfully despite being empty\n` +
            `Issue: System allowed submission of empty timesheet records`
        ).toBe(false);
    });

    test('TIMESHEETS_04: Employee creates timesheet for multiple projects and activities', async ({ page }) => {
        /**
            Testcase: Create timesheet with multiple projects in a single week
            Flow:
            -----
            Step 1: Employee logs in and creates timesheet
            Step 2: Employee adds multiple project/activity combinations with hours
            Step 3: Employee submits timesheet
            Step 4: Supervisor approves timesheet
            Step 5: Employee verifies approved status
            Expected Result:
            ---------------
            - Timesheet with multiple projects is successfully submitted and approved
        **/
        const data = TIMESHEET_DATA['TIMESHEETS_04'];
        const rows = data.test_data.rows;
        // Edit timesheet
        await page.getByRole('button', { name: 'Edit' }).click();

        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            const projectName = row.project;
            const activityName = row.activity;
            const hoursPerDay: { [key: string]: string } = row.hours;

            if (index > 0) {
                // Click Add Row for additional project/activity
                await page.getByRole('cell', { name: ' Add Row' }).getByRole('button').click();
                await page.waitForTimeout(500); // Đợi row mới xuất hiện
            }

            // Fill in project
            const projectTextbox = page.getByRole('textbox', { name: 'Type for hints...' }).nth(index);
            await projectTextbox.fill(projectName);

            // Đợi options xuất hiện
            await page.getByRole('option').filter({ hasText: projectName }).first().waitFor({ state: 'visible' });
            await page.getByRole('option').filter({ hasText: projectName }).first().click();

            // Select activity
            const activityDropdown = page.locator('.oxd-icon.bi-caret-down-fill.oxd-select-text--arrow').nth(index);
            await activityDropdown.click();
            await page.getByRole('option', { name: activityName }).click();

            // Fill hours
            await page.keyboard.press('Tab');
            for (const [day, hours] of Object.entries(hoursPerDay)) {
                await page.keyboard.type(hours);
                await page.keyboard.press('Tab');
            }
        }
        // Save timesheet
        await page.getByRole('button', { name: 'Save' }).click();
        // Assert timesheet saved
        await expect(page.getByText('Successfully Saved')).toBeVisible();
        // Submit timesheet
        await page.getByRole('button', { name: 'Submit' }).click();
        // Assert timesheet changed to Submitted status
        const statusText = `Status: ${data.test_data['expected_status_after_submit']}`;
        await expect(page.getByText(statusText)).toBeVisible();

        // Logout employee
        await logout(page);
        // Login as supervisor
        await login(page, VALID_USERNAME, VALID_PASSWORD);
        // Navigate to Employee Timesheets
        await nagivate(page, 'Time', 'Timesheets', 'Employee Timesheets');
        // Search for employee
        const employeeFullName = `${employeeData.firstName} ${employeeData.lastName}`;
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(employeeFullName);
        await page.getByRole('option', { name: new RegExp(employeeFullName) }).click();
        await page.locator('form').getByRole('button', { name: 'View' }).click();
        // Approve timesheet
        await page.getByRole('button', { name: 'Approve' }).click();
        // Assert
        await expect(page.getByText('Timesheet Approved')).toBeVisible();
        await expect(page.getByText('Status: Approved')).toBeVisible();
        // logout supervisor
        await logout(page);
        // login as employee
        await login(page, employeeData.username, employeeData.password);
        await nagivate(page, 'Time', 'Timesheets', 'My Timesheets');
        // Assert timesheet status is Approved
        const approvedStatusText = `Status: ${data.test_data['expected_status_after_approve']}`;
        await expect(page.getByText(approvedStatusText)).toBeVisible();
    });

    test('TIMESHEETS_05: Check timesheet with decimal hours input', async ({ page }) => {
        /*
        Testcase: Employee enters decimal hours in timesheet

        Flow:
        -----
        Step 1: Employee logs in and creates timesheet
        Step 2: Employee adds project/activity and enters decimal hours
        Step 3: Employee saves timesheet
        Step 4: Verify total hours calculation

        Expected Result:
        ---------------
        - Decimal hours should be accepted
        - Total hours should be calculated correctly
        */

        const data = TIMESHEET_DATA['TIMESHEETS_05'];
        const projectName = data.test_data.project;
        const activityName = data.test_data.activity;
        const hoursPerDay: { [key: string]: string } = data.test_data.hours;
        // Edit timesheet
        await page.getByRole('button', { name: 'Edit' }).click();
        // Fill in timesheet details

        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(projectName);
        await page.getByRole('option', { name: new RegExp(`${projectName}`) }).first().click();

        // get first element in the options list dropdown
        await page.locator('.oxd-icon.bi-caret-down-fill.oxd-select-text--arrow').click();
        await page.getByRole('listbox').waitFor();
        await page.getByRole('option', { name: activityName }).click();
        // press tab to move to hours input
        await page.keyboard.press('Tab');
        // fill hours for current cusorsor position
        for (const [day, hours] of Object.entries(hoursPerDay)) {
            await page.keyboard.type(hours);
            await page.keyboard.press('Tab');
        }
        // Save timesheet
        await page.getByRole('button', { name: 'Save' }).click();
        // Assert timesheet saved
        await expect(page.getByText('Successfully Saved')).toBeVisible();

        // Verify total hours
        const totalHours = data.test_data['expected_total_hours'];

        // get row has text ''Total''
        const row = page.getByRole('row').filter({ hasText: 'Total' });
        const lastCell = row.getByRole('cell').last();
        const totalHoursText = await lastCell.textContent();

        // const totalHoursText = await lastCell.textContent();
        await expect(totalHoursText?.trim(),
            `🐛 DECIMAL HOURS CALCULATION BUG:\n` +
            `Expected: Total hours to be ${totalHours}\n` +
            `Actual: Total hours displayed as ${totalHoursText}\n` +
            `Issue: System miscalculated total hours with decimal inputs`
        ).toBe(totalHours);
    });

    test('TIMESHEETS_06: Employee creates timesheet with project without assigned time', async ({ page }) => {
        /*
        Negative Testcase: Employee tries to submit timesheet for project with no assigned time

        Flow:
        -----
        Step 1: Employee logs in and creates timesheet
        Step 2: Employee adds project/activity but leaves hours empty
        Step 3: Employee save record
        Step 4: Verify that submission is blocked

        Expected Result:
        ---------------
        - Submission should be blocked
        - Appropriate error message should be displayed
        */

        const data = TIMESHEET_DATA['TIMESHEETS_06'];
        const projectName = data.test_data.project;
        const activityName = data.test_data.activity;
        // Edit timesheet
        await page.getByRole('button', { name: 'Edit' }).click();
        // Fill in timesheet details
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(projectName);
        await page.getByRole('option', { name: new RegExp(`${projectName}`) }).first().click();

        // get first element in the options list dropdown
        await page.locator('.oxd-icon.bi-caret-down-fill.oxd-select-text--arrow').click();
        await page.getByRole('listbox').waitFor();
        await page.getByRole('option', { name: activityName }).click();
        // Save timesheet without entering hours
        await page.getByRole('button', { name: 'Save' }).click();

        const hasSuccess = await page.getByText('Successfully Saved').isVisible().catch(() => false);

        // Mark test as expected to fail due to known issue
        test.fail();
        // Assert
        await expect(hasSuccess,
            `🐛 TIMESHEET SUBMISSION WITHOUT HOURS BUG:\n` +
            `Expected: ${data.expected_result}\n` +
            `Actual: Timesheet was saved successfully without hours\n` +
            `Issue: System allowed saving timesheet records without hours`
        ).toBe(false);
    });
    test('TIMESHEETS_07: Employee attempts to enter negative hours in timesheet', async ({ page }) => {
        /*
        Negative Testcase: Employee attempts to enter negative hours in timesheet

        Flow:
        -----
        Step 1: Employee logs in and creates timesheet
        Step 2: Employee adds project/activity and enters negative hours
        Step 3: Check contain error "Should Be Less Than 24 and in HH:MM or Decimal Format"

        Expected Result:
        ---------------
        - Negative hours should be rejected
        - Appropriate error message should be displayed
        */
    });

    test('TIMESHEETS_08: Employee attempts to enter hours exceeding 24 in a day', async ({ page }) => {
        /*
        Negative Testcase: Employee attempts to enter hours exceeding 24 in a day

        Flow:
        -----
        Step 1: Employee logs in and creates timesheet
        Step 2: Employee adds project/activity and enters hours > 24
        Step 3: Check contain error "Should not exceed 24"

        Expected Result:
        ---------------
        - Hours exceeding 24 should be rejected
        - Appropriate error message should be displayed
        */

        const data = TIMESHEET_DATA['TIMESHEETS_08'];
        const projectName = data.test_data.project;
        const activityName = data.test_data.activity;
        const hoursPerDay: { [key: string]: string } = data.test_data.hours;
        // Edit timesheet
        await page.getByRole('button', { name: 'Edit' }).click();
        // Fill in timesheet details
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(projectName);
        await page.getByRole('option', { name: new RegExp(`${projectName}`) }).first().click();
        // get first element in the options list dropdown
        await page.locator('.oxd-icon.bi-caret-down-fill.oxd-select-text--arrow').click();
        await page.getByRole('listbox').waitFor();
        await page.getByRole('option', { name: activityName }).click();
        // press tab to move to hours input
        await page.keyboard.press('Tab');
        // fill hours for current cusorsor position
        for (const [day, hours] of Object.entries(hoursPerDay)) {
            await page.keyboard.type(hours);
            await page.keyboard.press('Tab');
        }

        // Assert error message for hours exceeding 24
        await expect(page.getByText(data.expected_error)).toBeVisible();
    });

    test('TIMESHEETS_09: Employee attempts to enter invalid text format for hours', async ({ page }) => {
        /*
        Negative Testcase: Employee attempts to enter invalid text format for hours

        Flow:
        -----
        Step 1: Employee logs in and creates timesheet
        Step 2: Employee adds project/activity and enters non-numeric text for hours
        Step 3: Check contain error "Error: Invalid or field reject non-numeric input"

        Expected Result:
        ---------------
        - Non-numeric text should be rejected
        - Appropriate error message should be displayed
        */
        const data = TIMESHEET_DATA['TIMESHEETS_09'];
        const projectName = data.test_data.project;
        const activityName = data.test_data.activity;
        const hoursPerDay: { [key: string]: string } = data.test_data.hours;

        // Edit timesheet
        await page.getByRole('button', { name: 'Edit' }).click();
        // Fill in timesheet details
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(projectName);
        await page.getByRole('option', { name: new RegExp(`${projectName}`) }).first().click();
        // get first element in the options list dropdown
        await page.locator('.oxd-icon.bi-caret-down-fill.oxd-select-text--arrow').click();
        await page.getByRole('listbox').waitFor();
        await page.getByRole('option', { name: activityName }).click();
        // press tab to move to hours input
        await page.keyboard.press('Tab');
        // fill hours for current cusorsor position
        for (const [day, hours] of Object.entries(hoursPerDay)) {
            await page.keyboard.type(hours);
            await page.keyboard.press('Tab');
        }
        // Assert error message for invalid text format
        await expect(page.getByText(data.expected_error)).toBeVisible();

    });

    test('TIMESHEETS_10: Employee attempts to create timesheet for a future week', async ({ page }) => {
        /*
        Negative Testcase: Employee attempts to create timesheet for a future week

        Flow:
        -----
        Step 1: Employee logs in and navigates to timesheet page
        Step 2: Employee selects next week
        Step 3: Check if "Create Timesheet" button is disabled

        Expected Result:
        ---------------
        - Employee should not be able to create timesheet for future week
        - Appropriate message or disabled state should be displayed
        */

        const data = TIMESHEET_DATA['TIMESHEETS_10'];
        // Navigate to next week
        await page.getByRole('button')
            .filter({ has: page.locator('i.oxd-icon.bi-chevron-right') })
            .click();

        // Assert "Create Timesheet" button is disabled
        const createButton = page.getByRole('button', { name: 'Create Timesheet' });
        const isDisabled = await createButton.isDisabled();
        await expect(isDisabled,
            `🐛 FUTURE WEEK TIMESHEET CREATION BUG:\n` +
            `Expected: ${data.expected_result}\n` +
            `Actual: "Create Timesheet" button is enabled for future week\n` +
            `Issue: System allowed creation of timesheet for future weeks`
        ).toBe(true);
    });

    test('TIMESHEETS_11: Check that approved timesheet cannot be edited', async ({ page }) => {
        /*
        Negative Testcase: Check that approved timesheet cannot be edited

        Flow:
        -----
        Step 1: Employee logs in and creates timesheet
        Step 2: Employee adds project/activity and hours
        Step 3: Employee submits timesheet
        Step 4: Supervisor approves timesheet
        Step 5: Employee attempts to edit approved timesheet

        Expected Result:
        ---------------
        - Edit button should be disabled or hidden for approved timesheet
        - Employee should not be able to edit approved timesheet
        */

        const data = TIMESHEET_DATA['TIMESHEETS_11'];
        const projectName = data.test_data.project;
        const activityName = data.test_data.activity;
        const hoursPerDay: { [key: string]: string } = data.test_data.hours;
        // Edit timesheet
        await page.getByRole('button', { name: 'Edit' }).click();
        // Fill in timesheet details
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(projectName);
        await page.getByRole('option', { name: new RegExp(`${projectName}`) }).first().click();
        // get first element in the options list dropdown
        await page.locator('.oxd-icon.bi-caret-down-fill.oxd-select-text--arrow').click();
        await page.getByRole('listbox').waitFor();
        await page.getByRole('option', { name: activityName }).click();
        // press tab to move to hours input
        await page.keyboard.press('Tab');
        // fill hours for current cusorsor position
        for (const [day, hours] of Object.entries(hoursPerDay)) {
            await page.keyboard.type(hours);
            await page.keyboard.press('Tab');
        }
        // Save timesheet
        await page.getByRole('button', { name: 'Save' }).click();
        // Assert timesheet saved
        await expect(page.getByText('Successfully Saved')).toBeVisible();
        // Submit timesheet
        await page.getByRole('button', { name: 'Submit' }).click();
        // Assert timesheet changed to Submitted status
        const statusText = `Status: ${data.test_data['expected_status_after_submit']}`;
        await expect(page.getByText(statusText)).toBeVisible();
        // Logout employee
        await logout(page);
        // Login as supervisor
        await login(page, VALID_USERNAME, VALID_PASSWORD);
        // Navigate to Employee Timesheets
        await nagivate(page, 'Time', 'Timesheets', 'Employee Timesheets');
        // Search for employee
        const employeeFullName = `${employeeData.firstName} ${employeeData.lastName}`;
        await page.getByRole('textbox', { name: 'Type for hints...' }).fill(employeeFullName);
        await page.getByRole('option', { name: new RegExp(employeeFullName) }).click();
        await page.locator('form').getByRole('button', { name: 'View' }).click();
        // Approve timesheet
        await page.getByRole('button', { name: 'Approve' }).click();
        // Assert
        await expect(page.getByText('Timesheet Approved')).toBeVisible();
        await expect(page.getByText('Status: Approved')).toBeVisible();
        // logout supervisor
        await logout(page);
        // login as employee
        await login(page, employeeData.username, employeeData.password);
        await nagivate(page, 'Time', 'Timesheets', 'My Timesheets');
        // Assert Edit button is not visible
        const editButton = page.getByRole('button', { name: 'Edit' });
        const isVisible = await editButton.isVisible().catch(() => false);
        await expect(isVisible,
            `🐛 EDIT APPROVED TIMESHEET BUG:\n` +
            `Expected: Edit button to be hidden or disabled for approved timesheet\n` +
            `Actual: Edit button is visible for approved timesheet\n` +
            `Issue: System allowed editing of approved timesheets`
        ).toBe(false);
    });

});

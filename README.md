# OrangeHRM Test Automation with Playwright & TypeScript

Dự án test automation cho OrangeHRM sử dụng Playwright và TypeScript với modern locator strategies và data-driven testing.

## 🎯 Tính năng nổi bật

- ✅ **Modern Locator Strategies**: Sử dụng `getByRole`, `getByLabel`, `getByText` thay vì CSS/XPath selectors
- ✅ **TypeScript**: Type-safe code với IntelliSense support
- ✅ **Data-Driven Testing**: Test data được quản lý trong JSON files
- ✅ **Comprehensive Test Coverage**: Positive, negative, boundary, và discovery tests
- ✅ **Utility Functions**: Helper functions cho timestamp và các operations thông dụng

## 📁 Cấu trúc dự án

```
orangehrm-playwright-with-nodejs/
├── tests/                          # Test specification files
│   ├── customers/
│   │   └── customer.spec.ts       # Customer management tests
│   ├── projects/
│   │   └── projects.spec.ts       # Project management tests
│   └── timesheets/
│       └── timesheets.spec.ts     # Timesheet management tests
├── test-data/                      # Test data files (JSON)
│   ├── customers_data.json        # Customer test data
│   ├── projects_data.json         # Project test data
│   └── timesheet_data.json        # Timesheet test data
├── config/                         # Configuration files
│   └── config.ts                  # Base URL, credentials & constants
├── utils/                          # Utility functions
│   └── utils.ts                   # Helper functions (timestamp, etc.)
├── playwright.config.ts           # Playwright configuration
├── playwright.config.js           # Playwright JS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies & scripts
├── screenshots/                    # Screenshot storage
├── test-results/                   # Test execution results
└── playwright-report/              # HTML test reports
```

## 🚀 Cài đặt

1. **Clone repository**

```bash
git clone <repository-url>
cd orangehrm-playwright-with-nodejs
```

2. **Cài đặt dependencies**

```bash
npm install
```

3. **Cài đặt browsers**

```bash
npx playwright install
```

## 🧪 Chạy tests

### Chạy tất cả tests

```bash
npm test
```

### Chạy tests với headed mode (xem browser)

```bash
npm run test:headed
```

### Chạy tests với debug mode

```bash
npm run test:debug
```

### Xem test report

```bash
npm run report
```

### Generate test code (Codegen)

```bash
npm run codegen
```

## 📝 Viết tests

### Example test với modern locators và data-driven approach

```typescript
import { test, expect } from '@playwright/test';
import { VALID_USERNAME, VALID_PASSWORD, BASE_URL } from '../../config/config';
import * as testData from '../../test-data/customers_data.json';
import { get_current_timestamp } from '../../utils/utils';

const CUSTOMER_DATA = testData.test_cases;

test.describe('Customer Management Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate và login
        await page.goto(BASE_URL);
        await page.getByPlaceholder('Username').fill(VALID_USERNAME);
        await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
        await page.getByRole('button', { name: 'Login' }).click();

        // Navigate to Customers page
        await page.getByRole('link', { name: 'Time' }).click();
        await page.getByText('Project Info').click();
        await page.getByRole('menuitem', { name: 'Customers' }).click();
    });

    test('Add customer with valid data', async ({ page }) => {
        const testCase = CUSTOMER_DATA.CUST_TC01;
        const customerName = `${testCase.test_data.customer_name}_${get_current_timestamp()}`;

        // Add customer
        await page.getByRole('button', { name: 'Add' }).click();
        await page.getByLabel('Name').fill(customerName);
        await page.getByRole('button', { name: 'Save' }).click();

        // Assert
        await expect(page.getByText('Success')).toBeVisible();
    });
});
```

## 🎨 Best Practices

### 1. Locator Strategy Priority

1. **getByRole** - Preferred (accessibility-first)
2. **getByLabel** - For form inputs
3. **getByText** - For visible text
4. **getByPlaceholder** - For placeholders
5. **locator** - Last resort (CSS/XPath)

### 2. Test Organization

- ✅ Use descriptive test names
- ✅ Follow Arrange-Act-Assert pattern
- ✅ Add comments for complex test logic
- ✅ Keep tests independent
- ✅ Use data-driven testing với JSON files
- ✅ Sử dụng utility functions cho common operations

### 3. Test Structure

```typescript
test.describe('Feature Tests', () => {
    // Setup
    test.beforeEach(async ({ page }) => {
        // Common setup: login, navigation, etc.
    });

    // Cleanup
    test.afterEach(async ({ page }) => {
        // Cleanup: delete test data, logout, etc.
    });

    // Test cases organized by category
    test('Positive test case', async ({ page }) => {
        // Test implementation
    });

    test('Negative test case', async ({ page }) => {
        // Test implementation
    });
});
```

## 📊 Test Data

Test data được quản lý trong các JSON files trong thư mục `test-data/`:

### customers_data.json

```json
{
  "test_cases": {
    "CUST_TC01": {
      "test_name": "Add customer with valid name and description",
      "category": "positive",
      "test_data": {
        "customer_name": "ABC Corporation",
        "description": "Leading software development company"
      }
    }
  }
}
```

### projects_data.json

Chứa test data cho project management tests

### timesheet_data.json

Chứa test data cho timesheet tests

## 🔧 Configuration

### Playwright Config ([playwright.config.ts](playwright.config.ts))

- Test directory: `./tests`
- Timeout: Unlimited (0)
- Parallel execution: Enabled
- Browser: Firefox (Desktop)
- Headless: false (headed mode)
- Viewport: 1280x968
- Screenshot on failure: Enabled
- Video: retry-with-video
- Trace: on-first-retry
- HTML Reporter: `playwright-report/`

### Test Config ([config/config.ts](config/config.ts))

```typescript
export const BASE_URL = 'https://dbqui176-osondemand.orangehrm.com/';
export const VALID_USERNAME = 'Admin';
export const VALID_PASSWORD = 'o@M@dO1@SLj0';
export const EMPLOYEE_PASSWORD = '2742003Huong!';
```

## 📖 Test Modules

### 1. Customer Management Tests ([tests/customers/customer.spec.ts](tests/customers/customer.spec.ts))

- ✅ Positive tests: Add customer with valid data
- ✅ Negative tests: Invalid inputs, duplicates
- ✅ Boundary tests: Max length validation
- ✅ Discovery tests: Edge cases

### 2. Project Management Tests ([tests/projects/projects.spec.ts](tests/projects/projects.spec.ts))

- ✅ Project creation and management
- ✅ Project validation tests

### 3. Timesheet Tests ([tests/timesheets/timesheets.spec.ts](tests/timesheets/timesheets.spec.ts))

- ✅ Timesheet creation and management
- ✅ Time entry validation

## 🐛 Debugging

### VS Code Debug

1. Cài đặt extension: Playwright Test for VSCode
2. Click vào test line number
3. Click "Debug Test"

### Command Line Debug

```bash
npm run test:debug
```

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

### Xem HTML Report

```bash
npm run report
```


## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Modern Web Testing with Playwright](https://playwright.dev/docs/locators)

## 🤝 Contributing

Contributions are welcome! Please follow the coding standards and best practices outlined in this README.

## 📄 License

ISC

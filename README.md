# OrangeHRM Test Automation with Playwright & TypeScript

Dự án test automation cho OrangeHRM sử dụng Playwright và TypeScript với Page Object Model (POM) pattern tối ưu.

## 🎯 Tính năng nổi bật

- ✅ **Modern Locator Strategies**: Sử dụng `getByRole`, `getByLabel`, `getByText` thay vì CSS/XPath selectors
- ✅ **TypeScript**: Type-safe code với IntelliSense support
- ✅ **Page Object Model**: Cấu trúc POM rõ ràng, dễ maintain
- ✅ **Data-Driven Testing**: Test data được quản lý trong JSON files
- ✅ **Comprehensive Test Coverage**: Positive, negative, boundary, và discovery tests

## 📁 Cấu trúc dự án

```
orangehrm-playwright-with-nodejs/
├── pages/                      # Page Object classes
│   ├── BasePage.ts            # Base class với common methods
│   ├── LoginPage.ts           # Login page object
│   ├── DashboardPage.ts       # Dashboard page object
│   └── CustomerPage.ts        # Customer page object
├── tests/                      # Test files
│   └── customers/
│       └── customer.spec.ts   # Customer management tests
├── test-data/                  # Test data files
│   └── customers_data.json    # Customer test data
├── config/                     # Configuration files
│   └── config.ts              # Test configuration & constants
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Node.js dependencies
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

### Chạy tests với UI mode (recommended)
```bash
npm run test:ui
```

### Chạy tests với headed mode (xem browser)
```bash
npm run test:headed
```

### Chạy tests với debug mode
```bash
npm run test:debug
```

### Chạy customer tests cụ thể
```bash
npm run test:customer
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

### Example test với modern pattern

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CustomerPage } from '../pages/CustomerPage';

test('Add customer', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();

    // Act
    await loginPage.login('Admin', 'password');

    const customerPage = new CustomerPage(page);
    await customerPage.navigateToCustomerPage();
    await customerPage.addCustomer('New Customer', 'Description');

    // Assert
    expect(await customerPage.isSuccessMessageVisible()).toBeTruthy();
});
```

## 🏗️ Page Object Pattern

### BasePage - Common methods
```typescript
// ✅ GOOD - Using modern locators
protected getByRole(role: 'button' | 'textbox', options?: { name?: string }): Locator
protected getByLabel(label: string): Locator
protected getByText(text: string): Locator

// ❌ AVOID - Old CSS/XPath selectors
protected locator(selector: string): Locator  // Use only when necessary
```

### CustomerPage - Example
```typescript
// ✅ GOOD - Readable locators using getters
private get addButton(): Locator {
    return this.getByRole('button', { name: 'Add' });
}

private get customerNameInput(): Locator {
    return this.getByLabel('Name');
}

// ✅ GOOD - Clear action methods
async addCustomer(name: string, description: string = ''): Promise<void> {
    await this.clickAddCustomer();
    await this.enterCustomerName(name);
    if (description) {
        await this.enterDescription(description);
    }
    await this.clickSave();
}
```

## 🎨 Best Practices

### 1. Locator Strategy Priority
1. **getByRole** - Preferred (accessibility-first)
2. **getByLabel** - For form inputs
3. **getByText** - For visible text
4. **getByPlaceholder** - For placeholders
5. **locator** - Last resort (CSS/XPath)

### 2. Page Object Structure
```typescript
class CustomerPage extends BasePage {
    // 1. Locators section (private getters)
    private get element(): Locator { ... }

    // 2. Navigation section
    async navigateToPage(): Promise<void> { ... }

    // 3. Actions section
    async performAction(): Promise<void> { ... }

    // 4. Assertions section
    async isElementVisible(): Promise<boolean> { ... }
}
```

### 3. Test Organization
- ✅ Use descriptive test names
- ✅ Follow Arrange-Act-Assert pattern
- ✅ Add comments for complex test logic
- ✅ Keep tests independent

## 📊 Test Data

Test data được quản lý trong `test-data/customers_data.json`:

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

## 🔧 Configuration

### Playwright Config ([playwright.config.ts](playwright.config.ts))
- Timeout settings
- Browser configurations
- Reporter settings
- Screenshot/video on failure

### Test Config ([config/config.ts](config/config.ts))
- Base URL
- Credentials
- Timeouts
- Directories

## 📖 Test Cases

### Customer Management Tests
- ✅ TC01: Add customer with name and description
- ✅ TC02: Add customer with name only
- ✅ TC03: Empty name validation
- ✅ TC04: Name exceeds max length
- ✅ TC05: Duplicate name validation
- ✅ TC06: Special characters handling
- ✅ TC07: Boundary test (50 chars)
- ✅ TC08-TC10: Discovery tests

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

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## 🤝 Contributing

Contributions are welcome! Please follow the coding standards and best practices outlined in this README.

## 📄 License

ISC

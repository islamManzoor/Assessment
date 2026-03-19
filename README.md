# Giphy React Application - Cypress E2E Tests

Comprehensive End-to-End test suite for the Giphy GIF browser application using Cypress and TypeScript.

## 📋 Table of Contents

- [Overview](#-overview)
- [Test Coverage](#-test-coverage)
- [Reasoning for Automated Tests](#-reasoning-for-automated-tests)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running Tests](#-running-tests)
- [Test Structure](#-test-structure)
- [Configuration](#-configuration)
- [Test Reports](#-test-reports)
- [Important Notes](#-important-notes)
- [Troubleshooting](#-troubleshooting)
- [Additional Resources](#-additional-resources)
- [Contributing](#-contributing)
- [Test Execution Summary](#-test-execution-summary)
- [Support](#-support)

---

## 🎯 Overview

This test suite provides comprehensive E2E testing for two main features of the Giphy React application:

1. **Trending GIFs** - Loading and infinite scroll of trending GIFs
2. **Search GIFs** - Searching for GIFs with infinite scroll

**Application URL**: https://giphy-app-nu.vercel.app/

---

## ✅ Test Coverage

### Trending GIFs Tests (`trending-gifs.cy.ts`)
- ✓ Initial load of 15 trending GIFs
- ✓ API response validation
- ✓ Infinite scroll pagination
- ✓ Multiple scroll events
- ✓ End-of-results detection
- ✓ Loading indicators
- ✓ Error handling (network failures, invalid responses)
- ✓ Performance testing
- ✓ Responsive design (mobile, tablet, desktop)
- ✓ Image display and animations

**Total Test Cases**: 40+ tests (comprehensive coverage of trending GIF functionality)

### Search GIFs Tests (`search-gifs.cy.ts`)
- ✓ Search input rendering
- ✓ Basic search functionality
- ✓ API parameter validation
- ✓ Search with infinite scroll
- ✓ Empty search handling
- ✓ No results scenario
- ✓ Special characters and edge cases
- ✓ Rapid search changes
- ✓ Loading states
- ✓ Error handling
- ✓ URL state management
- ✓ Responsive design
- ✓ Accessibility

**Total Test Cases**: 45+ tests (comprehensive search functionality coverage)

**Overall Total**: 85+ comprehensive test cases

---

## 🎯 Reasoning for Automated Tests

### Why These Features Were Automated

The **Trending GIFs** and **Search GIFs** features were selected for automation based on the following criteria:

#### 1. High-Risk Areas
- **API Integration**: Both features heavily rely on Giphy API calls, which are prone to network issues, rate limiting, and response variations
- **Infinite Scroll**: Complex scroll-triggered loading logic that can easily break with code changes. Images load dynamically as users scroll, requiring precise offset tracking
- **State Management**: Managing multiple states (loading, loaded, error, end of results) requires thorough testing

#### 2. Repetitive Testing Requirements
- **Multiple Scenarios**: Each feature requires testing with various inputs (search terms, scroll depths, edge cases)
- **Cross-Browser Testing**: Need to verify functionality across Chrome, Firefox, and Edge
- **Responsive Design**: Must test on mobile, tablet, and desktop viewports where scroll behavior varies
- **Regression Testing**: Changes to one feature shouldn't break the other

#### 3. Time-Consuming Manual Tests
- **Infinite Scroll Testing**: Manually scrolling and verifying that new batches of 15 GIFs load correctly is tedious and error-prone
- **Special Character Testing**: Testing various search inputs (emojis, special characters, long strings) is time-intensive
- **Error Scenarios**: Simulating API failures and network errors is difficult manually
- **Performance Testing**: Measuring load times and checking for memory leaks during continuous scrolling requires automation

#### 4. Business-Critical Functionality
- **Core Features**: Trending and Search are the primary use cases for the application
- **User Experience**: Any failure in infinite scroll (duplicate images, missing content, infinite loading) directly impacts user satisfaction
- **SEO Impact**: Search functionality affects discoverability and engagement metrics

### What Was Automated

#### Trending GIFs Tests (40+ tests)
- ✅ API response validation and error handling
- ✅ Infinite scroll with automatic loading of additional GIF batches (15 at a time)
- ✅ End-of-results detection to prevent unnecessary API calls
- ✅ Loading states and performance benchmarks during scroll events
- ✅ Responsive behavior across all device sizes
- ✅ Image loading and display verification
- ✅ Duplicate prevention across scroll-loaded batches

#### Search GIFs Tests (45+ tests)
- ✅ Search input validation and submission
- ✅ API parameter encoding for special characters
- ✅ Search results with infinite scroll loading
- ✅ Empty search and no results scenarios
- ✅ Rapid search changes and query handling
- ✅ URL state management and browser history
- ✅ Accessibility compliance (ARIA labels, keyboard navigation)
- ✅ Maintaining search context across multiple scroll loads

### Benefits of Automation

**Speed**: Full test suite runs in ~5-10 minutes vs. hours of manual testing

**Reliability**: Automated tests are consistent and eliminate human error

**Coverage**: 85+ test scenarios executed on every code change

**Confidence**: Deploy with certainty that core features work as expected

**Cost-Effective**: Long-term ROI through reduced manual QA time

**CI/CD Integration**: Tests run automatically on every pull request

### What Remains Manual

Some test scenarios are better suited for manual testing:
- Visual design verification and UI polish
- Exploratory testing for edge cases
- User experience and usability testing
- Accessibility audits with screen readers
- Cross-device testing on physical devices

---

## 📦 Prerequisites

Before running the tests, ensure you have the following installed:

- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: For version control

Check your versions:
```bash
node --version
npm --version
```

---

## 🚀 Installation

1. **Clone the Repository** to your desired location

2. **Open the Assessment folder in clone repository**:
   ```bash
   cd cyprus_tests
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

   This will install:
   - Cypress (v15.12.0)
   - TypeScript (v5.9.3)
   - @faker-js/faker (v10.3.0) - Test data generation
   - @types/node (v25.5.0) - Type definitions for Node.js
   - cypress-mochawesome-reporter (v4.0.2) - HTML test reports

3. **Verify installation**:
   ```bash
   npx cypress --version
   ```

---

## 🧪 Running Tests

### Interactive Mode (Cypress Test Runner)

Open Cypress Test Runner with a graphical interface:

```bash
npm run cypress:open
```

This allows you to:
- Select which test file to run
- See tests execute in real-time
- Debug tests interactively
- Take advantage of time-travel debugging

### Headless Mode (CI/CD)

Run all tests in headless mode:

```bash
npm test
# or
npm run cypress:run
```

### Run Specific Test Suites

**Run only Trending GIFs tests**:
```bash
npm run test:trending
```

**Run only Search GIFs tests**:
```bash
npm run test:search
```

### Browser-Specific Tests

**Run tests in Chrome**:
```bash
npm run cypress:run:chrome
```

**Run tests in Firefox**:
```bash
npm run cypress:run:firefox
```

**Run tests in Edge**:
```bash
npm run cypress:run:edge
```

### Headed Mode (Visible Browser)

Run tests with a visible browser window:

```bash
npm run test:headed
```

---

## 📁 Test Structure

```
cyprus_tests/
├── cypress/
│   ├── e2e/                          # E2E test files
│   │   ├── trending-gifs.cy.ts       # Trending GIFs tests
│   │   └── search-gifs.cy.ts         # Search GIFs tests
│   ├── support/                       # Support files
│   │   ├── commands.ts               # Custom Cypress commands
│   │   └── e2e.ts                    # Global configuration
│   ├── screenshots/                   # Auto-generated on failures
│   ├── videos/                        # Test execution recordings
│   └── reports/                       # HTML test reports
├── cypress.config.ts                  # Cypress configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies and scripts
├── Test_Plan.docx                     # Comprehensive test plan
└── README.md                          # This file
```

---

## ⚙️ Configuration

### Cypress Configuration (`cypress.config.ts`)

- **Base URL**: `https://giphy-app-nu.vercel.app`
- **Viewport**: 1280x720 (default)
- **Videos**: Enabled (saved in `cypress/videos/`)
- **Screenshots**: Enabled on failure (saved in `cypress/screenshots/`)
- **Retries**: 2 retries in run mode, 0 in open mode
- **Timeouts**:
  - Command: 15 seconds
  - Page load: 30 seconds
  - Request: 15 seconds
  - Response: 30 seconds

### Environment Variables

Environment variables are configured in `cypress.config.ts`:

```typescript
env: {
  GIPHY_API_BASE_URL: 'https://api.giphy.com/v1/gifs',
  GIPHY_API_KEY: 'dc6zaTOxFJmzC', // Public beta key
}
```

To use a different API key, modify the config file or use environment variables:

```bash
CYPRESS_GIPHY_API_KEY=your_api_key npm test
```

---

## 📊 Test Reports

### Console Output

Test results are displayed in the console after execution:
- ✓ Passed tests (green)
- ✗ Failed tests (red)
- Test duration
- Pass/fail statistics

### Video Recordings

All test runs are recorded and saved to `cypress/videos/`:
- `trending-gifs.cy.ts.mp4`
- `search-gifs.cy.ts.mp4`
- `feedback-form.cy.ts.mp4`

### Screenshots

Screenshots are automatically captured on test failures:
- Saved in `cypress/screenshots/`
- Organized by test file and test name

### HTML Reports with Mochawesome

This project includes **cypress-mochawesome-reporter** for generating beautiful HTML test reports.

**Generate HTML reports**:
```bash
# Reports are automatically generated after test runs
npm test
```

**View reports**:
After running tests, open the generated HTML report:
```
cypress/reports/html/index.html
```

The report includes:
- ✓ Detailed test results with pass/fail status
- ✓ Execution time for each test
- ✓ Screenshots for failed tests
- ✓ Test hierarchy and organization
- ✓ Summary statistics and charts

**Manual report generation** (if needed):
```bash
npx cypress run --reporter cypress-mochawesome-reporter
```

---

## ⚠️ Important Notes

### Feedback Form Feature

**The Feedback Form feature does NOT exist in the application.**

The original test plan included a Feedback Form feature, but it is not currently implemented in the application at https://giphy-app-nu.vercel.app/. All feedback form tests have been removed from this test suite. 

**Current Implementation Status:**
- ✅ Trending GIFs - Fully implemented and tested
- ✅ Search GIFs - Fully implemented and tested  
- ❌ Feedback Form - Not implemented (excluded from tests)

If the Feedback Form feature is added in the future, comprehensive test cases are documented in [Test_Plan.docx](Test_Plan.docx) and can be implemented as needed.

### API Rate Limiting

The tests use Giphy's public beta API key which has rate limits:
- **Limit**: 42 requests per hour per IP
- **Limit**: 1000 requests per day

If you encounter rate limit errors:
1. Wait for the rate limit to reset
2. Use your own API key from https://developers.giphy.com/
3. Update `cypress.config.ts` with your key

### Network-Dependent Tests

Tests make real API calls to Giphy API:
- Require internet connection
- May be slower depending on network speed
- API responses may vary

For faster, more reliable tests, consider:
- Mocking API responses using `cy.intercept()`
- Using fixture data from `cypress/fixtures/`

---

## 🔧 Troubleshooting

### Tests Failing Due to Selectors

If tests fail because elements cannot be found:

1. **Inspect the actual application**:
   ```bash
   npm run cypress:open
   ```
   Use the Cypress Selector Playground to find correct selectors.

2. **Current selectors used in tests**:
   The tests use the following selectors matched to the actual application:
   ```typescript
   // GIF Items
   cy.get('[data-cy="gifItem"]')      // GIF image elements
   
   // Search functionality
   cy.get('input[name="searchTerm"]') // Search input field
   cy.get('button[type="submit"]')    // Search submit button
   
   // Loading states
   cy.get('.justify-center')
   ```

3. **Updating selectors**:
   If the application structure changes, update selectors in test files:
   ```typescript
   // Priority order for selectors:
   // 1. data-cy attributes (most reliable)
   // 2. data-testid attributes
   // 3. name attributes for form inputs
   // 4. type attributes for buttons
   // 5. CSS classes (least reliable)
   ```

### TypeScript Errors

If you see TypeScript compilation errors:

```bash
# Verify TypeScript installation
npx tsc --version

# Clean and reinstall
rm -rf node_modules
npm install
```

### Cypress Not Opening

If Cypress fails to open:

```bash
# Clear Cypress cache
npx cypress cache clear
npx cypress cache list

# Reinstall Cypress
npm install cypress --save-dev
```

### Video Recording Issues

If videos are not being recorded:

1. Check `cypress.config.ts` has `video: true`
2. Ensure `cypress/videos/` directory exists
3. Check disk space availability

### HTML Report Not Generating

If mochawesome reports are not being generated:

1. Verify cypress-mochawesome-reporter is installed:
   ```bash
   npm list cypress-mochawesome-reporter
   ```

2. Check `cypress.config.ts` has reporter configuration:
   ```typescript
   reporter: 'cypress-mochawesome-reporter',
   reporterOptions: {
     reportDir: 'cypress/reports',
     charts: true,
     reportPageTitle: 'Giphy App Test Report',
     embeddedScreenshots: true,
     inlineAssets: true
   }
   ```

3. Reinstall if needed:
   ```bash
   npm install --save-dev cypress-mochawesome-reporter
   ```

### Port Already in Use

If browser cannot connect:

```bash
# Check for processes using the port
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <process_id> /F
```

---

## 📚 Additional Resources

### Documentation
- **Cypress Docs**: https://docs.cypress.io/
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Giphy API Docs**: https://developers.giphy.com/docs/api/

### Custom Commands

This test suite includes custom Cypress commands in `cypress/support/commands.ts`:

```typescript
// Scroll to bottom (for infinite scroll testing)
cy.scrollToBottom();

// Check if element is in viewport
cy.get('.element').shouldBeInViewport();

// Clear all storage (localStorage, cookies, sessionStorage)
cy.clearAllStorage();

// Local storage helpers
cy.getLocalStorage('key');
cy.setLocalStorage('key', 'value');

// Wait for API calls with timeout
cy.waitForApiCall('@aliasName', 10000);
```

### Test Plan

For detailed test scenarios and manual testing steps, see:
- **[Test_Plan.docx](Test_Plan.docx)** - Comprehensive test plan with 50+ test cases

---

## 🤝 Contributing

### Adding New Tests

1. Create a new test file in `cypress/e2e/`
2. Follow the existing test structure
3. Use TypeScript for type safety
4. Add custom commands if needed
5. Update this README with new test information

### Best Practices

- ✅ Use `data-testid` attributes for reliable selectors
- ✅ Keep tests independent and isolated
- ✅ Use fixtures for test data
- ✅ Mock API responses when appropriate
- ✅ Add descriptive test names
- ✅ Group related tests in `describe` blocks
- ✅ Clean up state in `beforeEach` hooks

---

## 📝 Test Execution Summary

To run the complete test suite:

```bash
# 1. Install dependencies
npm install

# 2. Run all tests
npm test
# Or run individually:
npm run test:trending
npm run test:search

# 3. View results
# - Console output
# - HTML report: cypress/reports/html/index.html
# - Videos in cypress/videos/
# - Screenshots in cypress/screenshots/ (if failures)
```

**Expected Results**:
- ✅ Trending GIFs tests: 40+ tests covering all trending functionality
- ✅ Search GIFs tests: 45+ tests covering all search functionality
- ✅ Overall: 85+ comprehensive E2E tests

---

## 📧 Support

For questions or issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Cypress Documentation](https://docs.cypress.io/)
3. Consult the [Test Plan](Test_Plan.docx)

---

**Version**: 1.0  
**Last Updated**: March 18, 2026  
**Author**: Muhammad Islam
**Total Time Taken**: 3.5h


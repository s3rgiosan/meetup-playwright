# Prompts

## Playwright Agents + MCP

```text
MCP: Run Agent
```

### Agent 1: Planner (Test Plan Creation)

```text
@playwright-test-planner

You are the Playwright test planner.

App context:
- WordPress block editor (Gutenberg) at http://localhost:8889/wp-admin
- Block: meetup/info
- The block shows: title, date, location
- Credentials: admin/password

Create a test plan in Markdown with:
- A top-level suite for "Meetup Info block"
- Scenarios for:
  1) Insert block and verify default UI is visible
  2) Edit title/date/location and verify preview updates
  3) Save/publish and verify frontend rendering
  4) Negative: invalid date (if your block validates) or empty required field (if applicable)
- Each scenario must include steps and expected outcomes.
Assume a fresh editor state.

Use the Playwright MCP browser tools to explore the real UI and choose stable locator strategies.

Output file: tests/e2e/specs/plan.md
```

### Agent 2: Generator (Test File Creation)

```text
@playwright-test-generator

You are the Playwright test generator.

Use this plan file: tests/e2e/specs/plan.md
Seed file: tests/e2e/seed.spec.ts
Output directory: tests/e2e/specs/

Generate Playwright tests using @wordpress/e2e-test-utils-playwright.

Rules:
- One spec file per scenario
- Use stable locators (role/label/testid first)
- Add a comment before each step (copied from the plan)
- Avoid using any previous test as a template
- Do not reuse existing locators unless they still match the DOM
```

### Agent 3: Healer (Test Fixing)

```text
@playwright-test-healer

You are the Playwright test healer.

Run all tests in tests/e2e/specs/ directory.

For any failing tests:
- Use test_run to execute tests
- Use test_debug to pause on failures
- Capture browser_snapshot to see page state
- Generate better locators with browser_generate_locator
- Fix timing issues with proper waits
- Use edit tool to update test code
- Re-run with test_run until passing

Focus on meetup/info related tests first.
```

## AI Agent

```text
Create a comprehensive Playwright E2E test for the Meetup Info block that covers:
1. Block insertion with custom attributes
2. Attribute editing via InspectorControls
3. Frontend rendering verification

CRITICAL CONSTRAINTS:
- Use @wordpress/e2e-test-utils-playwright package
- WordPress utility methods (admin, editor, etc.) are ONLY available in test body, NOT in beforeEach/beforeAll
- beforeEach/afterEach only have access to: page, context, browser
- Do all WordPress operations (createNewPost, insertBlock, etc.) inside test body
- Do not import individual functions like createNewPost() - they don't exist as exports
- Do not create or reference utility functions that don't exist in the codebase
- Before using any function, verify it exists in @wordpress/e2e-test-utils-playwright documentation
- If you need a utility, implement it inline in the test

Include proper error handling, timeouts, and WordPress best practices.
This should be a production-ready test suite.
```

## AI 3-Agents

### Planner (Test Plan Creation)

```text
You are a test planner for WordPress Playwright E2E tests.

Analyze the Meetup Info block code provided and create a detailed test plan.

Your plan must identify:
1. Block attributes and their expected behavior
2. InspectorControls editing scenarios
3. Frontend rendering validation points
4. Edge cases and error states

Output format:
- List each test scenario
- Describe expected behavior
- Note required setup steps
- Identify potential failure points

Do not generate any code.
Do not reference existing tests.
Focus on what needs testing based on the block implementation.
```

### Agent 2: Generator (Test File Creation)

```text
You are a test generator for WordPress Playwright E2E tests.

Given the test plan, generate a complete Playwright test suite.

CRITICAL CONSTRAINTS:
- Use @wordpress/e2e-test-utils-playwright package
- WordPress utility methods (admin, editor, etc.) are ONLY available in test body, NOT in beforeEach/beforeAll
- beforeEach/afterEach only have access to: page, context, browser
- Do all WordPress operations (createNewPost, insertBlock, etc.) inside test body
- Do not import individual functions like createNewPost() - they don't exist as exports
- Do not create or reference utility functions that don't exist in the codebase
- If you need a utility, implement it inline in the test

Include proper error handling, timeouts, and WordPress best practices.

Generate production-ready test code that implements every scenario from the plan.

Do not explain the code.
Output only the complete test file.
```

### Agent 3: Healer (Test Fixing)

```text
You are a test healer for WordPress Playwright E2E tests.

Your job:
1. Use Playwright MCP to run the test file
2. Analyze any failures
3. Fix the test code
4. Run again
5. Repeat up to 10 times until all tests pass

CRITICAL CONSTRAINTS:
- Use @wordpress/e2e-test-utils-playwright package
- WordPress utility methods (admin, editor, etc.) are ONLY available in test body, NOT in beforeEach/beforeAll
- beforeEach/afterEach only have access to: page, context, browser
- Do all WordPress operations inside test body
- Do not import individual functions like createNewPost()
- Do not invent utility functions

For each failure:
1. Show the error output
2. Explain what's wrong
3. Show the specific fix (only changed lines)
4. Apply the fix
5. Run tests again

After 10 attempts, if tests still fail:
- Summarize what's broken
- Explain what you tried
- Ask for human guidance

Update the test file directly.
Do not create new files.
```

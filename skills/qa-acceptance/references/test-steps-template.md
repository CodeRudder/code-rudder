# Test Steps Template and Examples

## Overview

This document provides templates and examples for writing detailed, executable test steps for acceptance testing.

## CRITICAL: Business Process Chain Thinking

When writing test steps, think in terms of complete business workflows, not isolated actions. Each step is part of a chain that must be validated end-to-end.

### Business Process Chain Thinking Principles

1. **Understand the complete workflow**: What is the user trying to accomplish from start to finish?
2. **Identify sequential dependencies**: Each step often depends on previous step's success
3. **Define precise validation conditions**: For each step, specify exact conditions that must be true
4. **Consider data boundaries**: How does data change between steps? What are the exact expected values?
5. **Validate state consistency**: Database, API, and UI must all reflect the same state

### Enhanced Test Step Structure with Validation Conditions

```yaml
test_steps:
  - step: 1. <Action description>
    method: ui|api|data|manual
    details: <Specific instructions>
    validation_conditions:
      - condition: <Precise condition that MUST be true>
        expected_value: <Exact expected value, not approximate>
        how_to_verify: <How to check this condition>
    expected: <Overall expected result>
```

### Data Boundary Validation Requirements

**Always verify exact values, not approximations**:
- Exact values: "Start index must be exactly 31" (not "around 30")
- Precise counts: "Array length must be 10" (not "approximately 10")
- Sequential data: No gaps, no duplicates in sequences
- State consistency: Database = API response = UI display
- Cumulative effects: After multiple operations, verify total state

**Wrong**: "Check that more messages loaded" (too vague)
**Right**: "Verify exactly 10 messages loaded with IDs 31-40, start index decreased from 41 to 31"

## Test Step Structure

```yaml
requirement_id: <REQ-XXX-001>
title: <One-sentence description>

preconditions:
  - <Condition that must be true before testing>

test_steps:
  - step: 1. <Brief description of action>
    method: ui|api|data|manual
    details: <Specific instructions>
    expected: <Expected result>
    verification_points:
      - <Specific thing to verify>

postconditions:
  - <System state after test>
```

## Example 1: Scroll Pagination with Precise Data Checks

**User intent**: User browses messages by continuously scrolling through pages.

```yaml
requirement_id: REQ-MSG-001
title: Continuous scroll pagination for message list

preconditions:
  - Database contains exactly 50 messages
  - Page size is 10 messages per page
  - User is on last page (page 5, showing messages 41-50)

test_steps:
  - step: 1. Scroll up to load page 4
    method: ui
    details: Scroll up using browser automation
    validation_conditions:
      - condition: API endpoint called
        expected_value: GET /api/messages?before=41&limit=10
      - condition: Exact 10 messages returned
        expected_value: Response array length === 10
      - condition: Start index decreased by exactly 10
        expected_value: First message ID changed from 41 to 31
      - condition: No duplicate messages
        expected_value: All message IDs unique
      - condition: Total messages in UI
        expected_value: 20 messages visible (10 + 10)

  - step: 2. Continue scrolling to page 3
    method: ui
    details: Continue scrolling up
    validation_conditions:
      - condition: API called for page 3
        expected_value: GET /api/messages?before=31&limit=10
      - condition: Start index decreased by exactly 10
        expected_value: First message ID changed from 31 to 21
      - condition: No gaps in sequence
        expected_value: Message IDs 21-30, 31-40, 41-50 continuous
      - condition: Total messages in UI
        expected_value: 30 messages visible

  - step: 3. Scroll down back to page 4
    method: ui
    details: Scroll down
    validation_conditions:
      - condition: No duplicate loading
        expected_value: API NOT called (data already loaded)
      - condition: UI position correct
        expected_value: Page 4 messages visible

postconditions:
  - User can scroll freely through pages 3, 4, 5
  - All 30 messages visible, no duplicates or gaps
```

## Example 2: User Login (UI + API Combined)

**IMPORTANT**: Use browser automation tools, not just console log checking.

```yaml
requirement_id: REQ-LOGIN-001
title: User can login with valid credentials

preconditions:
  - User account exists with email: test@example.com
  - Application is running at http://localhost:3000

test_steps:
  - step: 1. Navigate to login page
    method: ui
    details: Navigate to /login
    validation_conditions:
      - condition: URL is correct
        expected_value: URL contains '/login'
      - condition: Required elements exist
        expected_value: Email input, password input, submit button all visible
      - condition: No error messages
        expected_value: Error count === 0

  - step: 2. Enter credentials and submit
    method: ui
    details: Fill email and password, click submit
    validation_conditions:
      - condition: Input values correct
        expected_value: Email field shows 'test@example.com'
      - condition: Password masked
        expected_value: Password field type is 'password'
      - condition: Loading state shown
        expected_value: Loading indicator visible after submit

  - step: 3. Verify login API
    method: api
    details: POST /api/auth/login
    validation_conditions:
      - condition: Response status
        expected_value: 200 OK
      - condition: Token present
        expected_value: Response contains valid JWT
      - condition: User data correct
        expected_value: Email matches request

  - step: 4. Verify UI state after login
    method: ui
    details: Check page state
    validation_conditions:
      - condition: URL changed
        expected_value: URL is /dashboard
      - condition: User authenticated
        expected_value: User name displayed, logout button visible

postconditions:
  - User authenticated, token stored
  - Protected routes accessible
```

## Common Scenarios

### API CRUD Operations
Test create, read, update, delete in sequence:
1. **Create**: POST → verify 201, ID returned, database record exists
2. **Read**: GET → verify 200, all fields correct, no sensitive data
3. **Update**: PUT/PATCH → verify 200, fields updated, timestamps changed
4. **Delete**: DELETE → verify 204, GET returns 404, database removed

### Form Validation
1. **Empty submission**: Submit without data → required field errors display
2. **Invalid data**: Malformed input → format validation errors
3. **Valid data**: Correct input → errors clear, form submits

### Error Handling
1. **401 Unauthorized**: No auth → verify status and error message
2. **403 Forbidden**: Insufficient permissions → verify permission error
3. **404 Not Found**: Non-existent resource → verify not found error
4. **400 Bad Request**: Malformed data → verify validation error

### Data Verification
Use only when API/UI show inconsistencies:
1. **UI update**: Change data → verify success message and UI reflects change
2. **API verification**: Monitor request → verify payload and response
3. **Persistence**: Refresh page → verify data persists
4. **Database check**: Query database → verify actual storage

## Business Correlation Validation

When testing features, reason about business logic and identify related areas:

### Example: Theme Switching
- **Infer impact**: All components (navigation, modals, forms, tables, messages)
- **Add checkpoints**: Check contrast, brand colors, theme consistency across all pages
- **Traverse systematically**: Navigate all routes to verify consistency

### Example: Pagination Size Change
- **Infer impact**: API parameters, response data, UI rendering, pagination controls
- **Add checkpoints**: Verify exact item count, total pages recalculated, no duplicates
- **Check boundaries**: What happens at page boundaries with odd numbers

## User Intent Identification

When users report bugs, they often describe symptoms without complete steps. Analyze the report, understand the implicit intent.

### Example: "Scrolling up doesn't load previous page"

**Surface intent** (literal): Load page when scrolling up
**Real intent** (actual need): Continuous bidirectional scrolling through all pages

**AI should reason**:
1. **Data requirements**: Need 5+ pages to test continuous scrolling
2. **Usage scenario**: User browses messages by scrolling back and forth
3. **Test continuous operations**: Not just one scroll, but page 5→4→3→2→1→2→3→4→5

**Pitfalls to avoid**:
- ❌ Testing with only 1 page (can't trigger scroll)
- ❌ Testing one-time scroll (misses continuous requirement)
- ❌ Only checking logs (doesn't prove UI works)
- ❌ Assuming success from logs (must perform actual testing)

## Writing Guidelines

**CRITICAL: Logs Are Not Sufficient**

- ✗ Cannot judge success based only on logs
- ✓ Must use browser automation (Playwright) for UI testing
- ✓ Must verify actual API responses, not just log messages
- ✓ Must query database to confirm data changes
- ✓ Must take screenshots for visual evidence

**Make Steps Atomic**: Each step tests one specific action

**Be Specific**: Provide exact values, endpoints, expected responses
- Bad: "Send API request"
- Good: "POST /api/users with body: {email: 'test@example.com'}"

**Clear Verification Points**: List specific things to check
- Bad: "Check if it works"
- Good: "Status is 200, response contains user ID, database record exists"

**Use Appropriate Methods**:
- `ui`: User interface interactions
- `api`: Backend API calls
- `data`: Database verification (only when API/UI show inconsistencies)
- `manual`: Human verification

**Document Pre/Postconditions**: State what must be true before and after testing.

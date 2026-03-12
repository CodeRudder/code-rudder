# UI Validation Guide

## Overview

This guide provides rules and checklists for validating web UI during acceptance testing. Use this for any test step with `method: ui`.

## CRITICAL: Console Logs Are Not Sufficient

**Common mistake**: Checking console logs and assuming UI is working correctly.

**Why this is wrong**:
- ✗ Console shows no errors → UI might still be broken (CSS issues, rendering problems, wrong content)
- ✗ Console shows success logs → UI might not have updated (stale data, caching issues)
- ✗ API returns success → UI might not reflect the changes (state management issues)
- ✗ Logs show "operation completed" → Doesn't prove UI displays correct results

**REQUIRED: Complete Manual or Integration Testing**

Validation MUST go through complete manual or integration testing:
- ✓ **Manual testing**: Physically interact with the application, verify visual results with your eyes
- ✓ **Integration testing**: Use browser automation tools to verify end-to-end user flows
- ✓ **Cannot rely solely on logs**: Logs are supplementary evidence, not primary validation

**Correct approach**: Use browser automation tools (Playwright, Puppeteer, Selenium) to:
- ✓ Actually navigate to the page
- ✓ Verify elements exist and are visible
- ✓ Check element content matches expected values
- ✓ Interact with elements (click, type, scroll)
- ✓ Verify UI state changes after actions
- ✓ Take screenshots for visual verification

**Example of insufficient validation**:
```yaml
# BAD: Only checking console
- step: 1. Update user profile
  method: ui
  verification_points:
    - No console errors  # ✗ Not enough!
```

**Example of proper validation**:
```yaml
# GOOD: Actually verify UI with browser automation
- step: 1. Update user profile
  method: ui
  verification_points:
    - Navigate to /profile using Playwright
    - Verify name field contains "John Doe"
    - Click edit button
    - Type "Jane Doe" in name field
    - Click save button
    - Verify name field now shows "Jane Doe"
    - Verify success message displays
    - Take screenshot for evidence
```

## Validation Layers

UI validation should be performed in the following order:

### Layer 1: Page Load Validation

**Checklist**:
```
□ Page loads without errors
□ URL matches expected pattern
□ Page title is correct
□ No JavaScript errors in console
□ No network errors (failed requests)
□ Page renders within acceptable time (< 3 seconds)
□ All critical resources loaded (CSS, JS, images)
```

### Layer 2: Element Existence Validation

**Checklist**:
```
□ All required elements exist in DOM
□ Elements in correct positions
□ Layout matches design/mockup
□ No overlapping or clipped elements
□ Responsive layout works at different screen sizes
□ All images and icons displayed correctly
```

### Layer 3: Element State Validation

**Checklist**:
```
□ Elements are visible/hidden as expected
□ Elements are enabled/disabled correctly
□ Input fields have correct default values
□ Checkboxes/radios have correct checked state
□ Dropdowns have correct selected option
□ Form validation states are correct
□ Loading and error states display correctly
```

### Layer 4: Element Content Validation

**Checklist**:
```
□ Text content matches expected
□ Numbers, dates, currency formatted correctly
□ Links have correct text and href
□ Images have correct alt text
□ Tooltips and placeholders are correct
□ Labels are associated with inputs
```

### Layer 5: Interaction Validation

**Checklist**:
```
□ Click events trigger correctly
□ Input fields accept text entry
□ Form submission works
□ Keyboard navigation works (Tab, Enter, Escape)
□ Tab order is logical
□ Hover and focus states display correctly
```

### Layer 6: Navigation Validation

**Checklist**:
```
□ Links navigate to correct pages
□ Browser back/forward buttons work
□ URL updates correctly (for SPAs)
□ Page state preserved on navigation
□ Redirects work as expected
```

### Layer 7: Data Display Validation

**Checklist**:
```
□ Data loads from API correctly
□ Loading states show while fetching
□ Data displays in correct format
□ Empty states show when no data
□ Error states show on fetch failure
□ Pagination, sorting, filtering work correctly
```

### Layer 8: Form Validation

**Checklist**:
```
□ Required field validation works
□ Email, password, number, date validation works
□ Custom validation rules work
□ Validation messages display correctly
□ Validation triggers at correct time (blur, change, submit)
□ Form cannot submit with invalid data
```

### Layer 9: Visual Quality & Accessibility Validation

**Checklist**:
```
□ Page content renders completely (no missing sections)
□ Scroll position correct after navigation/actions
□ Font sizes are readable (minimum 14px for body text)
□ Text contrast meets readability standards (WCAG AA: 4.5:1 for normal text)
□ Background color + text color combinations are clear and readable
□ Colors match theme/brand guidelines
□ Typography (font family, weight, line height) matches design system
□ Spacing and padding consistent with theme
□ Icons and images match theme style
□ Dark mode/light mode themes work correctly (if applicable)
```

**Visual Quality Examples**:
- **Good contrast**: Dark text (#333) on light background (#FFF) = 12.6:1 ratio
- **Poor contrast**: Light gray text (#AAA) on white background (#FFF) = 2.3:1 ratio (fails WCAG)
- **Font size**: Body text 16px, small text 14px minimum, headings 24px+
- **Scroll position**: After form submission, page scrolls to success message
- **Theme consistency**: Primary color used for all CTAs, secondary for links

## Complete Example: Form Submission

```yaml
requirement_id: REQ-LOGIN-001
title: User login form submission

test_steps:
  - step: 1. Navigate to login page
    method: ui
    details: Open /login
    expected: Login form displays
    verification_points:
      - Email field exists
      - Password field exists
      - Submit button exists

  - step: 2. Enter credentials
    method: ui
    details: |
      Email: test@example.com
      Password: Test123!
    expected: Fields show entered values
    verification_points:
      - Email field shows "test@example.com"
      - Password field shows masked characters

  - step: 3. Click submit button
    method: ui
    details: Click "Sign In" button
    expected: Form submits, loading state shows
    verification_points:
      - Button shows loading spinner
      - Button is disabled during submission
      - Form fields are disabled

  - step: 4. Verify success state
    method: ui
    details: Wait for response
    expected: User redirected to dashboard
    verification_points:
      - URL changes to /dashboard
      - Dashboard page loads
      - User name displays in header
      - No error messages shown
```

## Other Common Scenarios

### Data Table Display
1. Navigate to page with data table
2. Verify loading state shows
3. Verify data loads and displays correctly
4. Test pagination (next/previous buttons, page indicators)
5. Test sorting (click column headers, verify order)
6. Test filtering/search (enter criteria, verify results)

### Modal Dialog
1. Trigger modal open (click button/link)
2. Verify modal displays (overlay, centered dialog, dimmed background)
3. Verify modal content (title, message, buttons)
4. Test modal interactions (form inputs, buttons)
5. Test modal close (cancel button, X button, escape key, overlay click)
6. Verify cleanup (modal disappears, scroll re-enabled, background normal)

### Form Validation
1. Leave required field empty and submit
2. Verify error message displays
3. Enter invalid data (wrong format)
4. Verify format error message displays
5. Enter valid data
6. Verify error message disappears, field shows valid state

## Browser Testing

### Using Playwright

**Navigation**:
```javascript
await page.goto('http://localhost:3000/login');
await page.waitForLoadState('networkidle');
```

**Element Selection**:
```javascript
const emailInput = page.locator('input[name="email"]');
const submitButton = page.locator('button[type="submit"]');
```

**Interactions**:
```javascript
await emailInput.fill('test@example.com');
await submitButton.click();
await page.keyboard.press('Enter');
```

**Assertions**:
```javascript
await expect(heading).toHaveText('Dashboard');
await expect(emailInput).toBeVisible();
await expect(submitButton).toBeEnabled();
```

### Manual Testing Checklist

```
□ Test in multiple browsers (Chrome, Firefox, Safari)
□ Test at different screen sizes (mobile, tablet, desktop)
□ Test with keyboard only (no mouse)
□ Test with screen reader (accessibility)
□ Test with slow network (throttling)
□ Test in incognito/private mode
```

## Accessibility Validation

**Checklist**:
```
□ All interactive elements are keyboard accessible
□ Tab order is logical
□ Focus indicators are visible
□ Form labels are associated with inputs
□ Images have alt text
□ Color contrast meets WCAG standards
□ Screen reader announces content correctly
□ ARIA attributes used correctly
□ No keyboard traps
```

## Common UI Issues

- **Layout**: Elements overlapping, text overflow, misalignment, responsive breakpoints not working
- **Interaction**: Buttons not clickable, forms not submitting, validation not triggering, keyboard navigation broken
- **Display**: Images not loading, incorrect data, loading states stuck, error messages not showing
- **Navigation**: Links going to wrong pages, back button not working, redirects failing, URL not updating

## Best Practices

1. Test in realistic conditions with real data
2. Test edge cases: empty states, long text, special characters
3. Test error scenarios: network failures, invalid data, timeouts
4. Document with screenshots
5. Test across devices and browsers
6. Test accessibility
7. Retest after fixes

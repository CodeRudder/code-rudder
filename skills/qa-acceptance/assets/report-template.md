# Acceptance Test Report

**Project**: <project-name>
**Version**: <version-number>
**Test Round**: <round-number>
**Date**: <YYYY-MM-DD>
**Tester**: <tester-name>

---

## Executive Summary

- **Total Requirements**: <total>
- **Passed**: <passed> (<percentage>%)
- **Failed**: <failed> (<percentage>%)
- **Blocked**: <blocked> (<percentage>%)
- **Pending**: <pending> (<percentage>%)

**Overall Status**: ✅ Ready for Release | ⚠️ Needs Attention | ❌ Not Ready

---

## Test Results by Module

### Module: <module-name>

| ID | Title | Priority | Status | Notes |
|----|-------|----------|--------|-------|
| REQ-XXX-001 | <title> | P0 | ✅ Passed | - |
| REQ-XXX-002 | <title> | P1 | ❌ Failed | <failure reason> |
| REQ-XXX-003 | <title> | P2 | ⏸️ Blocked | Depends on REQ-XXX-001 |

**Module Summary**:
- Passed: X/Y (<percentage>%)
- Critical Issues: <count>

---

## Detailed Step-by-Step Validation Results

**MANDATORY**: For each requirement, report validation results for ALL test steps.

### REQ-XXX-001: <requirement title>

**Overall Status**: ✅ Passed | ❌ Failed | ⚠️ Partial Pass

#### Test Steps Execution:

**Step 1: <step description>**
- **Status**: ✅ Passed | ❌ Failed
- **Validation Conditions**:
  - ✓ <condition 1>: <actual result> (Expected: <expected value>)
  - ✓ <condition 2>: <actual result> (Expected: <expected value>)
  - ✗ <condition 3>: <actual result> (Expected: <expected value>) - **FAILED**
- **Evidence**: `<evidence-file-path>`
- **Notes**: <any observations>

**Step 2: <step description>**
- **Status**: ✅ Passed
- **Validation Conditions**:
  - ✓ API called with correct parameters: `GET /api/data?limit=10`
  - ✓ Response contains exactly 10 items: Found 10 items
  - ✓ Start index decreased by 10: Changed from 50 to 40
  - ✓ No duplicate IDs: All 10 IDs are unique
- **Evidence**: `screenshots/step2-api-response.png`

**Step 3: <step description>**
- **Status**: ❌ Failed
- **Validation Conditions**:
  - ✓ Database query executed: Found in logs
  - ✗ Exact 10 records saved: Only 7 records saved - **FAILED**
  - ✗ All columns updated: Column 'status' not updated - **FAILED**
- **Actual Result**: 7 of 10 records saved, 'status' column unchanged
- **Expected Result**: Exactly 10 records saved, all columns updated
- **Evidence**: `logs/db-query.log`, `screenshots/step3-failure.png`

**Step Overall**: ❌ Failed (Step 3 failed validation conditions)

---

### REQ-XXX-002: <requirement title>

**Overall Status**: ✅ Passed

#### Test Steps Execution:

**Step 1: <step description>**
- **Status**: ✅ Passed
- **Validation Conditions**:
  - ✓ All conditions met
- **Evidence**: `<evidence>`

**(Continue for all test steps...)**

---

## Failed Requirements Detail

### REQ-XXX-002: <title>

**Priority**: P1
**Test Method**: API
**Failure Reason**: <detailed description>

**Steps to Reproduce**:
1. <step 1>
2. <step 2>
3. <step 3>

**Expected Result**:
<what should happen>

**Actual Result**:
<what actually happened>

**Evidence**:
- Screenshot: <path/to/screenshot.png>
- Logs: <relevant log entries>
- API Response: <response data>

**Web UI Evidence** (if applicable):
- **HTML Snippet**:
  ```html
  <div class="error-container">
    <span class="error-message">Error text</span>
  </div>
  ```
- **CSS Issues**:
  ```css
  .element {
    /* Problematic styles */
    z-index: -1; /* Element hidden behind others */
  }
  ```
- **Console Errors**:
  ```
  Uncaught TypeError: Cannot read property 'value' of null
    at handleSubmit (app.js:123)
  ```
- **Network Errors**:
  ```
  POST /api/login - 500 Internal Server Error
  Response: {"error": "Database connection failed"}
  ```
- **API Error Details**:
  ```json
  {
    "status": 400,
    "error": "Validation failed",
    "details": {
      "email": "Invalid email format"
    }
  }
  ```
- **Browser Info**: Chrome 120.0.6099.109, macOS 14.2
- **Viewport Size**: 1920x1080

**Impact**:
<business impact description>

**Suggested Fix**:
<recommendation for developers>

---

## Blocked Requirements

### REQ-XXX-003: <title>

**Priority**: P2
**Blocked By**: REQ-XXX-001
**Reason**: Cannot test until login functionality is fixed

---

## Critical Issues (P0)

1. **REQ-XXX-001**: <title>
   - Status: ❌ Failed
   - Impact: Blocks user login
   - Action: Must fix before release

2. **BUG-XXX-005**: <title>
   - Status: ❌ Failed
   - Impact: Data loss risk
   - Action: Critical fix required

---

## Recommendations

### For Next Round

1. **Priority Fixes**:
   - Fix REQ-XXX-001: <description>
   - Fix BUG-XXX-005: <description>

2. **Retest Items**:
   - All login-dependent features after REQ-XXX-001 is fixed
   - All blocked requirements

3. **Additional Testing**:
   - Add integration tests for user flow
   - Add edge case tests for payment module

### Risk Assessment

**High Risk**:
- <risk description and mitigation>

**Medium Risk**:
- <risk description and mitigation>

**Low Risk**:
- <risk description and mitigation>

---

## Test Environment

- **Application URL**: <url>
- **Database**: <database info>
- **Browser**: <browser and version>
- **OS**: <operating system>
- **Test Data**: <test data source>

---

## Appendix

### Test Execution Timeline

| Time | Activity | Duration |
|------|----------|----------|
| 10:00 | Started testing Login module | 30 min |
| 10:30 | Started testing User module | 45 min |
| 11:15 | Break | 15 min |
| 11:30 | Bug verification | 60 min |

### Screenshots

1. REQ-XXX-002 Failure: `screenshots/req-xxx-002-failure.png`
2. BUG-XXX-001 Fixed: `screenshots/bug-xxx-001-fixed.png`

### Logs

```
[2025-01-15 10:23:45] ERROR: Authentication failed for user@example.com
[2025-01-15 10:23:45] Stack trace: ...
```

---

**Report Generated**: <timestamp>
**Next Test Round**: <date>

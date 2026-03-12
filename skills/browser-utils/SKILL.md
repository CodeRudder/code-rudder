---
name: browser-utils
description: Reusable browser automation utilities for Playwright operations. Use when working with web pages and needing to perform common browser operations like form filling, element inspection, clicking sequences, waiting for elements, or extracting element information. Provides 10 tested utility functions that reduce context usage and improve reliability compared to custom runCode or evaluate calls. Use for any task involving browser automation, web testing, or UI verification.
---

# Browser Utils

## Overview

Reusable browser automation utilities for efficient Playwright operations. Provides 10 tested utility functions for common browser tasks, reducing the need for custom `runCode` or `evaluate` calls.

**Benefits:**
- Consistent, tested implementations
- Better error handling
- Reduced context usage
- Easier maintenance
- Return actual DOM values for verification

## Quick Start

Use `mcp__playwright__browser_run_script_file` with the browser-utils.js wrapper:

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/browser-utils/scripts/browser-utils.js",
  params: {
    action: "actionName",
    // ... action-specific parameters
  }
})
```

## Available Functions

### 1. findElement
Find single element and get detailed info (tagName, id, className, text, visible).

**Use when:** Need to locate and inspect a single element

### 2. findElements
Find multiple elements matching a selector.

**Use when:** Need to find all elements matching a pattern

### 3. getElementPositions
Get positions and dimensions of multiple elements.

**Use when:** Verifying layout, checking element positioning

### 4. getFormValues
Extract current values from form fields.

**Use when:** Need to read form state before/after operations

### 5. fillForm
Fill multiple form fields and verify actual DOM values.

**Use when:** Filling forms and need to verify values were set correctly

**Returns:** expectedValue, actualValue, and matched flag for each field

### 6. clickSequence
Click elements in sequence with optional delays.

**Use when:** Need to perform multiple clicks in order (navigation, multi-step forms)

### 7. getElementHierarchy
Get parent/child hierarchy of elements.

**Use when:** Understanding DOM structure, debugging layout issues

### 8. waitForElements
Wait for elements to become visible with timeout.

**Use when:** Dealing with dynamic content, async loading

### 9. checkElementsExist
Check element existence and get metadata (tagName, id, className, text, visible).

**Use when:** Verifying page structure, checking if elements are present

### 10. getComputedStyles
Get computed CSS styles for elements.

**Use when:** Verifying styling, checking visual properties

## Documentation

See [references/browser-utils-guide.md](references/browser-utils-guide.md) for:
- Detailed usage examples for each function
- Parameter specifications
- Return value formats
- Best practices

## Implementation

- **Wrapper**: [scripts/browser-utils.js](scripts/browser-utils.js) - Dispatcher for runScriptFile
- **Core**: [scripts/utils/browser-utils-core.js](scripts/utils/browser-utils-core.js) - Function implementations
- **Tests**: [tests/browser-utils-core.test.js](tests/browser-utils-core.test.js) - Unit tests

## When to Use

**✅ Use browser-utils when:**
- Filling forms and verifying values
- Checking element existence or visibility
- Getting element positions/dimensions
- Performing click sequences
- Extracting form values
- Waiting for dynamic content
- Any repetitive browser operation

**❌ Don't use browser-utils when:**
- Need highly custom, one-off operations
- The operation is simpler than calling the utility
- Need to execute complex page-specific logic

## Integration with Other Skills

This skill can be used independently or as a dependency for other skills:
- **pen-to-code**: Uses browser-utils for UI verification
- **web testing**: Can use browser-utils for test automation
- **Any skill**: That needs browser automation capabilities

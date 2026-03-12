# Layout Alignment Verification Scripts

This directory contains modular scripts for verifying UI component alignment according to design specifications.

## Available Scripts

### 1. extract-and-verify.js (Recommended)
**Extracts coordinates and verifies alignment in one call.**

Compatible with `browser_run_script_file` MCP tool. Combines coordinate extraction and alignment verification to reduce MCP tool calls.

**Usage:**
```javascript
{
  "name": "mcp__playwright__browser_run_script_file",
  "arguments": {
    "filePath": "./.claude/skills/pen-to-code/scripts/extract-and-verify.js",
    "params": {
      "selectors": {
        "saveButton": "#save-btn",
        "cancelButton": "#cancel-btn",
        "searchInput": "#search-input"
      },
      "expectedAlignments": {
        "rows": [["saveButton", "cancelButton"]],
        "columns": []
      },
      "waitForSelector": ".main-content",
      "timeout": 5000,
      "threshold": 80
    }
  }
}
```

**Returns:**
```json
{
  "success": true,
  "allPassed": true,
  "coordinates": {
    "saveButton": { "x": 100, "y": 200, "width": 80, "height": 32 },
    "cancelButton": { "x": 200, "y": 202, "width": 80, "height": 32 }
  },
  "verification": {
    "summary": {
      "total": 1,
      "passed": 1,
      "failed": 0,
      "threshold": 80
    },
    "rows": [...],
    "columns": [...]
  }
}
```

**Benefits:**
- ✅ Single MCP call for both extraction and verification
- ✅ Reduced latency and improved performance
- ✅ Automatic validation of extracted coordinates
- ✅ Immediate feedback on alignment issues

### 2. extract-coordinates.js
**Extracts component coordinates from the current page.**

Compatible with `browser_run_script_file` MCP tool. Accepts selectors as parameters and returns coordinates for each component.

**Usage:**
```javascript
{
  "name": "mcp__playwright__browser_run_script_file",
  "arguments": {
    "filePath": "./.claude/skills/pen-to-code/scripts/extract-coordinates.js",
    "params": {
      "selectors": {
        "saveButton": "#save-btn",
        "cancelButton": "#cancel-btn",
        "searchInput": "#search-input"
      },
      "waitForSelector": ".main-content",
      "timeout": 5000
    }
  }
}
```

**Returns:**
```json
{
  "success": true,
  "coordinates": {
    "saveButton": { "x": 100, "y": 200, "width": 80, "height": 32 },
    "cancelButton": { "x": 200, "y": 202, "width": 80, "height": 32 }
  },
  "summary": {
    "total": 3,
    "extracted": 2,
    "missing": 1
  }
}
```

### 2. check-alignment.js
**Verifies component alignment and ordering.**

Compatible with `browser_run_script_file` MCP tool. Checks row/column alignment and left-to-right/top-to-bottom ordering.

**Usage:**
```javascript
{
  "name": "mcp__playwright__browser_run_script_file",
  "arguments": {
    "filePath": "./.claude/skills/pen-to-code/scripts/check-alignment.js",
    "params": {
      "components": {
        "saveButton": { "x": 100, "y": 200, "width": 80, "height": 32 },
        "cancelButton": { "x": 200, "y": 202, "width": 80, "height": 32 }
      },
      "expectedAlignments": {
        "rows": [["saveButton", "cancelButton"]],
        "columns": []
      },
      "threshold": 80
    }
  }
}
```

**Returns:**
```json
{
  "success": true,
  "allPassed": true,
  "summary": {
    "total": 1,
    "passed": 1,
    "failed": 0,
    "threshold": 80
  },
  "rows": [...],
  "columns": [...]
}
```

### 3. utils/alignment-helpers.js
**Helper module with alignment calculation functions.**

Provides reusable functions for:
- `calculateOverlap()` - Calculate overlap percentage between ranges
- `checkRowAlignment()` - Check Y-axis alignment for rows
- `checkColumnAlignment()` - Check X-axis alignment for columns
- `checkOrdering()` - Check left-to-right or top-to-bottom ordering
- `validateComponent()` - Validate component coordinates

## Workflow

**Recommended workflow using extract-and-verify.js (Most Efficient):**

### Steps:

1. **Execute business workflow** using Playwright MCP tools:
   - Navigate to page, perform actions, wait for data to load
   - Verify page state with `browser_snapshot()`
   - Benefits: Interactive debugging, immediate feedback, no timeouts

2. **Extract and verify in one call** using `extract-and-verify.js`:
   - Use `mcp__playwright__browser_run_script_file` with `extract-and-verify.js`
   - Pass selectors and expected alignments as parameters
   - Returns both coordinates and verification results in one call
   - **Benefits**: Single MCP call, reduced latency, immediate feedback

3. **Review verification report** and fix any mismatches
   - If verification passes: Implementation complete ✅
   - If verification fails: Fix HTML/CSS and repeat from Step 2

**Benefits of this approach:**
- ✅ Most efficient - single MCP call for both extraction and verification
- ✅ Reduced latency and improved performance
- ✅ Modular and reusable scripts
- ✅ Parameter-based configuration
- ✅ Works in current browser context
- ✅ Interactive and immediate feedback
- ✅ Can verify immediately after changes
- ✅ No external script configuration needed

**Alternative workflow using separate scripts:**

### Steps:

1. **Execute business workflow** using Playwright MCP tools:
   - Navigate to page, perform actions, wait for data to load
   - Verify page state with `browser_snapshot()`
   - Benefits: Interactive debugging, immediate feedback, no timeouts

2. **Extract coordinates** using `extract-coordinates.js`:
   - Use `mcp__playwright__browser_run_script_file` with `extract-coordinates.js`
   - Pass selectors as parameters (use PRECISE selectors: IDs, data attributes)
   - Returns coordinates object with x, y, width, height for each component

3. **Verify alignment** using `check-alignment.js`:
   - Use `mcp__playwright__browser_run_script_file` with `check-alignment.js`
   - Pass extracted coordinates and expected alignments
   - Returns verification results with pass/fail status

4. **Review verification report** and fix any mismatches
   - If verification passes: Implementation complete ✅
   - If verification fails: Fix HTML/CSS and repeat workflow

**Benefits of this approach:**
- ✅ Modular and reusable scripts
- ✅ Parameter-based configuration
- ✅ Works in current browser context
- ✅ Interactive and immediate feedback
- ✅ Can verify immediately after changes
- ✅ No external script configuration needed

**Alternative workflow (inline browser_run_code):**

1. **Execute business workflow** using Playwright MCP tools
2. **Extract coordinates** using `browser_run_code` (inline code)
3. **Verify alignment** using inline code or save to JSON for later analysis

See SKILL.md for inline browser_run_code examples.

**Alternative workflow (e2e test):**

1. Write Playwright test with business operations (login, navigate, load data)
2. Use `get-coordinates-helper.js` to extract coordinates after operations
3. Use `check-alignment.js` script to verify alignment
4. Save results to `ai-docs/ui-validation/{page-name}-alignment-check.json` for documentation

See `example-alignment-check.spec.js` for complete example.

**Note**: The runScriptFile workflow is recommended for better code organization and reusability.

## Legacy Scripts

### get-coordinates-helper.js
**Helper for extracting coordinates in Playwright tests.**

This is a legacy helper that can be used in e2e tests. For new implementations, prefer using `extract-coordinates.js` or `extract-and-verify.js` with `browser_run_script_file`.

### example-alignment-check.spec.js
**Example Playwright test showing coordinate extraction workflow.**

This example demonstrates the e2e test approach. For interactive development, prefer the runScriptFile workflow with `extract-and-verify.js`.

## Alignment Rules

#### Row Alignment
Components on the same row must satisfy:
- **Y-axis overlap >80%**: Vertical positions overlap significantly
- **X-axis no intersection**: Horizontal positions don't overlap (side by side)
- **Left-to-right order**: Components must be ordered left to right

#### Column Alignment
Components in the same column must satisfy:
- **X-axis overlap >80%**: Horizontal positions overlap significantly
- **Y-axis no intersection**: Vertical positions don't overlap (stacked vertically)
- **Top-to-bottom order**: Components must be ordered top to bottom

### Output

The script generates a report showing:
- Component coordinates (JSON)
- Total checks performed
- Number of passed/failed checks
- Detailed results for each component pair
- Order verification results

Exit codes:
- `0`: All checks passed
- `1`: Some checks failed
- `2`: Error occurred

### Examples

See the `tests/` directory for complete examples:
- **Mock testing (pass)**: `../tests/test-pass-coordinates.json` (with components)
- **Mock testing (fail)**: `../tests/test-fail-coordinates.json` (with misaligned components)
- **Complex layout test**: `../tests/test-page.html` with `../tests/test-helper.spec.js`

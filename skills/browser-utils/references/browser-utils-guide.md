# Browser Utilities Guide

Common browser operations for efficient page interaction and element inspection.

## Usage

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "actionName",
    // ... action-specific parameters
  }
})
```

## Available Actions

### 1. findElement

Find and get detailed information about a single element.

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "findElement",
    selector: "#search-btn"
  }
})
```

**Returns**:
```javascript
{
  found: true,
  selector: "#search-btn",
  tagName: "button",
  text: "Search",
  box: { x: 100, y: 200, width: 80, height: 40 },
  attributes: { id: "search-btn", class: "btn primary" }
}
```

### 2. findElements

Find multiple elements at once.

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "findElements",
    selectors: {
      searchBtn: "#search-btn",
      clearBtn: "#clear-btn",
      resultTable: ".result-table"
    }
  }
})
```

**Returns**: Map of element information for each selector.

### 3. getElementPositions

Get positions and dimensions of multiple elements (for layout verification).

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "getElementPositions",
    selectors: {
      header: "#header",
      toolbar: "#toolbar",
      content: "#main-content"
    }
  }
})
```

**Returns**:
```javascript
{
  header: { x: 0, y: 0, width: 1200, height: 64 },
  toolbar: { x: 0, y: 64, width: 1200, height: 56 },
  content: { x: 0, y: 120, width: 1200, height: 600 }
}
```

### 4. getFormValues

Get values from multiple form elements.

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "getFormValues",
    selectors: {
      searchInput: "#search-input",
      filterCheckbox: "#filter-active",
      sortSelect: "#sort-by"
    }
  }
})
```

**Returns**:
```javascript
{
  searchInput: "test query",
  filterCheckbox: true,
  sortSelect: "date"
}
```

### 5. fillForm

Fill multiple form fields at once.

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "fillForm",
    fields: [
      { selector: "#username", value: "testuser", type: "text" },
      { selector: "#password", value: "pass123", type: "text" },
      { selector: "#remember", value: true, type: "checkbox" },
      { selector: "#role", value: "admin", type: "select" }
    ]
  }
})
```

**Returns**:
```javascript
{
  results: [
    {
      selector: "#username",
      success: true,
      expectedValue: "testuser",
      actualValue: "testuser",
      matched: true
    },
    {
      selector: "#password",
      success: true,
      expectedValue: "pass123",
      actualValue: "pass123",
      matched: true
    },
    {
      selector: "#remember",
      success: true,
      expectedValue: true,
      actualValue: true,
      matched: true
    },
    {
      selector: "#role",
      success: true,
      expectedValue: "admin",
      actualValue: "admin",
      matched: true
    }
  ]
}
```

**Note**: Each result includes:
- `success`: Whether the fill operation succeeded
- `expectedValue`: The value you tried to set
- `actualValue`: The actual value read back from DOM
- `matched`: Whether expectedValue matches actualValue

### 6. clickSequence

Click multiple elements in sequence with optional delays.

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "clickSequence",
    selectors: ["#open-modal", "#confirm-btn", "#close-btn"],
    waitBetween: 500  // Wait 500ms between clicks
  }
})
```

**Returns**:
```javascript
{
  results: [
    { selector: "#open-modal", success: true },
    { selector: "#confirm-btn", success: true },
    { selector: "#close-btn", success: true }
  ]
}
```

### 7. getElementHierarchy

Get parent or child hierarchy of an element.

**Get Parents**:
```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "getElementHierarchy",
    selector: "#search-btn",
    direction: "parents",
    levels: 3
  }
})
```

**Returns**:
```javascript
{
  found: true,
  selector: "#search-btn",
  direction: "parents",
  parents: [
    { tagName: "div", id: "search-bar", className: "toolbar" },
    { tagName: "div", id: "main-content", className: "content" },
    { tagName: "div", id: "app", className: "app-container" }
  ]
}
```

**Get Children**:
```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "getElementHierarchy",
    selector: "#toolbar",
    direction: "children",
    levels: 2
  }
})
```

### 8. waitForElements

Wait for multiple elements to become visible.

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "waitForElements",
    selectors: [".result-table", ".pagination", ".status-bar"],
    timeout: 5000
  }
})
```

**Returns**:
```javascript
{
  results: [
    { selector: ".result-table", visible: true },
    { selector: ".pagination", visible: true },
    { selector: ".status-bar", visible: false, error: "Timeout" }
  ]
}
```

### 9. checkElementsExist

Check if elements exist on the page (without waiting).

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "checkElementsExist",
    selectors: {
      header: "#header",
      sidebar: "#sidebar",
      footer: "#footer"
    }
  }
})
```

**Returns**:
```javascript
{
  header: {
    exists: true,
    tagName: "header",
    id: "header",
    className: "app-header sticky",
    text: "My Application",
    visible: true
  },
  sidebar: {
    exists: false
  },
  footer: {
    exists: true,
    tagName: "footer",
    id: "footer",
    className: "app-footer",
    text: "© 2024 Company Name",
    visible: true
  }
}
```

**Note**: For existing elements, returns:
- `exists`: true/false
- `tagName`: Element tag name (e.g., "div", "button", "input")
- `id`: Element ID attribute
- `className`: Element class attribute
- `text`: First 50 characters of text content
- `visible`: Whether element is visible on page

### 10. getComputedStyles

Get computed CSS styles for elements.

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "getComputedStyles",
    selectors: {
      header: "#header",
      button: "#search-btn"
    },
    properties: ["width", "height", "display", "background-color", "font-size"]
  }
})
```

**Returns**:
```javascript
{
  header: {
    width: "1200px",
    height: "64px",
    display: "flex",
    "background-color": "rgb(255, 255, 255)",
    "font-size": "14px"
  },
  button: {
    width: "80px",
    height: "40px",
    display: "inline-block",
    "background-color": "rgb(59, 130, 246)",
    "font-size": "14px"
  }
}
```

## Common Use Cases

### Use Case 1: Verify Page Layout

```javascript
// 1. Get positions of all major regions
const positions = await mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "getElementPositions",
    selectors: {
      header: "#header",
      toolbar: "#toolbar",
      content: "#main-content",
      footer: "#footer"
    }
  }
});

// 2. Verify no overlaps and correct order
// header.y < toolbar.y < content.y < footer.y
```

### Use Case 2: Execute Business Workflow

```javascript
// 1. Fill search form
await mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "fillForm",
    fields: [
      { selector: "#search-input", value: "test query", type: "text" },
      { selector: "#filter-active", value: true, type: "checkbox" }
    ]
  }
});

// 2. Click search button
await mcp__playwright__browser_click({ ref: "#search-btn" });

// 3. Wait for results
await mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "waitForElements",
    selectors: [".result-table", ".pagination"],
    timeout: 5000
  }
});
```

### Use Case 3: Analyze Element Structure

```javascript
// Find element and get its hierarchy
const info = await mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "findElement",
    selector: "#search-btn"
  }
});

const hierarchy = await mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
  params: {
    action: "getElementHierarchy",
    selector: "#search-btn",
    direction: "parents",
    levels: 3
  }
});
```

## Benefits

1. **Efficiency**: Batch operations reduce round-trips
2. **Consistency**: Standardized methods for common tasks
3. **Maintainability**: Single source of truth for browser operations
4. **Error Handling**: Built-in error handling and reporting
5. **Flexibility**: Easy to extend with new actions

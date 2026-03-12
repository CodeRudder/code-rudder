# Verifying Frontend Implementation Against .pen Design

**⚠️ CRITICAL**: Implementation is INCOMPLETE without running alignment verification script.

## ⚠️ VERIFICATION SCOPE REQUIREMENTS

**MANDATORY - READ THIS FIRST**:

1. **ALL Three Levels MUST Be Verified** - Not optional, not partial:
   - Level 1: Global Page Structure (ALL top-level containers)
   - Level 2: Content Area Layout (ALL sub-regions)
   - Level 3: Component Details (ALL buttons, inputs, labels, etc.)

2. **ALL Components MUST Be Included** - Not just a few examples:
   - ❌ WRONG: Only verify 5-10 components
   - ✅ CORRECT: Verify EVERY component in the page
   - ❌ WRONG: Skip components you think are "simple"
   - ✅ CORRECT: Include ALL components regardless of complexity

3. **Complete Component Inventory Required**:
   - List EVERY button, input, label, icon, text element
   - Include ALL nested components within containers
   - Don't assume "similar components" will behave the same
   - Each component must have its own selector in verification

4. **Verification Completeness Check**:
   - Before running verification, count components in .pen file
   - Count selectors in your verification params
   - Numbers MUST match (or explain why some are grouped)
   - If .pen has 20 components, verification must include 20 selectors

**⚠️ ANTI-PATTERN**: Verifying only a few components and assuming the rest are correct is the PRIMARY cause of missed layout bugs.

## 1. Verification Levels

### Level 1: Global Page Structure
- **Scope**: Top-level region containers (Header → Toolbar → Content → Footer)
- **Check**: Region order, y-positions, NO overlaps, dimensions match design
- **When**: ALWAYS

### Level 2: Content Area Layout (PRIMARY)
- **Scope**: ALL sub-regions within content area (SearchBar, ResultTable, Pagination, Toolbar, StatusBar, etc.)
- **Check**: Sub-region order, alignment, dimensions, NO overlaps
- **When**: ALWAYS (main verification target)
- **⚠️ CRITICAL**: Must include EVERY sub-region in content area - missing any sub-region = incomplete verification

### Level 3: Component Details (MANDATORY)
- **Scope**: Internal components within sub-regions (buttons, inputs, labels, etc.)
- **Check**: Component order, alignment, dimensions, NO overlaps
- **When**: ALWAYS

## 2. Verification Steps

### Step 1: Create Validation Checklist

**CRITICAL - Component Inventory**:
1. **Count ALL components in .pen file**:
   - Open .pen file and count EVERY visual element
   - Level 1: Count top-level containers (header, toolbar, content, footer, etc.)
   - Level 2: Count sub-regions within content area (search bar, table, pagination, etc.)
   - Level 3: Count ALL components within sub-regions (buttons, inputs, labels, icons, text, etc.)
   - Record total count: "This page has X components across 3 levels"

2. **Create complete component list by level**:
   - **IMPORTANT**: Organize checklist by 3 levels (Level 1 → Level 2 → Level 3)
   - List EVERY component with its level and purpose
   - Format: Separate sections for each level
   - Save to `ai-docs/ui-validation/{page-name}-layout-checklist.md`

3. **Identify alignment requirements by level**:
   - Analyze .pen file to identify row/column alignment requirements
   - Document which components should be on same row/column
   - **Group by level**: Level 1 alignments, Level 2 alignments, Level 3 alignments

**Verification Priority**:
- ✅ **MUST verify**: Page-specific content area (all buttons, forms, tables, pagination, etc.)
- ✅ **MUST verify**: All key components in the main content area
- ✅ **MUST verify**: Container order (Header → Toolbar → Content → Footer)
- ⏭️ **Can skip**: Common components (Header/Footer/Menu) if already verified once

**⚠️ CHECKPOINT**: Before proceeding to Step 2, confirm you have listed ALL components. If you only have 5-10 components listed, you are missing components.

### Step 2: Execute Business Workflow

**⚠️ CRITICAL - Complete Business Flow BEFORE Analysis**:
- **DO NOT skip to Step 3** until business workflow is FULLY complete
- **DO NOT analyze page** until data is loaded and rendered
- Missing this step = analyzing empty/incomplete page = false "missing content" errors

**Required Actions**:
1. **Navigate to page**: Use Playwright MCP to open the page
2. **Execute business operations**: Perform ALL required actions (search, filter, submit, etc.)
   - **TIP**: Use `browser-utils.js` for efficient form filling and clicking
   - See [scripts/browser-utils-guide.md](scripts/browser-utils-guide.md) for available utilities
3. **Wait for data loading**: Use `browser_wait_for` or `browser-utils.js` waitForElements
4. **Verify data is rendered**: Use `browser_snapshot()` to confirm expected data appears

**⚠️ CHECKPOINT - Verify Page State**:
Before proceeding to Step 3, confirm:
- [ ] All business actions completed (search executed, form submitted, etc.)
- [ ] Data loading indicators disappeared (spinners, loading text, etc.)
- [ ] Expected data is visible in `browser_snapshot()` (table rows, list items, etc.)
- [ ] Page is in final state, not loading/transitioning

**Example - Complete Business Flow**:
```javascript
// 1. Navigate
mcp__playwright__browser_navigate({ url: 'http://localhost:3000/search' })

// 2. Execute business action (e.g., search)
mcp__playwright__browser_type({ ref: '#search-input', text: 'test query' })
mcp__playwright__browser_click({ ref: '#search-btn' })

// 3. Wait for data to load
mcp__playwright__browser_wait_for({ text: 'Search Results' })

// 4. Verify page state - SAVE snapshot to file
mcp__playwright__browser_snapshot({ filename: 'ai-docs/ui-validation/{page-name}-snapshot.md' })
// ✅ Confirm: Results table visible, data rows present, pagination showing
```

**⚠️ IMPORTANT**: Always save snapshot to file when content is large. Use `filename` parameter to avoid overwhelming context.

**⚠️ ANTI-PATTERN**: Skipping business workflow and analyzing empty page leads to false "missing content" errors.

### Step 3: Analyze Page Structure

**⚠️ PREREQUISITE CHECK**:
Before analyzing page structure, confirm Step 2 is complete:
- [ ] Business workflow executed completely
- [ ] Data is loaded and visible in browser_snapshot()
- [ ] Page is in final state (not loading)

**If data is missing or page looks empty → GO BACK TO STEP 2**

**Analysis Process**:

1. **Save snapshot to file** (REQUIRED for large pages):
   ```javascript
   mcp__playwright__browser_snapshot({ filename: 'ai-docs/ui-validation/{page-name}-snapshot.md' })
   ```

2. **Read snapshot file** to analyze page structure:
   ```javascript
   // Use Read tool to examine the snapshot file
   // Search for elements by text, role, or attributes
   ```

3. **Generate precise selectors** based on snapshot analysis:
   - **CRITICAL**: DO NOT guess selectors - analyze actual page structure from snapshot file
   - Prefer unique IDs: `#save-btn`
   - Use specific classes: `.pagination .count-display`
   - Combine attributes: `button[aria-label="Save"]`
   - Add parent context: `.toolbar #save-btn`
   - Each selector should match exactly ONE element

### Step 4: Extract and Verify Alignment

**⚠️ VERIFICATION STRATEGY - Execute by Level**:
- **DO NOT verify all levels at once** - this leads to incomplete checks
- **DO verify each level separately**: Level 1 → Level 2 → Level 3
- Each level should have its own verification run
- Fix issues at each level before proceeding to next level

**⚠️ CHECKPOINT - Verify Completeness**:
Before running verification for each level:
1. Count selectors for this level in your params object
2. Compare with component count from Step 1 for this level
3. If counts don't match → YOU ARE MISSING COMPONENTS
4. Go back and add ALL missing component selectors for this level

**Level 1 Verification** (Global Page Structure):
```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/extract-and-verify.js",
  params: {
    selectors: {
      // ONLY Level 1 components
      header: '#header',
      toolbar: '#toolbar',
      content: '#main-content',
      footer: '#footer'
    },
    expectedAlignments: {
      columns: [
        ['header', 'toolbar', 'content', 'footer']  // Top-to-bottom order
      ]
    },
    waitForSelector: '#main-content',
    threshold: 80
  }
})
```

**Level 2 Verification** (Content Area Layout):

**⚠️ CHECKPOINT - Verify ALL Sub-Regions Included**:
Before running Level 2 verification:
1. Review Step 1 checklist - count ALL Level 2 sub-regions listed
2. Count selectors in params below - must match Step 1 count
3. Common missed sub-regions: Toolbar, StatusBar, FilterBar, ActionBar, EmptyState
4. If Step 1 listed 5 sub-regions but you only have 3 selectors → YOU ARE MISSING SUB-REGIONS

```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/extract-and-verify.js",
  params: {
    selectors: {
      // MUST include ALL Level 2 sub-regions from Step 1 checklist
      // Example sub-regions (your page may have different ones):
      searchBar: '.search-bar',
      resultTable: '.result-table',
      pagination: '.pagination'
      // ... ADD ALL remaining Level 2 sub-regions from Step 1
      // Common sub-regions: toolbar, statusBar, filterBar, actionBar, emptyState
    },
    expectedAlignments: {
      columns: [
        ['searchBar', 'resultTable', 'pagination']  // Top-to-bottom order
        // MUST include ALL sub-regions in correct order
      ]
    },
    waitForSelector: '.result-table',
    threshold: 80
  }
})
```

**Level 3 Verification** (Component Details):
```javascript
mcp__playwright__browser_run_script_file({
  filePath: "./.claude/skills/pen-to-code/scripts/extract-and-verify.js",
  params: {
    selectors: {
      // ONLY Level 3 components (buttons, inputs, labels, etc.)
      searchButton: '#search-btn',
      clearButton: '#clear-btn'
      // ... ALL Level 3 components from Step 1
    },
    expectedAlignments: {
      rows: [
        ['searchButton', 'clearButton']  // Left-to-right order
      ]
    },
    waitForSelector: '#search-btn',
    threshold: 80
  }
})
```

**⚠️ CRITICAL**: All verification below is MANDATORY. See Section 4 for detailed check categories:
- **MANDATORY**: Verify BOTH horizontal (rows) AND vertical (columns)
- **MANDATORY**: Verify component dimensions, overlaps, and container order
- **Missing ANY check = FAIL**

### Step 5: Check Results

**For each level verification**:

- `success: true` → All checks passed ✅ → Proceed to next level
- `success: false` → Check `issues` object:
  - Missing elements → Wrong selector
  - Alignment failures → Fix HTML/CSS
  - Dimension mismatch → Fix component sizes
  - Overlap detected → Fix positioning
- **Fix**: DON'T modify expectedAlignments, fix HTML/CSS instead
- **Retry**: Repeat until 100% match

**⚠️ Level 2 Acceptance Criteria (CRITICAL)**:

Before proceeding to Level 3, verify Level 2 is COMPLETE:

1. **ALL sub-regions verified**:
   - Count sub-regions in Step 1 checklist
   - Count sub-regions in verification results
   - Numbers MUST match

2. **ALL alignments verified**:
   - Every sub-region appears in `rows` or `columns` arrays
   - No sub-region is missing from alignment verification
   - Both horizontal AND vertical alignments checked

3. **If verification incomplete**:
   - Identify missing sub-regions (compare Step 1 vs verification results)
   - Create new verification run for missing sub-regions
   - Add missing sub-regions to selectors and expectedAlignments
   - Re-run Level 2 verification until ALL sub-regions verified

**Example - Incomplete Level 2 Verification**:
```
Step 1 checklist: 5 sub-regions (searchBar, toolbar, resultTable, statusBar, pagination)
Verification results: 3 sub-regions (searchBar, resultTable, pagination)
→ MISSING: toolbar, statusBar
→ ACTION: Re-run Level 2 verification including toolbar and statusBar
```

### Step 6: Fix and Iterate

- Fix HTML/CSS implementation (NOT JSON, NOT expectedAlignments)
- Repeat workflow until all checks pass

## 3. Check Categories

### 3.1 Alignment Checks (MANDATORY)

**Horizontal (rows)**:
- Components on SAME horizontal line must be aligned
- Use `rows` array in expectedAlignments
- ALL components on same row must be in ONE array
- List components in left-to-right order
- Example: `['leftBtn', 'middleBtn', 'rightBtn']`

**Vertical (columns)**:
- Components in SAME vertical stack must be aligned
- Use `columns` array in expectedAlignments
- ALL components in same column must be in ONE array
- List components in top-to-bottom order
- Example: `['header', 'content', 'footer']`

**Component Order**:
- Same-line components must remain on same line (no unwanted line breaks)
- Check flex-wrap doesn't break layout

### 3.2 Dimension Checks (MANDATORY)

**Region Sizes**:
- Header/Toolbar/Footer height/width must match design
- Tolerance: ±2px for rendering variations

**Component Sizes**:
- Buttons/inputs/table dimensions must match design
- Example: Button height 40px vs design 36px = FAIL

**Text Sizing**:
- Font sizes must match design spec
- Check fontFamily, fontSize, fontWeight, lineHeight

### 3.3 Overlap Checks (MANDATORY)

**Region Container Order**:
- Top-level regions must be in correct top-to-bottom order
- Check: `header.y < toolbar.y < content.y < footer.y`

**No Region Overlaps**:
- Region containers must not overlap each other
- Check: `region1.y + region1.height <= region2.y`

**Component Overlaps**:
- Adjacent components must not overlap
- Z-index must be correct for overlays

### 3.4 Selector Rules

**DO**:
- Use `browser_snapshot()` to analyze actual page structure
- Prefer unique IDs: `#save-btn`
- Use specific classes: `.pagination .count-display`
- Combine attributes: `button[aria-label="Save"]`
- Add parent context: `.toolbar #save-btn`

**DON'T**:
- Guess selectors without analyzing page structure
- Use imprecise selectors: `:first-child`, `:nth-child` (may select wrong elements)
- Reuse same selector for different elements

### 3.5 expectedAlignments Rules

**CRITICAL**: expectedAlignments MUST match UI design exactly - DO NOT modify when tests fail

**Row Groups**:
- Components on SAME horizontal line
- ALL same-row components in ONE array (do not split)
- List left-to-right

**Column Groups**:
- Components in SAME vertical stack
- ALL same-column components in ONE array (do not split)
- List top-to-bottom

**Multiple Groups**:
- Use separate arrays for different rows/columns

**Example**:
```javascript
expectedAlignments: {
  rows: [
    ['btn1', 'btn2', 'btn3'],      // First row (left to right)
    ['input1', 'input2']            // Second row (left to right)
  ],
  columns: [
    ['header', 'toolbar', 'content', 'footer'],  // Main layout (top to bottom)
    ['nav1', 'nav2', 'nav3']        // Sidebar nav items (top to bottom)
  ]
}
```

### 3.6 Anti-Patterns

**NEVER do these**:
- ❌ Skip business workflow and analyze empty page (causes false "missing content" errors)
- ❌ Analyze page before data is loaded (wait for data to render first)
- ❌ Skip Level 2 sub-regions (must verify ALL sub-regions in content area)
- ❌ Verify only 2-3 Level 2 sub-regions when page has 5+ (causes missed layout bugs)
- ❌ Skip dimension verification (component sizes MUST match design)
- ❌ Accept wrong dimensions (40px vs 36px = FAIL, fix it)
- ❌ Ignore overlapping regions (Header covering toolbar = CRITICAL defect)
- ❌ Skip overlap checks (must verify `region1.y + region1.height <= region2.y`)
- ❌ Ignore container order violations (region order MUST be correct)
- ❌ Skip container order verification (must verify y-positions increase)
- ❌ Ignore layout mismatches as "minor" (ALL mismatches must be fixed)
- ❌ Accept "close enough" results (100% match required)
- ❌ Verify only one direction (must verify BOTH rows AND columns)
- ❌ Verify only a few components (must verify ALL components across all 3 levels)
- ❌ Verify all levels at once (must verify each level separately)
- ❌ Guess selectors without analyzing page structure
- ❌ Run e2e test with business workflow (use Playwright MCP + browser_run_code)
- ❌ Manually edit alignment-check.json file (this is OUTPUT only)
- ❌ Modify expectedAlignments when tests fail (fix HTML/CSS instead)
- ❌ Bypass verification (always run verification script)
- ❌ Give up after errors (fix and retry, don't skip verification)

## 4. Final Verification Checklist

### Level 1: Global Page Structure (MANDATORY)

**Region Container Order**:
- [ ] Top-level regions in correct order: Header → Toolbar → Content → Footer (top-to-bottom)
- [ ] Region y-positions verified: header.y < toolbar.y < content.y < footer.y
- [ ] No region overlaps: region1.y + region1.height <= region2.y
- [ ] Region dimensions match design: width/height for each region

**Layout Direction**:
- [ ] Vertical layout: Regions stack top-to-bottom correctly
- [ ] Horizontal layout: Regions arrange left-to-right correctly (if applicable)

### Level 2: Content Area Layout (MANDATORY - PRIMARY)

**Scope**: ALL sub-regions within content area (SearchBar, ResultTable, Pagination, Toolbar, StatusBar, etc.)

**⚠️ CRITICAL**: Must verify EVERY sub-region - missing any = incomplete verification

**Sub-Region Order**:
- [ ] ALL sub-regions identified and listed (not just 2-3 examples)
- [ ] Sub-regions in correct order: top-to-bottom (e.g., SearchBar → ResultTable → Pagination)
- [ ] Sub-region y-positions verified: searchBar.y < resultTable.y < pagination.y
- [ ] No sub-region overlaps: region1.y + region1.height <= region2.y

**Sub-Region Alignment**:
- [ ] Horizontal (rows): Sub-regions on same line aligned (y-positions match)
- [ ] Vertical (columns): Sub-regions stacked correctly (x-positions consistent)
- [ ] ALL sub-regions included in alignment verification (rows or columns arrays)
- [ ] No sub-region missing from alignment checks

**Sub-Region Dimensions**:
- [ ] Sub-region sizes match design (width/height for each sub-region)
- [ ] All sub-regions verified: Every sub-region has correct position/dimensions

**Level 2 Completeness Check**:
- [ ] Count sub-regions in Step 1 checklist matches count in verification results
- [ ] Every sub-region from Step 1 appears in verification
- [ ] If any sub-region missing → Re-run Level 2 verification with missing sub-regions

### Level 3: Component Details (MANDATORY)

**Scope**: Internal components within sub-regions (buttons, inputs, labels, etc.)

**Component Order**:
- [ ] Components in correct order: left-to-right or top-to-bottom within sub-region
- [ ] Component positions verified: button1.x < button2.x < button3.x (same row)

**Component Alignment**:
- [ ] Horizontal (rows): Components on same line aligned (y-positions match)
- [ ] Vertical (columns): Components stacked correctly (x-positions consistent)
- [ ] Component order: Same-line components remain on same line (no unwanted line breaks)

**Component Dimensions**:
- [ ] Component sizes: Buttons/inputs/labels dimensions match design
- [ ] Text sizing: Font sizes match design spec
- [ ] All components verified: Every component has correct position/dimensions

**Component Overlaps**:
- [ ] No component overlaps between adjacent components
- [ ] Z-index correct: Overlays appear above content (if applicable)

### General Checks (All Levels)

**Functional**:
- [ ] Responsive layout works
- [ ] Interactive states (hover, active, focus) implemented
- [ ] Semantic HTML tags correct
- [ ] Accessibility attributes added
- [ ] **Business workflow tested**: Page tested with actual data, renders correct expected data

**Console**:
- [ ] No console errors (JavaScript/CSS)
- [ ] No 404 errors for resources
- [ ] No layout warnings

## 5. Acceptance Criteria

- **100% match required** - NO layout mismatches acceptable
- Implementation NOT complete until Playwright verification confirms 100% match
- Testing empty page layout INSUFFICIENT - MUST test with actual data
- ANY alignment failure MUST be fixed - Do not ignore or skip mismatches
- All visual and layout requirements must pass

**Level 2 Specific Requirements**:
- ALL sub-regions in content area MUST be verified (not just 2-3 examples)
- ALL sub-regions MUST appear in alignment verification (rows or columns)
- If any sub-region missing from verification → Re-run with missing sub-regions included
- Level 2 verification NOT complete until ALL sub-regions verified with passing alignments

# Implementing Pages from .pen Design Files

## ⚠️ CRITICAL READING REQUIREMENTS

**MANDATORY - READ THIS FIRST**:

1. **NEVER use readDepth > 3** - Causes context overflow and incomplete reading
   - ❌ WRONG: `readDepth: 4` or higher
   - ✅ CORRECT: `readDepth: 2-3` based on complexity (not always 3)

2. **ALWAYS read in layers** - Progressive reading prevents information loss:
   - Layer 1: Page skeleton (readDepth: 2) - Get main regions
   - Layer 2: Region details (readDepth: 2-3) - Choose based on region complexity
   - Layer 3: Component details (readDepth: 2-3) - Get nested components if needed

3. **WHY layered reading is required**:
   - Deep reads (readDepth: 4+) cause context overflow
   - Context overflow = incomplete data = missing components in implementation
   - Layered reading = complete data = accurate implementation

**⚠️ ANTI-PATTERN**: Using `readDepth: 4` or higher causes incomplete reads and missing components.

## 1. Development Approach

- **Chunked reading** - Control readDepth (2-3) to avoid context overflow
- **Region-by-region** - Complete one region at a time
- **Structure first** - Create DOM, then add CSS
- **Incremental verification** - Validate after each region

## 2. Key Points

- Always start with `get_editor_state` to get opened file and page list
- Read only target page, avoid reading entire document
- Record node IDs during exploration for later deep reading
- Use exact values from design (no approximations)
- Handle fill_container based on flex direction
- Visual result must match design exactly

## 3. Implementation Steps

### Step 0: Analyze UI Design

**Before implementing**, analyze the design:

1. **Get editor state**
   ```javascript
   mcp__pencil__get_editor_state({ include_schema: false })
   ```
   - Get currently opened .pen file path
   - Get list of available pages/screens
   - Identify which page to implement

2. **Read target page only**
   ```javascript
   mcp__pencil__batch_get({ nodeIds: ["targetPageId"], readDepth: 2 })
   ```

3. **Identify row/column alignment**
   - List which elements are on SAME ROW/LINE
   - Example: "Button A, Button B, Button C are on same row"
   - Example: "Search icon and input field are on same row"

4. **Identify region layout**
   - Document toolbar/content/footer/sidebar positions

5. **Identify region container order** (CRITICAL)
   - Document top-to-bottom order
   - Example: Header(y=0) → Toolbar(y=64) → Content(y=120) → Footer(bottom)
   - Container order violations are MAJOR layout defects

6. **Create verification checklist**
   - Write down all layout requirements
   - Use this checklist during verification

### Step 1: Read Page Skeleton

**⚠️ CHECKPOINT - Verify readDepth**:
- MUST use `readDepth: 2` (not 3, not 4)
- This reads page + main regions (2 levels)
- Deeper reads cause context overflow

```javascript
mcp__pencil__batch_get({ nodeIds: ["targetPageId"], readDepth: 2 })
```

Identify main regions within the target page, record their IDs and basic properties.

**Note**: Pencil MCP may be slow. If a read operation fails, wait a few seconds and retry 2-3 times.

### Step 2: Implement Skeleton

Create page structure with placeholder regions.

### Step 3: Read Each Region

**⚠️ CHECKPOINT - Verify readDepth**:
- Use `readDepth: 2` or `readDepth: 3` based on region complexity
- Simple regions (few components): `readDepth: 2`
- Complex regions (nested components): `readDepth: 3`
- NEVER exceed `readDepth: 3` (causes context overflow)

```javascript
// For simple regions
mcp__pencil__batch_get({ nodeIds: ["regionId"], readDepth: 2 })

// For complex regions with nested components
mcp__pencil__batch_get({ nodeIds: ["regionId"], readDepth: 3 })
```

Identify components within region, record child IDs needing expansion.

### Step 4: Implement Region

- Create DOM structure matching design hierarchy
- Add CSS with exact values (dimensions, colors, spacing, fonts)
- Verify with browser devtools

### Step 5: Repeat for Remaining Regions

Continue with same pattern: Read → Implement → Verify

### Step 6: Playwright Verification (MANDATORY)

**⚠️ CRITICAL**: Implementation is INCOMPLETE without verification.

See **verification.md** for detailed verification process.

## 4. Key Implementation Rules

### 4.1 Precision Requirements

- **Exact values**: Use precise px values from design (not approximations)
- **Exact colors**: Use hex codes as-is (e.g., #3B82F6)
- **Exact fonts**: Match family, size, weight, line-height

### 4.2 fill_container Handling

**In flex main axis**: Use `flex: 1`
**In flex cross axis**: Use `width: 100%` or `height: 100%`

### 4.3 Semantic HTML

Map `name` properties to appropriate tags:
- `searchButton` → `<button>`
- `inputField` → `<input>`
- `newHeader` → `<header>`

### 4.4 Icons

Use lucide-react for `iconFontFamily: "lucide"`:
```jsx
// .pen: iconFontName: "search", width: 18, fill: "#94A3B8"
<Search size={18} color="#94A3B8" />
```

## 5. Common Errors to Avoid

### 5.1 Reading Too Deep

```javascript
// Wrong: readDepth too large
mcp__pencil__batch_get({ nodeIds: ["id"], readDepth: 5 })

// Correct: Progressive reading
mcp__pencil__batch_get({ nodeIds: ["id"], readDepth: 2 })
```

### 5.2 Ignoring "..." Markers

When you see `children: "..."`, that node has unexpanded children. Read it separately with its node ID.

### 5.3 Layout Mismatch

```javascript
// Wrong: Changed component order or line breaks
Toolbar | Content | Footer  (all in one line)

// Correct: Match design layout
Toolbar
---------
Content
---------
Footer
```

## 6. Implementation DO's and DON'Ts

### ✅ DO (Must Follow)

1. **Analyze UI design first** - Create layout checklist identifying row/column alignment AND container order BEFORE implementation
2. **Chunked reading** - readDepth never exceeds 3
3. **Region-by-region** - Complete one region at a time
4. **Structure first** - Create DOM, then add CSS
5. **Exact matching** - Use precise values from design (no approximations)
6. **Incremental verification** - Validate after each region
7. **MANDATORY Playwright verification** - MUST use Playwright for visual acceptance and DOM layout verification
8. **MANDATORY container order verification** - MUST verify region containers appear in correct top-to-bottom order
9. **Use layout checklist** - Compare actual implementation against layout checklist during verification

### ❌ DON'T (Prohibited)

1. ❌ Use readDepth > 3 (causes context overflow and incomplete reads)
2. ❌ Read entire page at once without layering (use Step 1 → Step 3 approach)
3. ❌ Start implementation without analyzing UI design and creating layout checklist
4. ❌ Skip container order verification in layout checklist
5. ❌ Implement multiple regions simultaneously
6. ❌ Mix DOM and CSS writing (causes confusion)
7. ❌ Use approximate values (padding: 20px instead of 24px)
8. ❌ Verify only after completing all code
9. ❌ Skip Playwright verification - Implementation without verification is INCOMPLETE
10. ❌ Skip container order verification - Incorrect region order is CRITICAL defect
11. ❌ Test only empty page layout - MUST test with actual data following business workflows
12. ❌ Verify without layout checklist - MUST compare against layout checklist to catch row/column alignment issues

## 7. After Each Region Checklist

- [ ] DOM structure matches design hierarchy exactly
- [ ] Component regions (x, y, width, height) match design
- [ ] Dimensions exact (measure with devtools)
- [ ] Colors exact (background, color, border)
- [ ] Spacing exact (gap, padding, margin)
- [ ] Fonts exact (family, size, weight, line-height)
- [ ] Border radius values correct
- [ ] Layout correct (flex-direction, align-items, justify-content)
- [ ] Icons size and color exact

## 8. Next Steps

After implementing all regions, proceed to **verification.md** for comprehensive layout verification.

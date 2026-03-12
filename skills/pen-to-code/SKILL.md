---
name: pen-to-code
description: Implement frontend pages from .pen UI design files with 100% accuracy. Use when implementing pages from .pen design files, translating UI designs to HTML/CSS/React code, or when working with Pencil MCP tools to read design specifications. Provides progressive workflow for reading designs, precise property mappings, and layout translation rules.
---

# Pen-to-Code Skill

## Overview

Implement frontend pages from .pen UI design files with pixel-perfect accuracy.

**Critical Requirement**: **100% match with UI design is MANDATORY**. No layout mismatches are acceptable.

## MANDATORY Task Execution Rules

**⚠️ CRITICAL**: When using this skill, you MUST follow these rules:

1. **Read Documentation First**: ALWAYS read the corresponding documentation file BEFORE starting any task:
   - Implementation task → Read [references/implementation.md](references/implementation.md) completely
   - Verification task → Read [references/verification.md](references/verification.md) completely
   - Property mapping questions → Read [references/mappings.md](references/mappings.md)
   - Browser operations → Use the **browser-utils** skill (invoke with `/browser-utils` or use Skill tool)

2. **Follow Documentation Strictly**: Execute ALL steps in the documentation in order. DO NOT skip any steps.

3. **Implementation → Verification Workflow**:
   - After completing implementation, verification is MANDATORY (not optional)
   - Implementation task = Code implementation + Verification
   - Task is NOT complete until verification confirms 100% match
   - Workflow: Implement code → Read references/verification.md → Execute verification steps → Fix issues → Repeat until success

4. **Your Role**: You are implementing the UI design, NOT evaluating it:
   - ✅ DO: Ensure page implementation matches UI design 100%
   - ✅ DO: Follow design specifications precisely (dimensions, colors, spacing, alignment)
   - ✅ DO: Run verification scripts to confirm implementation matches design
   - ❌ DON'T: Question or analyze UI design reasonableness
   - ❌ DON'T: Suggest design improvements or alternatives
   - ❌ DON'T: Skip verification steps because you "think" it looks correct

5. **Verification is MANDATORY**:
   - Implementation is INCOMPLETE without running verification scripts
   - MUST read [references/verification.md](references/verification.md) and execute Steps 1-6
   - MUST verify all three levels: Global Structure → Content Layout → Component Details
   - MUST fix ALL mismatches until 100% match achieved

6. **Task Completion Criteria**:
   - Task is NOT complete until verification script confirms 100% match
   - "Looks good" or "should work" is NOT acceptable
   - Only `success: true` from verification script = task complete

## Quick Reference

| Task | Documentation |
|------|---------------|
| **Understand this skill** | (this file) |
| **Implement from .pen design** | [references/implementation.md](references/implementation.md) |
| **Verify layout matches design** | [references/verification.md](references/verification.md) |
| **Property mappings** | [references/mappings.md](references/mappings.md) |
| **Browser operations** | Use **browser-utils** skill |

## Quick Start

1. Read `.pen` file: `get_editor_state` → `batch_get` (readDepth: 2-3)
2. Follow [references/implementation.md](references/implementation.md) (Steps 0-6)
3. Follow [references/verification.md](references/verification.md) (Three-level verification)
4. Use **browser-utils** skill for browser operations (recommended)

## Key Concepts

- **Progressive Reading**: Control `readDepth` (2-3), region-by-region implementation
- **Three-Level Verification**: Global structure → Content layout → Component details
- **Mandatory Checks**: Alignment, Dimensions, Overlaps, Container order

## Documentation Files

### [references/implementation.md](references/implementation.md)
Step-by-step implementation workflow:
- Development approach (chunked reading, region-by-region)
- Steps 0-6 (Analyze → Read → Implement → Verify)
- Key rules (precision, fill_container, semantic HTML, icons)
- Common errors to avoid
- DO's and DON'Ts

### [references/verification.md](references/verification.md)
Comprehensive layout verification process:
- Three-level verification (Global → Content → Component)
- Steps 1-6 with code examples
- Check categories (Alignment, Dimensions, Overlaps, Selectors, Anti-patterns)
- Final verification checklist
- Acceptance criteria

### [references/mappings.md](references/mappings.md)
Detailed property-to-code mappings:
- Node type → HTML mappings
- Layout system (flexbox) mappings
- Sizing system rules
- Style property translations
- Common layout patterns

## Related Scripts

- **scripts/extract-and-verify.js** - Coordinate extraction + alignment verification
- **scripts/example-extract-coords.js** - Extraction script example

## Browser Operations

**⚠️ RECOMMENDED**: Use the **browser-utils** skill for all browser operations.

The browser-utils skill provides 10 tested utility functions for common Playwright operations:
- Form filling with value verification
- Element inspection and existence checking
- Click sequences and waiting for elements
- Position/dimension extraction
- Computed styles retrieval

**Benefits:**
- Consistent, tested implementations
- Better error handling
- Reduced context usage
- Easier maintenance

**How to use:** Invoke the browser-utils skill when you need browser automation capabilities.


## When to Use This Skill

- Implementing pages from .pen design files
- Translating UI designs to HTML/CSS/React code
- Working with Pencil MCP tools to read design specifications
- Verifying frontend implementation matches design

## Version History

- **2026-02-10**: Added browser-utils.js for efficient browser operations
- **2026-02-10**: Require browser_snapshot to save to file for large pages
- **2026-02-10**: Added MANDATORY Task Execution Rules - enforce documentation reading and verification
- **2026-02-10**: Simplify SKILL.md as entry point with clear documentation links
- **2026-02-10**: Merged overview into SKILL.md, simplified verification Step 4
- **2026-02-10**: Global reorganization - eliminated duplication
- **2026-02-10**: Added dimension checks and overlap checks
- **2026-02-06**: Added three-level verification process

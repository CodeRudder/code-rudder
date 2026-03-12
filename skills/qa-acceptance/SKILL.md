---
name: qa-acceptance
description: Systematic requirement and bug acceptance testing workflow. Use when users need to verify requirements, validate bug fixes, perform acceptance testing, or execute QA validation. Supports API testing and web UI testing with structured checklists, test execution, and reporting. Trigger on requests like "verify this requirement", "test this bug fix", "perform acceptance testing", "validate the login feature", or "check if BUG-123 is fixed".
---

# QA Acceptance Testing

## Overview

Systematic workflow for requirement acceptance and bug verification with structured test checklists, detailed test steps, validation execution, and report generation.

**Key principles**: Language-agnostic, process-focused, systematic, and traceable.

## Reference Documents

**MANDATORY: Read reference documents before starting validation work.**

### Always Required:
- ✓ **`references/test-steps-template.md`** - MUST read before creating test steps
  - Complete example with UI + API validation
  - User intent identification examples
  - Business correlation validation

### Based on Validation Type:
Read ONE or BOTH based on your test methods:

- **If test_method is `api`** → Read `references/api-validation-guide.md`
  - Detailed validation layers
  - Database consistency checks
  - Fake update detection

- **If test_method is `ui`** → Read `references/ui-validation-guide.md`
  - Browser automation requirements
  - 9 validation layers
  - Visual quality checks

**Example**:
- Testing login feature with both API and UI → Read all 3 documents
- Testing API-only endpoint → Read test-steps + api-validation
- Testing UI-only feature → Read test-steps + ui-validation

## Workflow

### Step 0: Understand User Intent (MANDATORY FIRST STEP)

**CRITICAL**: Before creating any documents, understand what the user actually wants through 3-level self-questioning.

**Three-Level Self-Questioning Process**:

**Level 1: Surface Understanding**
- What is the user literally asking for?
- What specific feature/operation are they describing?
- What is the immediate symptom or requirement?

**Level 2: Usage Scenario Understanding**
- What is the user trying to accomplish in their workflow?
- What is the complete usage scenario (not just a single action)?
- How would a real user interact with this feature in practice?

**Level 3: Essential Need Understanding**
- What is the user's core need or goal?
- What problem are they trying to solve?
- What would "success" look like from the user's perspective?

**Analysis Framework** (document in checklist):
1. **Surface Intent**: What user literally said
2. **Real Intent**: Complete usage pattern/workflow
3. **Essential Need**: Core goal to satisfy user
4. **How to Fulfill**: Functionality and validation required

**Example**: User reports "scrolling up doesn't load previous page"
- Surface intent: Load one page when scrolling up once
- Real intent: Continuous bidirectional scrolling through all pages (not one-time action)
- Essential need: Browse all messages smoothly without interruption
- How to fulfill: Test continuous scrolling 5→4→3→2→1→2→3→4→5, verify each page loads correctly

**Common Mistakes**:
- ❌ Taking words literally without deeper analysis
- ❌ Testing single actions instead of complete workflows
- ❌ Skipping this step and jumping to test creation

Read `references/test-steps-template.md` for more examples.

### Step 1: Create Requirements Checklist

**Save to**: `ai-docs/prds/{需求编号}-{模块}-{特性标题}-prd-list.md`

Include: ID, priority, title, acceptance criteria, status, dependencies, test method.

**ID naming**: `REQ-<MODULE>-<NUMBER>`, `BUG-<MODULE>-<NUMBER>`, `FEAT-<MODULE>-<NUMBER>`

**Priority**: P0 (critical), P1 (high), P2 (medium), P3 (low)

**Test methods**: `api`, `ui`, `data` (only when API/UI show inconsistencies), `manual`

See `assets/checklist-template.yaml` for structure.

### Step 2: Create Test Steps Document

**Save to**: `ai-docs/qa-acceptances/{需求/bug编号}-{标题}-qa-acceptance.md`

**Simplified version** (default): For first-time testing, straightforward requirements.

**Detailed version**: For repeated failures, reopened bugs, complex requirements.

**CRITICAL: Business Process Chain Thinking**

When designing test steps, think in terms of complete business workflows, not isolated actions:

1. **Identify the complete workflow**: What is the user trying to accomplish from start to finish?
2. **Break into sequential steps**: What actions must happen in sequence?
3. **Define validation conditions for EACH step**: What must be true after each step?
4. **Consider data boundaries**: What data changes between steps? How to verify correctness?

**Example workflow**: Scroll pagination involves continuous multi-step operations. Each scroll must trigger API with correct cursor, return exactly 10 messages, decrease start index by exactly 10 (41→31→21), render without duplicates, and accumulate messages correctly (10→20→30). Test continuous operation back and forth, not just one-time loading.

**Data Boundary Validation**:
- Exact values: "Start index must decrease by exactly 10" (not "approximately")
- Data integrity: No duplicates, no gaps, no missing data
- State consistency: Database, API response, and UI must all match
- Boundary conditions: What happens at page boundaries?

Read `references/test-steps-template.md` for complete examples with validation conditions.

## Test Data Preparation

### Data Quantity Requirements
- **List/Pagination**: 50+ records
- **Search**: 20+ records with varied content
- **Sorting**: 10+ records with different values
- **Filtering**: 15+ records across categories
- **Edge cases**: Include boundary values

### Data Generation
**Use scripts, NOT LLM generation**. Ensure consistent format and reproducibility.

Always clean up test data after testing.

## Acceptance Criteria and Pass/Fail Determination

### CRITICAL: Acceptance Based on User Needs, Not Technical Correctness

**Fundamental principle**: If user's core need is not satisfied, acceptance MUST fail, regardless of technical reasons.

**Critical rules**:
1. User's core need not satisfied → Acceptance MUST fail
2. "Works as designed" ≠ "Meets user needs" → Design may be wrong
3. Technical problems are not excuses → Must be resolved
4. Users don't care about technical issues → Only care if need is met
5. Unusable = Failed

**When evaluating**: Ask "Can user accomplish their goal?", NOT "Is code technically correct?"

### CRITICAL: Each Round Has Independent Pass/Fail Status

Each test round evaluated independently. Previous results do NOT affect current conclusion.

**Round status**:
- **PASSED**: All tests passed, no failures, no unconfirmed concerns
- **PARTIAL_PASS**: Some tests passed, but some NOT checked/tested → **MUST start next iteration**
- **FAILED**: Any test failed OR unconfirmed potential issue exists
- **BLOCKED**: Cannot complete testing due to dependencies

**CRITICAL: Partial Pass is NOT Acceptable**

**Partial pass scenarios** (must trigger next iteration):
- Some requirements validated successfully, others skipped/not checked
- Main flow works, but edge cases not tested
- API validated, but UI not checked (or vice versa)
- Some test steps executed, others skipped due to time/convenience

**Why partial pass must iterate**:
- ✗ "Some tests passed" ≠ "Acceptance complete"
- ✗ Skipping tests creates blind spots and hidden bugs
- ✓ ALL requirements must be validated for acceptance
- ✓ Incomplete validation = incomplete acceptance

**Mandatory next steps for PARTIAL_PASS**:
1. Document which tests were NOT performed and why
2. Identify blockers preventing complete validation
3. Create action items to enable full testing
4. **Start next iteration immediately** to complete missing validations
5. Do NOT conclude "acceptance passed" until ALL tests complete

**Example**:
```
Round 1: Login feature test
- ✓ User can login with valid credentials (PASSED)
- ✓ Error shows for invalid credentials (PASSED)
- ✗ Password reset flow NOT TESTED (skipped)
→ Round 1 status: PARTIAL_PASS
→ MUST start Round 2 to test password reset
→ Cannot conclude "login feature accepted"
```

**Unconfirmed issues that prevent "passed"**: Suspicious behavior not investigated, edge cases not tested, unclear results.

**Critical principle**: "Not confirmed as problem" ≠ "Confirmed as working correctly"

**Overall project status** = Status of LATEST round only.

## Step 3: Execute Validation

### CRITICAL: Complete Manual or Integration Testing Required

**Cannot rely solely on logs**. Must perform actual UI/API testing.

**Why logs insufficient**:
- ✗ Logs show success → Doesn't mean UI rendered correctly
- ✗ No error logs → Doesn't mean functionality works

**Required approach**:
- ✓ Manual testing: Physically interact with UI
- ✓ Integration testing: Use browser automation (Playwright)
- ✓ API testing: Call APIs and verify responses
- ✓ Data verification: Query database

### API Validation

Read `references/api-validation-guide.md` for detailed checklists.

**Validation layers**:
1. Request Validation (URL, method, headers, body)
2. Response Status (matches expected code)
3. Response Structure (all required fields present)
4. Response Data (values match business rules)
5. Side Effects (database changed correctly, no fake updates)

**Detect fake updates**: Query database before and after API call to verify actual changes.

### UI Validation

Read `references/ui-validation-guide.md` for detailed checklists.

**CRITICAL**: Console logs alone are NOT sufficient. Must use browser automation.

**Validation layers**:
1. Navigation (page loads, URL correct)
2. Element Existence (required elements present)
3. Element State (visible/hidden, enabled/disabled, correct content)
4. Interaction (click, input, form submit work)
5. Dynamic Behavior (loading states, error/success messages)
6. Visual Quality (rendering complete, contrast readable, theme consistent)

### Data Validation

Use only when API/UI tests show inconsistencies:
- Database state
- Cache state
- File system state
- External system state

## Step 4: Update Status and Generate Report

### Status Update Rules

**Status**: `pending`, `in_progress`, `passed`, `partial_pass`, `failed`, `blocked`

**partial_pass requirements**:
- Document which tests were NOT performed
- List blockers preventing complete validation
- Create action items for next iteration
- **MANDATORY**: Start next iteration to complete missing validations

**For failures**, record: failed step, error message, screenshot, logs, root cause hypothesis, fix recommendation.

### Report Generation

**Save to**: `ai-docs/qa-reports/{需求/bug编号}-{标题}-qa-report-round{验收轮数}.md`

**CRITICAL: Detailed Step-by-Step Validation Results**

Report must include validation results for EACH test step, not just overall pass/fail. For each requirement:

1. **List ALL test steps**
2. **For each step, show ALL validation conditions**
3. **Mark each condition as ✓ PASSED or ✗ FAILED**
4. **Include actual vs expected for failures**
5. **Attach evidence for each step**

**Format**: See detailed example in `assets/report-template.md`

**Report structure**:
1. Executive Summary (statistics, critical issues)
2. Statistics by Module (pass/fail/blocked counts)
3. **Detailed Step-by-Step Results** (MANDATORY)
4. Failed Requirements Detail (with evidence and recommendations)
5. Blocked Requirements Detail (with unblock conditions)
6. Next Steps (critical issues, recommendations)

**CRITICAL: No Shelving of Failed Validations**

When validation fails:
- ✗ Cannot skip and move to lower priority tasks
- ✗ Cannot postpone to "improve test coverage" or other nice-to-haves
- ✓ Must fix the failed validation FIRST
- ✓ Must restart next iteration to verify the fix
- ✓ Cannot mark feature as complete until ALL validations pass

**Why this is critical**: Failed validation = functionality broken. Shelving failures creates technical debt and unusable features.

See `assets/report-template.md` for complete template with examples.

### Report Retention Policy

**Keep only last 3 rounds** to avoid excessive AI context usage.

When creating round 4+, archive or delete reports older than last 3 rounds.

**Do NOT read reports older than last 3 rounds**.

### Generate/Update Integration Test Scripts (MANDATORY)

**After each acceptance round**, generate or update integration test scripts to automate future validation.

**Purpose**:
- Convert manual validation steps into automated tests
- Enable fast regression testing for future changes
- Preserve validation logic for repeated use

**What to generate**:
- **Save to**: `tests/integration/{需求/bug编号}-{标题}.spec.ts`
- Based on successful test steps from acceptance document
- Include all validation conditions as assertions (e.g., expect(response.data.length).toBe(10))
- Use exact expected values from validation

**Example**: BUG-102 scroll pagination acceptance validates exact message counts (10, 20, 30), start index changes (41→31→21), no duplicates, correct API parameters. Convert these into automated expect() assertions in test script.

**When to update existing script**:
- Found missing validation conditions
- Discovered edge cases not covered
- Fixed incorrect expected values
- Added new test steps

### Update QA Acceptance Document (MANDATORY)

**Based on acceptance findings**, update the acceptance document to improve future validation.

**When to update**:
- Discovered missing test steps
- Found validation conditions that were too vague
- Identified missing edge cases
- Corrected expected values

**Example transformation**:
- Original: "Messages load correctly" (vague)
- Updated: "Exactly 10 messages returned, start index decreased from 41 to 31, no duplicate IDs" (precise, testable)

**Update actions**:
- Add missing steps, preconditions, postconditions
- Refine validation conditions (vague → exact values)
- Correct errors in endpoints, parameters, expected values
- Document learnings and common pitfalls

**CRITICAL**: This ensures each acceptance round improves test quality, captures knowledge in executable form, and no validation details are lost.

**Mandatory for both PASSED and FAILED rounds**.

### Test Round Increment Rules

1. Increment test_round (1 → 2 → 3)
2. Preserve history (last 3 rounds only)
3. Focus on previously failed/blocked/partial_pass items
4. Generate comparative report
5. **If previous round was PARTIAL_PASS → MUST start next round**
6. **If same issue fails 3+ rounds → MUST consider refactoring**

**CRITICAL: When to Refactor Instead of Patch**

If the same validation fails across multiple rounds (3+ rounds), the implementation approach is fundamentally flawed:

**Signs that refactoring is needed**:
- Same issue reappears after claimed fixes
- Workaround solutions keep breaking
- Unreliable timing-dependent implementations (e.g., setTimeout)
- Test flakiness due to implementation instability

**Example**: Scroll loading fails intermittently across 3 rounds with different timeout values (1s, 2s, 3s). This indicates timing-based approach is fundamentally unreliable. Refactor to use intersection observer API or scroll position detection instead.

**Required action**:
1. Stop attempting small patches
2. Analyze root cause of persistent failure
3. **Design a fundamentally different implementation approach**
4. Use more reliable methods:
   - ✗ Instead of: `setTimeout(() => loadData(), 1000)` (timing-dependent)
   - ✓ Use: Event-driven loading, explicit state checks, promise chains
5. Implement complete refactoring
6. Restart validation from Round 1

**Why critical**: Repeated failures indicate design problem, not implementation bugs. Users need reliable functionality, not "works most of the time".

**CRITICAL: Partial Pass Requires Next Iteration**

When a round ends with PARTIAL_PASS:
- Cannot stop testing and conclude acceptance
- Must identify what was NOT tested
- Must create action items to enable full testing
- Must start next round to complete missing validations
- Only PASSED status (all tests complete) allows stopping

**CRITICAL: Test Independence**

- Ignore previous acceptance reports
- Re-execute complete validation from scratch
- Update checklists and steps as needed
- Verify actual behavior

## CRITICAL: Strict Workflow Compliance

**MANDATORY**: Cannot skip steps or take shortcuts.

**Required documents**:
1. ✓ Requirements Checklist → `ai-docs/prds/`
2. ✓ Test Acceptance Document → `ai-docs/qa-acceptances/`
3. ✓ Test Report → `ai-docs/qa-reports/`

**Why mandatory**: Ensures systematic, traceable, reproducible testing.

**Non-compliance examples**:
- ❌ Directly run tests without understanding intent
- ❌ Skip test steps document
- ❌ Skip report generation

**Compliance**:
- ✓ Understand user intent through 3-level questioning
- ✓ Create all required documents
- ✓ Execute tests following documented steps
- ✓ Generate report with results

## Resources

### references/
- `api-validation-guide.md`: API endpoint testing details
- `ui-validation-guide.md`: UI testing details
- `test-steps-template.md`: Test step templates and examples

### assets/
- `checklist-template.yaml`: Requirements checklist template
- `report-template.md`: Acceptance report template
- `test-steps-examples.yaml`: Common scenario examples

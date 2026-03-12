---
name: architecture-design
description: Architecture design workflow for AI coding tools with multi-level indexing, context injection, and automatic index maintenance. Use when designing system architecture, creating design documents, planning features, or implementing new functionality. Ensures design-development consistency through structured documentation and mandatory context reading before coding. Trigger on requests like "design this feature", "create architecture for", "plan the implementation", or "design the API".
---

# Architecture Design Workflow

## Overview

Systematic architecture design workflow for AI coding tools with **multi-level indexing**, **mandatory context injection**, and **automatic index maintenance**. Ensures design-development consistency and prevents loss of critical design decisions.

**Key principles**: Human-readable Markdown docs, structured YAML metadata, mandatory context reading, automatic index updates.

## Directory Structure

```
ai-docs/architecture/
├── project-index.yaml                          # Project-level index (YAML for AI)
├── modules/
│   ├── {module-id}/
│   │   ├── index.yaml                          # Module-level index (YAML for AI)
│   │   ├── features/
│   │   │   └── {feature-id}/
│   │   │       └── index.md                    # Feature index (Markdown)
│   │   ├── domain-models/
│   │   │   └── {ModelName}.md                  # Domain model docs
│   │   ├── apis/
│   │   │   └── {api-name}.md                   # API design docs
│   │   └── process-flows/
│   │       └── {flow-name}.md                  # Process flow docs
```

## Workflow

### Step 0: Mandatory Context Injection Before Development (CRITICAL)

**CRITICAL**: Before writing ANY code, MUST read context in this exact order:

#### 0.1 Read Three-Level Indexes

1. **Read Project Index** (`ai-docs/architecture/project-index.yaml`)
   - Understand all modules in the project
   - Identify cross-module dependencies
   - Identify global shared services

2. **Read Module Index** (`ai-docs/architecture/modules/{module-id}/index.yaml`)
   - Understand all features in the module
   - Identify shared domain models
   - Identify module-level APIs

3. **Read Feature Index** (`ai-docs/architecture/modules/{module-id}/features/{feature-id}/index.md`)
   - Understand feature summary (one sentence)
   - Identify required domain models
   - Identify dependencies and provided APIs
   - Identify process flows

#### 0.2 Read Design Documents

Based on feature index's front matter `required_context`, read:
- Domain model documents
- API design documents
- Process flow documents
- Shared service code

#### 0.3 Generate Context Summary

Before coding, generate and display a context summary:

```
Feature: {FEATURE-ID} {Feature Title}

Core Function: {One sentence summary}

Domain Models:
- Model1: {Brief description}
- Model2: {Brief description}

APIs:
- Provides: {List of APIs this feature provides}
- Depends on: {List of APIs this feature depends on}

Process Flows:
- {Flow 1}: {Brief description}
- {Flow 2}: {Brief description}

Shared Services:
- Service1: {Brief description}
- Service2: {Brief description}

Implementation Files:
- Frontend: {File paths}
- Backend: {File paths}

Proceed with implementation? [Yes/Need more info]
```

#### 0.4 Add Design Reference to Code Files (MANDATORY)

**CRITICAL**: Every implementation file MUST include design reference header:

```typescript
/**
 * {Brief description of this file}
 *
 * Design Reference:
 * - Feature: {FEATURE-ID} (ai-docs/architecture/modules/{module}/features/{feature-id}/index.md)
 * - API: {HTTP Method} {Endpoint} (ai-docs/architecture/modules/{module}/apis/{api-name}.md)
 * - Flow: {Flow name} (ai-docs/architecture/modules/{module}/process-flows/{flow-name}.md)
 * - Model: {Model name} (ai-docs/architecture/modules/{module}/domain-models/{Model}.md)
 *
 * Dependencies:
 * - {Service/Model name} ({file path})
 */
```

**Example**:
```typescript
/**
 * User Registration API
 *
 * Design Reference:
 * - Feature: FEAT-USER-001 (ai-docs/architecture/modules/user-management/features/FEAT-USER-001/index.md)
 * - API: POST /api/auth/register (ai-docs/architecture/modules/user-management/apis/register.md)
 * - Flow: User Registration Flow (ai-docs/architecture/modules/user-management/process-flows/user-registration.md)
 * - Model: User (ai-docs/architecture/modules/user-management/domain-models/User.md)
 *
 * Dependencies:
 * - AuthService (services/auth/AuthService.ts)
 * - LoggerService (services/logger/LoggerService.ts)
 */
```

### Step 1: Create/Update Design Documents

#### Document Creation Order

**For new features**:
1. Create domain models (if needed)
2. Create API designs
3. Create process flows
4. Create feature index (auto-references above docs)
5. Update module index
6. Update project index

#### Document Organization

**By module** - Each module contains:
- `features/` - Feature indexes
- `domain-models/` - Domain model documents
- `apis/` - API design documents
- `process-flows/` - Process flow documents

### Step 2: Automatic Index Maintenance (MANDATORY)

**AI MUST automatically update indexes when design documents change.**

#### Triggers

**Create design document**:
- Create domain model → Update module index `domain_models` list
- Create API design → Update module index `apis` list
- Create process flow → Update module index `process_flows` list
- Create feature → Update project index and module index

**Modify design document**:
- Modify domain model's `used_by_features` → Update feature index
- Modify API's `dependencies` → Update cross-module dependencies
- Modify process flow's `cross_module` → Update project index `cross_module_dependencies`

**Delete design document**:
- Check `used_by`/`dependencies` before deletion
- If used by other features, prevent deletion or warn
- After deletion, update all related indexes

#### Update Process

```
1. Detect change type (create/modify/delete)
2. Identify impact scope (which indexes need update)
3. Read related index files
4. Update index content:
   - Add/modify/delete corresponding entries
   - Update last_updated timestamp
   - Update dependency graph
5. Validate index consistency:
   - Check if referenced files exist
   - Check circular dependencies
   - Check orphaned nodes (models not used by any feature)
6. Write updated indexes
```

### Step 3: Design Review Checklist

Before implementation, verify:

- [ ] Domain models match business requirements
- [ ] API designs are complete (basic info + dependencies)
- [ ] Process flows cover all scenarios
- [ ] Cross-module dependencies are clear
- [ ] Indexes are consistent
- [ ] All design docs have proper YAML front matter

### Step 4: Implementation

**CRITICAL**: All code files MUST include design reference header (see Step 0.4)

### Step 5: Implementation Validation

After implementation, verify:

- [ ] Code matches design documents
- [ ] API implementation matches API design
- [ ] Data models match domain models
- [ ] Business flows match process flows

### Step 6: Update Design Documents

**If implementation reveals design needs adjustment**:
1. Update design documents first
2. Update all related indexes simultaneously
3. Record changes in document's change history
4. Then modify code

**CRITICAL**: Never modify code without updating design documents first!

## Index Consistency Checks (MANDATORY)

AI MUST regularly (or on-demand) perform index consistency checks:

### File Existence Check
- All files referenced in indexes must exist
- Action: Alert when missing files detected

### Bidirectional Reference Check
- If A depends on B, then B's `used_by`/`dependencies` must include A
- Action: Auto-fix or alert

### Orphaned Node Check
- Identify models/APIs not used by any feature
- Action: Alert developer to consider deletion or mark as deprecated

### Circular Dependency Check
- Detect A→B→C→A circular dependencies
- Action: Alert, requires manual handling

## Document Format Requirements

### All Design Documents

**MUST include YAML front matter**:
- Structured metadata for AI parsing
- Required fields vary by document type
- See templates in `assets/doc-templates/`

**Body uses Markdown**:
- Human-readable format
- Tables for structured data
- Code blocks for examples
- Clear headings for sections

### Index Files

**Use YAML format**:
- Optimized for AI parsing
- Fast lookup and traversal
- Machine-readable structure

## Best Practices

### 1. Design Before Coding
- Always create design documents first
- Get design reviewed before implementation
- Update design immediately if changes needed

### 2. Keep Documents Focused
- One domain model per file
- One API endpoint per file
- One process flow per file
- Link related documents via references

### 3. Maintain Change History
- Record all changes in document's change history table
- Note breaking changes explicitly
- Include migration guide for breaking changes

### 4. Cross-Module Communication
- Document cross-module dependencies explicitly
- Use event queues for async communication
- Minimize synchronous cross-module calls

### 5. Shared Models and Services
- Identify shared models early (used by multiple features)
- Document which features use which models
- Centralize shared services

## Common Mistakes to Avoid

- ❌ Skipping context injection before coding
- ❌ Modifying code without updating design documents
- ❌ Creating design docs without updating indexes
- ❌ Forgetting to add design reference to code files
- ❌ Duplicating model definitions instead of referencing
- ❌ Not documenting cross-module dependencies
- ❌ Ignoring index consistency check warnings

## Resources

### assets/index-templates/
- `project-index.yaml` - Project-level index template
- `module-index.yaml` - Module-level index template
- `feature-index.md` - Feature-level index template

### assets/doc-templates/
- `domain-model.md` - Domain model document template
- `api-design.md` - API design document template
- `process-flow.md` - Process flow document template

### references/
- `index-maintenance-guide.md` - Detailed index maintenance instructions
- `context-injection-guide.md` - Context injection best practices
- `design-principles.md` - Architecture design principles

## Examples

See `references/design-principles.md` for complete examples of:
- Domain model design
- API design
- Process flow design
- Feature index creation
- Cross-module dependency handling

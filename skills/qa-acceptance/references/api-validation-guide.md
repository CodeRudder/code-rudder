# API Validation Guide

## Overview

This guide provides rules and checklists for validating API endpoints during acceptance testing. Use this for any test step with `method: api`.

## Validation Layers

API validation should be performed in the following order:

### Layer 1: Request Validation

**Checklist**:
```
□ Endpoint URL is correct (protocol, domain, path, query params)
□ HTTP method matches specification
□ Content-Type and Authorization headers correct
□ Request body matches expected schema and types
□ Required fields present, optional fields handled
```

### Layer 2: Response Status Validation

**Status Code Categories**:
- **2xx Success**: 200 OK, 201 Created, 204 No Content
- **4xx Client Error**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Validation Failed
- **5xx Server Error**: 500 Internal Server Error, 503 Service Unavailable

### Layer 3: Response Structure Validation

**Checklist**:
```
□ Response is valid JSON/XML
□ All required fields present, correct types
□ Nested objects and arrays have correct structure
□ Null values and empty collections handled correctly
```

### Layer 4: Response Data Validation

**Checklist**:
```
□ Field values match business rules
□ Calculations are correct
□ Dates in correct format and timezone
□ Enums contain only valid values
□ IDs reference existing resources
□ Pagination, sorting, filtering work correctly
```

### Layer 5: Side Effects Validation

**Checklist**:
```
□ Database record created/updated/deleted correctly
□ All database columns match API input values (for create/update)
□ All database columns match API response values
□ No columns silently ignored or skipped
□ Detect fake updates: API returns success but database unchanged
□ Related records, cache, events, logs handled correctly
```

## Database Column Consistency

For create/update operations, verify:
1. **Input → Database**: All API request fields saved to corresponding database columns
2. **Database → Output**: All database columns reflected in API response
3. **No silent failures**: No fields ignored without error messages

## Fake Update Detection

A "fake update" occurs when an API returns success but doesn't actually modify the database.

**Detection Steps**:
1. Query database before API call (capture current state)
2. Execute API call
3. Verify API response shows success
4. Query database after API call (capture new state)
5. Compare states to ensure database actually changed

**Example**:
```yaml
Before: name='Old Name', email='old@example.com'
API Call: PATCH /api/users/123 { "name": "New Name" }
API Response: 200 OK { "name": "New Name" }
After: name='New Name', email='old@example.com'

✓ name changed (real update)
✗ If After shows 'Old Name' → FAKE UPDATE DETECTED
```

## Complete Example: Update Resource (PATCH)

```yaml
action: Update user name and department
method: api

# Step 1: Capture before state
before_state: |
  SELECT id, name, email, department, updated_at
  FROM users WHERE id = 123

  Result:
  id=123, name='Old Name', email='user@example.com',
  department='Sales', updated_at='2024-01-10T10:00:00Z'

# Step 2-3: Execute API call
details: |
  PATCH /api/users/123
  {
    "name": "Updated Name",
    "department": "Engineering"
  }

expected: |
  Status: 200
  Response: {
    "id": "123",
    "name": "Updated Name",
    "email": "user@example.com",
    "department": "Engineering",
    "updatedAt": "<new-timestamp>"
  }

# Step 4-7: Verify database changes
after_state: |
  SELECT id, name, email, department, updated_at
  FROM users WHERE id = 123

  Result:
  id=123, name='Updated Name', email='user@example.com',
  department='Engineering', updated_at='2024-01-15T14:30:00Z'

verification_points:
  - Status code is 200
  - All request fields reflected in response
  - Database state changed: updated fields match request
  - Unchanged fields remain intact (email not in request)
  - updatedAt timestamp increased
  - NOT a fake update: database actually modified
  - All database columns match API response values
```

## Other Common Scenarios

### Create Resource (POST)
- Send POST with valid data
- Verify 201 Created status
- Verify response contains created resource with ID
- **Verify all input fields saved to database**
- **Verify all database columns match API response**
- Verify timestamps set correctly

### Read Resource (GET)
- Send GET for existing resource
- Verify 200 OK status
- Verify response contains complete resource data
- Verify data matches database state
- Verify no sensitive data exposed

### Delete Resource (DELETE)
- Send DELETE for existing resource
- Verify 204 No Content or 200 OK status
- Verify resource no longer exists in database
- Verify related records handled correctly (cascade/nullify)
- Verify subsequent GET returns 404

### List Resources (GET with pagination)
- Send GET for resource list
- Verify 200 OK status
- Verify response contains array of resources
- Verify pagination metadata correct (page, limit, total, totalPages)
- Verify sorting and filtering work as expected

## Error Handling

### Validation Errors (400/422)
- Send request with invalid data
- Verify 400 or 422 status
- Verify error response contains field-level errors
- Verify error messages are clear and actionable
- Verify no data changes occurred

### Authentication/Authorization Errors (401/403)
- 401: Missing or invalid authentication token
- 403: Authenticated but not authorized for resource
- Verify error message indicates the issue
- Verify no data changes occurred

### Not Found Errors (404)
- Send request for non-existent resource
- Verify 404 status and clear error message
- Verify no unintended side effects

## Documentation Requirements

When documenting API test results, include:

1. **Request Details**: Full URL, HTTP method, headers, request body (sanitize sensitive data)
2. **Response Details**: Status code, response headers, response body, response time
3. **Verification Results**: Each verification point with pass/fail, database state before/after
4. **Failures**: Expected vs actual comparison, error messages, steps to reproduce

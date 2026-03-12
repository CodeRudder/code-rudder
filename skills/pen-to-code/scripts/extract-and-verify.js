/**
 * Extract and Verify Alignment Script (Combined)
 *
 * This script combines coordinate extraction and alignment verification in one call.
 * Compatible with browser_run_script_file MCP tool.
 *
 * Features:
 * - Extracts coordinates for all specified selectors
 * - Continues verification even if some elements are missing
 * - Reports both missing elements and alignment issues
 * - Filters alignment checks to only include found elements
 *
 * Usage:
 * {
 *   "name": "mcp__playwright__browser_run_script_file",
 *   "arguments": {
 *     "filePath": "./.claude/skills/pen-to-code/scripts/extract-and-verify.js",
 *     "params": {
 *       "selectors": {
 *         "saveButton": "#save-btn",
 *         "cancelButton": "#cancel-btn"
 *       },
 *       "expectedAlignments": {
 *         "rows": [["saveButton", "cancelButton"]],
 *         "columns": []
 *       },
 *       "waitForSelector": ".main-content",
 *       "timeout": 5000,
 *       "threshold": 80
 *     }
 *   }
 * }
 *
 * @param {Page} page - Playwright page object
 * @param {Object} params - Parameters object
 * @param {Object} params.selectors - Object mapping component names to CSS selectors
 * @param {Object} params.expectedAlignments - Expected alignments {rows: Array<Array<string>>, columns: Array<Array<string>>}
 * @param {string} [params.waitForSelector] - Optional selector to wait for before extraction
 * @param {number} [params.timeout=5000] - Timeout for waiting (ms)
 * @param {number} [params.threshold=80] - Minimum overlap percentage for alignment (0-100)
 * @returns {Object} Combined result with coordinates, verification results, and issues
 * @returns {boolean} result.success - True if no issues found (no missing elements and all alignments passed)
 * @returns {boolean} result.allPassed - Same as success
 * @returns {Object} result.coordinates - Extracted coordinates for found elements
 * @returns {Object} result.issues - Summary of issues {missingElements: number, alignmentFailures: number}
 * @returns {Array} [result.missing] - List of missing elements (if any)
 * @returns {Object} [result.verification] - Alignment verification results (if enough elements found)
 * @returns {Array} [result.warnings] - Human-readable warning messages
 */
async (page, params) => {
  params = params || {};
  // Import helper functions
  const helpers = require('./utils/alignment-helpers');

  try {
    // Parameter validation
    if (!params.selectors || typeof params.selectors !== 'object') {
      throw new Error('Missing required parameter: selectors (object)');
    }

    if (!params.expectedAlignments || typeof params.expectedAlignments !== 'object') {
      throw new Error('Missing required parameter: expectedAlignments (object)');
    }

    const selectors = params.selectors;
    const expectedAlignments = params.expectedAlignments;
    const waitForSelector = params.waitForSelector;
    const timeout = params.timeout || 5000;
    const threshold = params.threshold || 80;

    // Wait for page to be ready
    if (waitForSelector) {
      console.log(`Waiting for selector: ${waitForSelector}`);
      await page.waitForSelector(waitForSelector, { timeout });
    }

    // Step 1: Extract coordinates
    console.log('Step 1: Extracting coordinates...');

    const getCoordinates = async (selector) => {
      try {
        const locator = page.locator(selector).first();
        const box = await locator.boundingBox();

        if (!box) {
          return null;
        }

        return {
          x: Math.round(box.x * 100) / 100,
          y: Math.round(box.y * 100) / 100,
          width: Math.round(box.width * 100) / 100,
          height: Math.round(box.height * 100) / 100
        };
      } catch (error) {
        console.error(`Error getting coordinates for selector "${selector}":`, error.message);
        return null;
      }
    };

    const coordinates = {};
    const missing = [];

    for (const [name, selector] of Object.entries(selectors)) {
      console.log(`Extracting: ${name} (${selector})`);
      const coords = await getCoordinates(selector);

      if (coords) {
        coordinates[name] = coords;
      } else {
        missing.push({ name, selector });
      }
    }

    // Step 2: Verify alignment (even if some components are missing)
    console.log('Step 2: Verifying alignment...');

    // Filter expectedAlignments to only include components that were found
    const filteredAlignments = {
      rows: [],
      columns: []
    };

    // Filter rows - only include rows where at least 2 components were found
    if (expectedAlignments.rows && Array.isArray(expectedAlignments.rows)) {
      for (const row of expectedAlignments.rows) {
        const availableComponents = row.filter(name => coordinates[name]);
        if (availableComponents.length >= 2) {
          filteredAlignments.rows.push(availableComponents);
        }
      }
    }

    // Filter columns - only include columns where at least 2 components were found
    if (expectedAlignments.columns && Array.isArray(expectedAlignments.columns)) {
      for (const column of expectedAlignments.columns) {
        const availableComponents = column.filter(name => coordinates[name]);
        if (availableComponents.length >= 2) {
          filteredAlignments.columns.push(availableComponents);
        }
      }
    }

    // Validate that at least one direction has alignment checks
    const hasRowChecks = filteredAlignments.rows.length > 0;
    const hasColumnChecks = filteredAlignments.columns.length > 0;

    if (!hasRowChecks && !hasColumnChecks && Object.keys(coordinates).length >= 2) {
      // We have enough elements but no valid alignment checks
      console.warn('WARNING: No valid alignment checks after filtering. This may indicate:');
      console.warn('1. Missing elements prevent alignment verification');
      console.warn('2. expectedAlignments may not match actual page layout');
      console.warn('3. Need to verify both horizontal (rows) AND vertical (columns) layout');
    }

    // Run verification on available components
    let verificationResult = null;
    if (Object.keys(coordinates).length >= 2) {
      verificationResult = helpers.verifyAlignments(coordinates, filteredAlignments, threshold);
    }

    // Check if we're missing critical layout verification
    const layoutWarnings = [];
    let missingCriticalVerification = false;

    if (!hasRowChecks && hasColumnChecks) {
      layoutWarnings.push('No horizontal (row) alignment verified - consider adding row checks for buttons/controls on same line');
    }
    if (hasRowChecks && !hasColumnChecks) {
      // Missing vertical verification is CRITICAL - most pages have vertical layout structure
      layoutWarnings.push('CRITICAL: No vertical (column) alignment verified - page layout structure (Header/Toolbar/Content/Footer) not validated');
      missingCriticalVerification = true;
    }
    if (!hasRowChecks && !hasColumnChecks) {
      layoutWarnings.push('CRITICAL: No layout alignment verified in either direction - must verify page structure');
      missingCriticalVerification = true;
    }

    // Build comprehensive result
    const hasIssues = missing.length > 0 || (verificationResult && !verificationResult.allPassed) || missingCriticalVerification;

    const result = {
      success: !hasIssues,
      allPassed: !hasIssues,
      coordinates,
      issues: {
        missingElements: missing.length,
        alignmentFailures: verificationResult ? verificationResult.summary.failed : 0,
        missingCriticalVerification: missingCriticalVerification ? 1 : 0
      }
    };

    // Add missing elements info if any
    if (missing.length > 0) {
      result.missing = missing;
      result.warnings = result.warnings || [];
      result.warnings.push(`${missing.length} component(s) not found or not visible`);
    }

    // Add verification results if available
    if (verificationResult) {
      result.verification = verificationResult;
      if (!verificationResult.allPassed) {
        result.warnings = result.warnings || [];
        result.warnings.push(`${verificationResult.summary.failed} alignment check(s) failed`);
      }
    } else if (Object.keys(coordinates).length < 2) {
      result.warnings = result.warnings || [];
      result.warnings.push('Not enough components found to verify alignment (need at least 2)');
    }

    // Add layout direction warnings
    if (layoutWarnings.length > 0) {
      result.warnings = result.warnings || [];
      result.warnings.push(...layoutWarnings);
      result.layoutCoverage = {
        hasRowChecks,
        hasColumnChecks,
        recommendation: layoutWarnings[0]
      };
    }

    return result;

  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

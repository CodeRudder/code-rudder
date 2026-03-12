/**
 * Check Component Alignment Script
 *
 * This script checks if components are properly aligned in rows or columns.
 * Compatible with browser_run_script_file MCP tool.
 *
 * Usage:
 * {
 *   "name": "mcp__playwright__browser_run_script_file",
 *   "arguments": {
 *     "filePath": "./.claude/skills/pen-to-code/scripts/check-alignment.js",
 *     "params": {
 *       "components": {
 *         "saveButton": { "x": 100, "y": 200, "width": 80, "height": 32 },
 *         "cancelButton": { "x": 200, "y": 202, "width": 80, "height": 32 }
 *       },
 *       "expectedAlignments": {
 *         "rows": [
 *           ["saveButton", "cancelButton"]
 *         ],
 *         "columns": []
 *       },
 *       "threshold": 80
 *     }
 *   }
 * }
 *
 * @param {Page} page - Playwright page object (not used, but required by signature)
 * @param {Object} params - Parameters object
 * @param {Object} params.components - Object mapping component names to coordinates {x, y, width, height}
 * @param {Object} params.expectedAlignments - Expected alignments {rows: Array<Array<string>>, columns: Array<Array<string>>}
 * @param {number} [params.threshold=80] - Minimum overlap percentage for alignment (0-100)
 * @returns {Object} Verification result with details for each check
 */
async (page, params) => {
  params = params || {};
  // Import helper functions
  const helpers = require('./utils/alignment-helpers');

  try {
    // Parameter validation
    if (!params.components || typeof params.components !== 'object') {
      throw new Error('Missing required parameter: components (object)');
    }

    if (!params.expectedAlignments || typeof params.expectedAlignments !== 'object') {
      throw new Error('Missing required parameter: expectedAlignments (object)');
    }

    const components = params.components;
    const expectedAlignments = params.expectedAlignments;
    const threshold = params.threshold || 80;

    // Use the high-level verifyAlignments function
    const result = helpers.verifyAlignments(components, expectedAlignments, threshold);

    return {
      success: true,
      ...result
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

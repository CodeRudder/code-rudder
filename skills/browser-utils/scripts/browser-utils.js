/**
 * Browser Utility Functions Wrapper for Playwright
 *
 * Wrapper script for browser-utils-core.js to be used with mcp__playwright__browser_run_script_file
 *
 * Usage:
 * mcp__playwright__browser_run_script_file({
 *   filePath: "./.claude/skills/pen-to-code/scripts/browser-utils.js",
 *   params: {
 *     action: "actionName",
 *     // ... action-specific parameters
 *   }
 * })
 *
 * Available actions:
 * - findElement: Find single element and get info
 * - findElements: Find multiple elements
 * - getElementPositions: Get positions/dimensions
 * - getFormValues: Get form field values
 * - fillForm: Fill multiple form fields
 * - clickSequence: Click elements in sequence
 * - getElementHierarchy: Get parent/child hierarchy
 * - waitForElements: Wait for elements to be visible
 * - checkElementsExist: Check if elements exist
 * - getComputedStyles: Get computed CSS styles
 *
 * @param {Page} page - Playwright page object
 * @param {Object} params - Parameters object with action and action-specific params
 * @returns {Object} Action-specific result
 */
async (page, params) => {
  const { action } = params;

  // Import core utilities
  const utils = require('./utils/browser-utils-core.js');

  // Dispatch to appropriate utility function
  switch (action) {
    case 'findElement':
      return await utils.findElement(page, params);

    case 'findElements':
      return await utils.findElements(page, params);

    case 'getElementPositions':
      return await utils.getElementPositions(page, params);

    case 'getFormValues':
      return await utils.getFormValues(page, params);

    case 'fillForm':
      return await utils.fillForm(page, params);

    case 'clickSequence':
      return await utils.clickSequence(page, params);

    case 'getElementHierarchy':
      return await utils.getElementHierarchy(page, params);

    case 'waitForElements':
      return await utils.waitForElements(page, params);

    case 'checkElementsExist':
      return await utils.checkElementsExist(page, params);

    case 'getComputedStyles':
      return await utils.getComputedStyles(page, params);

    default:
      throw new Error(`Unknown action: ${action}. Available actions: findElement, findElements, getElementPositions, getFormValues, fillForm, clickSequence, getElementHierarchy, waitForElements, checkElementsExist, getComputedStyles`);
  }
}

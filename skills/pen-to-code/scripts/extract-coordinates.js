/**
 * Extract Component Coordinates Script
 *
 * This script extracts coordinates (x, y, width, height) for specified components.
 * Compatible with browser_run_script_file MCP tool.
 *
 * Usage:
 * {
 *   "name": "mcp__playwright__browser_run_script_file",
 *   "arguments": {
 *     "filePath": "./.claude/skills/pen-to-code/scripts/extract-coordinates.js",
 *     "params": {
 *       "selectors": {
 *         "saveButton": "#save-btn",
 *         "cancelButton": "#cancel-btn",
 *         "searchInput": "#search-input"
 *       },
 *       "waitForSelector": ".main-content",
 *       "timeout": 5000
 *     }
 *   }
 * }
 *
 * @param {Page} page - Playwright page object
 * @param {Object} params - Parameters object
 * @param {Object} params.selectors - Object mapping component names to CSS selectors
 * @param {string} [params.waitForSelector] - Optional selector to wait for before extraction
 * @param {number} [params.timeout=5000] - Timeout for waiting (ms)
 * @returns {Object} Result with coordinates for each component
 */
async (page, params) => {
  params = params || {};
  try {
    // Parameter validation
    if (!params.selectors || typeof params.selectors !== 'object') {
      throw new Error('Missing required parameter: selectors (object)');
    }

    const selectors = params.selectors;
    const waitForSelector = params.waitForSelector;
    const timeout = params.timeout || 5000;

    // Wait for page to be ready
    if (waitForSelector) {
      console.log(`Waiting for selector: ${waitForSelector}`);
      await page.waitForSelector(waitForSelector, { timeout });
    }

    // Helper function to get coordinates for a single component
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

    // Extract coordinates for all components
    const coordinates = {};
    const missing = [];

    for (const [name, selector] of Object.entries(selectors)) {
      console.log(`Extracting coordinates for: ${name} (${selector})`);
      const coords = await getCoordinates(selector);

      if (coords) {
        coordinates[name] = coords;
      } else {
        missing.push({ name, selector });
      }
    }

    // Build result
    const result = {
      success: true,
      coordinates,
      summary: {
        total: Object.keys(selectors).length,
        extracted: Object.keys(coordinates).length,
        missing: missing.length
      }
    };

    if (missing.length > 0) {
      result.missing = missing;
      result.warning = `${missing.length} component(s) not found or not visible`;
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

/**
 * Helper function to extract component coordinates from Playwright page
 *
 * Usage in Playwright test:
 *
 * const { getComponentCoordinates } = require('./get-coordinates-helper');
 *
 * test('verify layout alignment', async ({ page }) => {
 *   // 1. Navigate and perform business operations
 *   await page.goto('http://localhost:3000');
 *   await page.click('#login-btn');
 *   await page.fill('#username', 'testuser');
 *   await page.click('#submit');
 *   await page.waitForSelector('.dashboard');
 *
 *   // 2. Get component coordinates
 *   const selectors = {
 *     saveButton: '#save-btn',
 *     cancelButton: '#cancel-btn',
 *     deleteButton: '#delete-btn'
 *   };
 *   const coordinates = await getComponentCoordinates(page, selectors);
 *
 *   // 3. Save to file for alignment verification
 *   const fs = require('fs');
 *   const config = {
 *     components: coordinates,
 *     expectedAlignments: {
 *       rows: [['saveButton', 'cancelButton', 'deleteButton']]
 *     }
 *   };
 *   fs.writeFileSync('alignment-check.json', JSON.stringify(config, null, 2));
 *
 *   // 4. Run alignment verification script
 *   const { execSync } = require('child_process');
 *   execSync('node scripts/check-alignment-with-playwright.js alignment-check.json');
 * });
 */

/**
 * Extract coordinates for multiple elements
 * @param {Page} page - Playwright page object
 * @param {Object} selectors - Map of component names to CSS selectors
 * @returns {Promise<Object>} Map of component names to coordinates
 */
async function getComponentCoordinates(page, selectors) {
  const coordinates = {};

  for (const [name, selector] of Object.entries(selectors)) {
    try {
      const element = await page.locator(selector).first();
      const box = await element.boundingBox();

      if (box) {
        coordinates[name] = {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height)
        };
      } else {
        console.warn(`Warning: Element "${name}" (${selector}) not visible`);
      }
    } catch (error) {
      console.warn(`Warning: Element "${name}" (${selector}) not found: ${error.message}`);
    }
  }

  return coordinates;
}

module.exports = { getComponentCoordinates };

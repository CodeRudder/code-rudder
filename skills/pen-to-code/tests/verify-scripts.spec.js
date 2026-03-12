/**
 * Test script to verify pen-to-code skill scripts work correctly
 *
 * This script tests:
 * 1. extract-coordinates.js
 * 2. check-alignment.js
 * 3. extract-and-verify.js
 * 4. utils/alignment-helpers.js
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('pen-to-code skill scripts verification', () => {

  test('verify extract-coordinates.js works', async ({ page }) => {
    // Create a simple test page
    await page.setContent(`
      <html>
        <body>
          <div id="button1" style="position: absolute; left: 100px; top: 200px; width: 80px; height: 32px;">Button 1</div>
          <div id="button2" style="position: absolute; left: 200px; top: 202px; width: 80px; height: 32px;">Button 2</div>
          <div id="button3" style="position: absolute; left: 100px; top: 300px; width: 80px; height: 32px;">Button 3</div>
        </body>
      </html>
    `);

    // Load and execute extract-coordinates.js
    const extractCoordinates = require('../scripts/extract-coordinates.js');

    const result = await extractCoordinates(page, {
      selectors: {
        button1: '#button1',
        button2: '#button2',
        button3: '#button3'
      }
    });

    console.log('Extract coordinates result:', JSON.stringify(result, null, 2));

    // Verify result structure
    expect(result.success).toBe(true);
    expect(result.coordinates).toBeDefined();
    expect(result.coordinates.button1).toBeDefined();
    expect(result.coordinates.button2).toBeDefined();
    expect(result.coordinates.button3).toBeDefined();

    // Verify coordinates are numbers
    expect(typeof result.coordinates.button1.x).toBe('number');
    expect(typeof result.coordinates.button1.y).toBe('number');
    expect(typeof result.coordinates.button1.width).toBe('number');
    expect(typeof result.coordinates.button1.height).toBe('number');

    console.log('✅ extract-coordinates.js works correctly');
  });

  test('verify check-alignment.js works', async ({ page }) => {
    // Load check-alignment.js
    const checkAlignment = require('../scripts/check-alignment.js');

    const result = await checkAlignment(page, {
      components: {
        button1: { x: 100, y: 200, width: 80, height: 32 },
        button2: { x: 200, y: 202, width: 80, height: 32 },
        button3: { x: 100, y: 300, width: 80, height: 32 }
      },
      expectedAlignments: {
        rows: [
          ['button1', 'button2']  // Should be aligned (Y: 200 vs 202, diff: 2px)
        ],
        columns: [
          ['button1', 'button3']  // Should be aligned (X: 100 vs 100, diff: 0px)
        ]
      },
      threshold: 80
    });

    console.log('Check alignment result:', JSON.stringify(result, null, 2));

    // Verify result structure
    expect(result.success).toBe(true);
    expect(result.allPassed).toBe(true);
    expect(result.summary).toBeDefined();
    expect(result.summary.total).toBe(2); // 1 row + 1 column
    expect(result.summary.passed).toBe(2);
    expect(result.summary.failed).toBe(0);

    console.log('✅ check-alignment.js works correctly');
  });

  test('verify check-alignment.js detects misalignment', async ({ page }) => {
    const checkAlignment = require('../scripts/check-alignment.js');

    const result = await checkAlignment(page, {
      components: {
        button1: { x: 100, y: 200, width: 80, height: 32 },
        button2: { x: 200, y: 250, width: 80, height: 32 }  // Misaligned (Y diff: 50px)
      },
      expectedAlignments: {
        rows: [
          ['button1', 'button2']  // Should fail
        ],
        columns: []
      },
      threshold: 80
    });

    console.log('Misalignment detection result:', JSON.stringify(result, null, 2));

    // Verify it detects the misalignment
    expect(result.success).toBe(true);
    expect(result.allPassed).toBe(false);
    expect(result.summary.failed).toBe(1);
    expect(result.failures).toBeDefined();
    expect(result.failures.length).toBe(1);
    expect(result.failures[0].reason).toBe('Y-axis misalignment');

    console.log('✅ check-alignment.js correctly detects misalignment');
  });

  test('verify extract-and-verify.js works (combined)', async ({ page }) => {
    // Create test page
    await page.setContent(`
      <html>
        <body>
          <div id="save-btn" style="position: absolute; left: 100px; top: 200px; width: 80px; height: 32px;">Save</div>
          <div id="cancel-btn" style="position: absolute; left: 200px; top: 200px; width: 80px; height: 32px;">Cancel</div>
        </body>
      </html>
    `);

    // Load extract-and-verify.js
    const extractAndVerify = require('../scripts/extract-and-verify.js');

    const result = await extractAndVerify(page, {
      selectors: {
        saveButton: '#save-btn',
        cancelButton: '#cancel-btn'
      },
      expectedAlignments: {
        rows: [
          ['saveButton', 'cancelButton']
        ],
        columns: []
      },
      threshold: 80
    });

    console.log('Extract and verify result:', JSON.stringify(result, null, 2));

    // Verify result structure
    expect(result.success).toBe(true);
    expect(result.allPassed).toBe(true);
    expect(result.coordinates).toBeDefined();
    expect(result.coordinates.saveButton).toBeDefined();
    expect(result.coordinates.cancelButton).toBeDefined();
    expect(result.verification).toBeDefined();
    expect(result.verification.summary.total).toBe(1);
    expect(result.verification.summary.passed).toBe(1);

    console.log('✅ extract-and-verify.js works correctly');
  });

  test('verify extract-and-verify.js handles missing elements', async ({ page }) => {
    // Create test page with only 2 out of 3 elements
    await page.setContent(`
      <html>
        <body>
          <div id="save-btn" style="position: absolute; left: 100px; top: 200px; width: 80px; height: 32px;">Save</div>
          <div id="cancel-btn" style="position: absolute; left: 200px; top: 200px; width: 80px; height: 32px;">Cancel</div>
          <!-- delete-btn is missing -->
        </body>
      </html>
    `);

    const extractAndVerify = require('../scripts/extract-and-verify.js');

    const result = await extractAndVerify(page, {
      selectors: {
        saveButton: '#save-btn',
        cancelButton: '#cancel-btn',
        deleteButton: '#delete-btn'  // This element doesn't exist
      },
      expectedAlignments: {
        rows: [
          ['saveButton', 'cancelButton', 'deleteButton']
        ],
        columns: []
      },
      threshold: 80
    });

    console.log('Extract and verify with missing element:', JSON.stringify(result, null, 2));

    // Verify result structure
    expect(result.success).toBe(false);  // Should fail because element is missing
    expect(result.allPassed).toBe(false);
    expect(result.issues).toBeDefined();
    expect(result.issues.missingElements).toBe(1);
    expect(result.missing).toBeDefined();
    expect(result.missing.length).toBe(1);
    expect(result.missing[0].name).toBe('deleteButton');
    expect(result.warnings).toBeDefined();
    expect(result.warnings.length).toBeGreaterThan(0);

    // Should still have coordinates for found elements
    expect(result.coordinates.saveButton).toBeDefined();
    expect(result.coordinates.cancelButton).toBeDefined();
    expect(result.coordinates.deleteButton).toBeUndefined();

    // Should still verify alignment for found elements
    expect(result.verification).toBeDefined();
    expect(result.verification.summary.total).toBe(1);  // Only 1 row with 2 elements
    expect(result.verification.summary.passed).toBe(1);

    console.log('✅ extract-and-verify.js handles missing elements correctly');
  });

  test('verify extract-and-verify.js with missing elements and misalignment', async ({ page }) => {
    // Create test page with missing element AND misaligned elements
    await page.setContent(`
      <html>
        <body>
          <div id="save-btn" style="position: absolute; left: 100px; top: 200px; width: 80px; height: 32px;">Save</div>
          <div id="cancel-btn" style="position: absolute; left: 200px; top: 250px; width: 80px; height: 32px;">Cancel</div>
          <!-- delete-btn is missing -->
        </body>
      </html>
    `);

    const extractAndVerify = require('../scripts/extract-and-verify.js');

    const result = await extractAndVerify(page, {
      selectors: {
        saveButton: '#save-btn',
        cancelButton: '#cancel-btn',
        deleteButton: '#delete-btn'  // Missing
      },
      expectedAlignments: {
        rows: [
          ['saveButton', 'cancelButton', 'deleteButton']
        ],
        columns: []
      },
      threshold: 80
    });

    console.log('Extract and verify with missing + misalignment:', JSON.stringify(result, null, 2));

    // Verify result structure
    expect(result.success).toBe(false);
    expect(result.allPassed).toBe(false);
    expect(result.issues.missingElements).toBe(1);
    expect(result.issues.alignmentFailures).toBe(1);  // saveButton and cancelButton are misaligned
    expect(result.warnings.length).toBe(2);  // Both missing element and alignment failure

    // Should report both issues
    expect(result.missing.length).toBe(1);
    expect(result.verification.summary.failed).toBe(1);

    console.log('✅ extract-and-verify.js reports both missing elements and misalignment');
  });

  test('verify extract-and-verify.js with insufficient elements', async ({ page }) => {
    // Create test page with only 1 element (need at least 2 for alignment check)
    await page.setContent(`
      <html>
        <body>
          <div id="save-btn" style="position: absolute; left: 100px; top: 200px; width: 80px; height: 32px;">Save</div>
        </body>
      </html>
    `);

    const extractAndVerify = require('../scripts/extract-and-verify.js');

    const result = await extractAndVerify(page, {
      selectors: {
        saveButton: '#save-btn',
        cancelButton: '#cancel-btn',
        deleteButton: '#delete-btn'
      },
      expectedAlignments: {
        rows: [
          ['saveButton', 'cancelButton', 'deleteButton']
        ],
        columns: []
      },
      threshold: 80
    });

    console.log('Extract and verify with insufficient elements:', JSON.stringify(result, null, 2));

    // Verify result structure
    expect(result.success).toBe(false);
    expect(result.issues.missingElements).toBe(2);
    expect(result.missing.length).toBe(2);
    expect(result.coordinates.saveButton).toBeDefined();
    expect(result.verification).toBeNull();  // No verification because < 2 elements
    expect(result.warnings).toContain('Not enough components found to verify alignment (need at least 2)');

    console.log('✅ extract-and-verify.js handles insufficient elements correctly');
  });

  test('verify extract-and-verify.js warns about missing vertical layout checks', async ({ page }) => {
    // Create test page with horizontal layout only
    await page.setContent(`
      <html>
        <body>
          <div id="save-btn" style="position: absolute; left: 100px; top: 200px; width: 80px; height: 32px;">Save</div>
          <div id="cancel-btn" style="position: absolute; left: 200px; top: 200px; width: 80px; height: 32px;">Cancel</div>
        </body>
      </html>
    `);

    const extractAndVerify = require('../scripts/extract-and-verify.js');

    const result = await extractAndVerify(page, {
      selectors: {
        saveButton: '#save-btn',
        cancelButton: '#cancel-btn'
      },
      expectedAlignments: {
        rows: [
          ['saveButton', 'cancelButton']  // Only horizontal check
        ],
        columns: []  // No vertical check
      },
      threshold: 80
    });

    console.log('Extract and verify with only horizontal checks:', JSON.stringify(result, null, 2));

    // Should FAIL because missing critical vertical verification
    expect(result.success).toBe(false);
    expect(result.allPassed).toBe(false);
    expect(result.issues.missingCriticalVerification).toBe(1);
    expect(result.layoutCoverage).toBeDefined();
    expect(result.layoutCoverage.hasRowChecks).toBe(true);
    expect(result.layoutCoverage.hasColumnChecks).toBe(false);
    expect(result.warnings).toContain('CRITICAL: No vertical (column) alignment verified - page layout structure (Header/Toolbar/Content/Footer) not validated');

    console.log('✅ extract-and-verify.js FAILS when missing vertical layout checks');
  });

  test('verify extract-and-verify.js warns about missing horizontal layout checks', async ({ page }) => {
    // Create test page with vertical layout only
    await page.setContent(`
      <html>
        <body>
          <div id="header" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 64px;">Header</div>
          <div id="content" style="position: absolute; left: 0px; top: 64px; width: 100%; height: 400px;">Content</div>
          <div id="footer" style="position: absolute; left: 0px; top: 464px; width: 100%; height: 80px;">Footer</div>
        </body>
      </html>
    `);

    const extractAndVerify = require('../scripts/extract-and-verify.js');

    const result = await extractAndVerify(page, {
      selectors: {
        header: '#header',
        content: '#content',
        footer: '#footer'
      },
      expectedAlignments: {
        rows: [],  // No horizontal check
        columns: [
          ['header', 'content', 'footer']  // Only vertical check
        ]
      },
      threshold: 80
    });

    console.log('Extract and verify with only vertical checks:', JSON.stringify(result, null, 2));

    // Should pass but warn about missing horizontal checks
    expect(result.success).toBe(true);
    expect(result.layoutCoverage).toBeDefined();
    expect(result.layoutCoverage.hasRowChecks).toBe(false);
    expect(result.layoutCoverage.hasColumnChecks).toBe(true);
    expect(result.warnings).toContain('No horizontal (row) alignment verified - consider adding row checks for buttons/controls on same line');

    console.log('✅ extract-and-verify.js warns about missing horizontal layout checks');
  });

  test('verify extract-and-verify.js with complete layout verification', async ({ page }) => {
    // Create test page with both horizontal and vertical layout
    await page.setContent(`
      <html>
        <body>
          <div id="header" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 64px;">Header</div>
          <div id="save-btn" style="position: absolute; left: 100px; top: 100px; width: 80px; height: 32px;">Save</div>
          <div id="cancel-btn" style="position: absolute; left: 200px; top: 100px; width: 80px; height: 32px;">Cancel</div>
          <div id="footer" style="position: absolute; left: 0px; top: 200px; width: 100%; height: 80px;">Footer</div>
        </body>
      </html>
    `);

    const extractAndVerify = require('../scripts/extract-and-verify.js');

    const result = await extractAndVerify(page, {
      selectors: {
        header: '#header',
        saveButton: '#save-btn',
        cancelButton: '#cancel-btn',
        footer: '#footer'
      },
      expectedAlignments: {
        rows: [
          ['saveButton', 'cancelButton']  // Horizontal check
        ],
        columns: [
          ['header', 'footer']  // Vertical check
        ]
      },
      threshold: 80
    });

    console.log('Extract and verify with complete layout:', JSON.stringify(result, null, 2));

    // Should pass without layout warnings
    expect(result.success).toBe(true);
    expect(result.layoutCoverage).toBeUndefined();  // No warnings means no layoutCoverage
    const layoutWarnings = result.warnings?.filter(w =>
      w.includes('horizontal') || w.includes('vertical') || w.includes('CRITICAL')
    ) || [];
    expect(layoutWarnings.length).toBe(0);

    console.log('✅ extract-and-verify.js works correctly with complete layout verification');
  });

  test('verify alignment-helpers.js verifyAlignments function', async () => {
    const helpers = require('../scripts/utils/alignment-helpers.js');

    const result = helpers.verifyAlignments(
      {
        button1: { x: 100, y: 200, width: 80, height: 32 },
        button2: { x: 200, y: 200, width: 80, height: 32 },
        button3: { x: 100, y: 300, width: 80, height: 32 }
      },
      {
        rows: [
          ['button1', 'button2']
        ],
        columns: [
          ['button1', 'button3']
        ]
      },
      80
    );

    console.log('verifyAlignments result:', JSON.stringify(result, null, 2));

    // Verify result
    expect(result.allPassed).toBe(true);
    expect(result.summary.total).toBe(2);
    expect(result.summary.passed).toBe(2);
    expect(result.summary.failed).toBe(0);

    console.log('✅ alignment-helpers.js verifyAlignments works correctly');
  });

  test('verify alignment-helpers.js individual functions', async () => {
    const helpers = require('../scripts/utils/alignment-helpers.js');

    // Test calculateOverlap
    const overlap = helpers.calculateOverlap(100, 132, 102, 134);
    expect(overlap).toBeGreaterThan(90); // Should be ~93.75%
    console.log('calculateOverlap result:', overlap);

    // Test checkRowAlignment
    const rowResult = helpers.checkRowAlignment([
      { name: 'btn1', x: 100, y: 200, width: 80, height: 32 },
      { name: 'btn2', x: 200, y: 202, width: 80, height: 32 }
    ], 80);
    expect(rowResult.aligned).toBe(true);
    console.log('checkRowAlignment result:', rowResult);

    // Test checkColumnAlignment
    const colResult = helpers.checkColumnAlignment([
      { name: 'btn1', x: 100, y: 200, width: 80, height: 32 },
      { name: 'btn3', x: 100, y: 300, width: 80, height: 32 }
    ], 80);
    expect(colResult.aligned).toBe(true);
    console.log('checkColumnAlignment result:', colResult);

    // Test checkOrdering
    const orderResult = helpers.checkOrdering([
      { name: 'btn1', x: 100, y: 200, width: 80, height: 32 },
      { name: 'btn2', x: 200, y: 200, width: 80, height: 32 }
    ], 'horizontal');
    expect(orderResult.ordered).toBe(true);
    console.log('checkOrdering result:', orderResult);

    // Test validateComponent
    const valid = helpers.validateComponent({
      name: 'btn1',
      x: 100,
      y: 200,
      width: 80,
      height: 32
    });
    expect(valid).toBe(true);
    console.log('validateComponent result:', valid);

    console.log('✅ All alignment-helpers.js functions work correctly');
  });
});

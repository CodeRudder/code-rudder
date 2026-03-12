/**
 * Alignment Helper Functions
 *
 * Provides utility functions for checking component alignment in UI layouts.
 * Used by check-alignment.js script.
 */

/**
 * Calculate overlap percentage between two ranges
 * @param {number} start1 - Start of first range
 * @param {number} end1 - End of first range
 * @param {number} start2 - Start of second range
 * @param {number} end2 - End of second range
 * @returns {number} Overlap percentage (0-100)
 */
function calculateOverlap(start1, end1, start2, end2) {
  const overlapStart = Math.max(start1, start2);
  const overlapEnd = Math.min(end1, end2);
  const overlap = Math.max(0, overlapEnd - overlapStart);

  const range1 = end1 - start1;
  const range2 = end2 - start2;
  const minRange = Math.min(range1, range2);

  return minRange > 0 ? (overlap / minRange) * 100 : 0;
}

/**
 * Check if components are aligned in a row (Y-axis overlap)
 * @param {Array<Object>} components - Array of component coordinates {name, x, y, width, height}
 * @param {number} threshold - Minimum overlap percentage (default: 80)
 * @returns {Object} Result with {aligned: boolean, details: Array}
 */
function checkRowAlignment(components, threshold = 80) {
  if (components.length < 2) {
    return { aligned: true, details: [] };
  }

  const details = [];

  for (let i = 0; i < components.length - 1; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const comp1 = components[i];
      const comp2 = components[j];

      const overlap = calculateOverlap(
        comp1.y,
        comp1.y + comp1.height,
        comp2.y,
        comp2.y + comp2.height
      );

      const aligned = overlap >= threshold;

      details.push({
        components: [comp1.name, comp2.name],
        overlap: Math.round(overlap * 100) / 100,
        aligned,
        yCoords: [comp1.y, comp2.y],
        yDiff: Math.abs(comp1.y - comp2.y)
      });

      if (!aligned) {
        return { aligned: false, details };
      }
    }
  }

  return { aligned: true, details };
}

/**
 * Check if components are aligned in a column (X-axis overlap)
 * @param {Array<Object>} components - Array of component coordinates {name, x, y, width, height}
 * @param {number} threshold - Minimum overlap percentage (default: 80)
 * @returns {Object} Result with {aligned: boolean, details: Array}
 */
function checkColumnAlignment(components, threshold = 80) {
  if (components.length < 2) {
    return { aligned: true, details: [] };
  }

  const details = [];

  for (let i = 0; i < components.length - 1; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const comp1 = components[i];
      const comp2 = components[j];

      const overlap = calculateOverlap(
        comp1.x,
        comp1.x + comp1.width,
        comp2.x,
        comp2.x + comp2.width
      );

      const aligned = overlap >= threshold;

      details.push({
        components: [comp1.name, comp2.name],
        overlap: Math.round(overlap * 100) / 100,
        aligned,
        xCoords: [comp1.x, comp2.x],
        xDiff: Math.abs(comp1.x - comp2.x)
      });

      if (!aligned) {
        return { aligned: false, details };
      }
    }
  }

  return { aligned: true, details };
}

/**
 * Check if components are ordered correctly (left-to-right for rows, top-to-bottom for columns)
 * @param {Array<Object>} components - Array of component coordinates {name, x, y, width, height}
 * @param {string} direction - 'horizontal' for left-to-right, 'vertical' for top-to-bottom
 * @returns {Object} Result with {ordered: boolean, details: Array}
 */
function checkOrdering(components, direction = 'horizontal') {
  if (components.length < 2) {
    return { ordered: true, details: [] };
  }

  const details = [];
  const coord = direction === 'horizontal' ? 'x' : 'y';

  for (let i = 0; i < components.length - 1; i++) {
    const comp1 = components[i];
    const comp2 = components[i + 1];

    const ordered = comp1[coord] < comp2[coord];

    details.push({
      components: [comp1.name, comp2.name],
      ordered,
      coords: [comp1[coord], comp2[coord]],
      direction
    });

    if (!ordered) {
      return { ordered: false, details };
    }
  }

  return { ordered: true, details };
}

/**
 * Validate component coordinates
 * @param {Object} component - Component with {name, x, y, width, height}
 * @returns {boolean} True if valid
 */
function validateComponent(component) {
  return (
    component &&
    typeof component.name === 'string' &&
    typeof component.x === 'number' &&
    typeof component.y === 'number' &&
    typeof component.width === 'number' &&
    typeof component.height === 'number' &&
    component.width > 0 &&
    component.height > 0
  );
}

/**
 * Verify alignment for all expected alignments
 * High-level function that orchestrates the entire verification process
 *
 * @param {Object} components - Object mapping component names to coordinates {x, y, width, height}
 * @param {Object} expectedAlignments - Expected alignments {rows: Array<Array<string>>, columns: Array<Array<string>>}
 * @param {number} threshold - Minimum overlap percentage (default: 80)
 * @returns {Object} Complete verification result
 */
function verifyAlignments(components, expectedAlignments, threshold = 80) {
  // Validate all components
  const invalidComponents = [];
  for (const [name, coords] of Object.entries(components)) {
    if (!validateComponent({ name, ...coords })) {
      invalidComponents.push(name);
    }
  }

  if (invalidComponents.length > 0) {
    throw new Error(`Invalid component coordinates: ${invalidComponents.join(', ')}`);
  }

  // Check row alignments
  const rowResults = [];
  if (expectedAlignments.rows && Array.isArray(expectedAlignments.rows)) {
    for (let i = 0; i < expectedAlignments.rows.length; i++) {
      const rowNames = expectedAlignments.rows[i];

      // Get component coordinates
      const rowComponents = rowNames.map(name => ({
        name,
        ...components[name]
      }));

      // Check alignment
      const alignmentResult = checkRowAlignment(rowComponents, threshold);

      // Check ordering (left-to-right)
      const orderingResult = checkOrdering(rowComponents, 'horizontal');

      const passed = alignmentResult.aligned && orderingResult.ordered;

      rowResults.push({
        rowIndex: i,
        components: rowNames,
        passed,
        alignment: alignmentResult,
        ordering: orderingResult
      });
    }
  }

  // Check column alignments
  const columnResults = [];
  if (expectedAlignments.columns && Array.isArray(expectedAlignments.columns)) {
    for (let i = 0; i < expectedAlignments.columns.length; i++) {
      const columnNames = expectedAlignments.columns[i];

      // Get component coordinates
      const columnComponents = columnNames.map(name => ({
        name,
        ...components[name]
      }));

      // Check alignment
      const alignmentResult = checkColumnAlignment(columnComponents, threshold);

      // Check ordering (top-to-bottom)
      const orderingResult = checkOrdering(columnComponents, 'vertical');

      const passed = alignmentResult.aligned && orderingResult.ordered;

      columnResults.push({
        columnIndex: i,
        components: columnNames,
        passed,
        alignment: alignmentResult,
        ordering: orderingResult
      });
    }
  }

  // Calculate summary
  const totalChecks = rowResults.length + columnResults.length;
  const passedChecks = [
    ...rowResults.filter(r => r.passed),
    ...columnResults.filter(c => c.passed)
  ].length;
  const failedChecks = totalChecks - passedChecks;

  const allPassed = failedChecks === 0;

  // Build result
  const result = {
    allPassed,
    summary: {
      total: totalChecks,
      passed: passedChecks,
      failed: failedChecks,
      threshold
    },
    rows: rowResults,
    columns: columnResults
  };

  // Add failure details if any
  if (!allPassed) {
    result.failures = [
      ...rowResults.filter(r => !r.passed).map(r => ({
        type: 'row',
        index: r.rowIndex,
        components: r.components,
        reason: !r.alignment.aligned ? 'Y-axis misalignment' : 'Incorrect ordering'
      })),
      ...columnResults.filter(c => !c.passed).map(c => ({
        type: 'column',
        index: c.columnIndex,
        components: c.components,
        reason: !c.alignment.aligned ? 'X-axis misalignment' : 'Incorrect ordering'
      }))
    ];
  }

  return result;
}

module.exports = {
  calculateOverlap,
  checkRowAlignment,
  checkColumnAlignment,
  checkOrdering,
  validateComponent,
  verifyAlignments
};

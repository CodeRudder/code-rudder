/**
 * Browser Utility Core Functions
 *
 * Core utility functions for browser operations.
 * These functions are called by browser-utils.js wrapper.
 */

/**
 * Find and return element information by selector
 */
async function findElement(page, params) {
  const { selector } = params;
  const element = await page.$(selector);

  if (!element) {
    return { found: false, selector };
  }

  const box = await element.boundingBox();
  const text = await element.textContent();
  const tagName = await element.evaluate(el => el.tagName.toLowerCase());
  const attributes = await element.evaluate(el => {
    const attrs = {};
    for (const attr of el.attributes) {
      attrs[attr.name] = attr.value;
    }
    return attrs;
  });

  return {
    found: true,
    selector,
    tagName,
    text: text?.trim(),
    box,
    attributes
  };
}

/**
 * Find multiple elements and return their information
 */
async function findElements(page, params) {
  const { selectors } = params;
  const results = {};

  for (const [name, selector] of Object.entries(selectors)) {
    results[name] = await findElement(page, { selector });
  }

  return results;
}

/**
 * Get positions and dimensions of multiple elements
 */
async function getElementPositions(page, params) {
  const { selectors } = params;
  const results = {};

  for (const [name, selector] of Object.entries(selectors)) {
    const element = await page.$(selector);
    if (element) {
      const box = await element.boundingBox();
      results[name] = box ? {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
      } : null;
    } else {
      results[name] = null;
    }
  }

  return results;
}

/**
 * Get values from multiple form elements
 */
async function getFormValues(page, params) {
  const { selectors } = params;
  const results = {};

  for (const [name, selector] of Object.entries(selectors)) {
    const element = await page.$(selector);
    if (element) {
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const type = await element.evaluate(el => el.type);

      if (tagName === 'input' && (type === 'checkbox' || type === 'radio')) {
        results[name] = await element.isChecked();
      } else if (tagName === 'select') {
        results[name] = await element.evaluate(el => el.value);
      } else {
        results[name] = await element.inputValue().catch(() =>
          element.textContent()
        );
      }
    } else {
      results[name] = null;
    }
  }

  return results;
}

/**
 * Fill multiple form fields
 */
async function fillForm(page, params) {
  const { fields } = params;
  const results = [];

  for (const field of fields) {
    const { selector, value, type } = field;

    try {
      // Fill the field
      if (type === 'checkbox' || type === 'radio') {
        await page.setChecked(selector, value);
      } else if (type === 'select') {
        await page.selectOption(selector, value);
      } else {
        await page.fill(selector, value);
      }

      // Read back the actual value from DOM
      const element = await page.$(selector);
      let actualValue = null;

      if (element) {
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        const inputType = await element.evaluate(el => el.type);

        if (tagName === 'input' && (inputType === 'checkbox' || inputType === 'radio')) {
          actualValue = await element.isChecked();
        } else if (tagName === 'select') {
          actualValue = await element.evaluate(el => el.value);
        } else if (tagName === 'input' || tagName === 'textarea') {
          actualValue = await element.inputValue();
        } else {
          actualValue = await element.textContent();
        }
      }

      results.push({
        selector,
        success: true,
        expectedValue: value,
        actualValue: actualValue,
        matched: actualValue === value || (type === 'checkbox' && actualValue === value)
      });
    } catch (error) {
      results.push({
        selector,
        success: false,
        expectedValue: value,
        actualValue: null,
        matched: false,
        error: error.message
      });
    }
  }

  return { results };
}

/**
 * Click multiple elements in sequence
 */
async function clickSequence(page, params) {
  const { selectors, waitBetween = 100 } = params;
  const results = [];

  for (const selector of selectors) {
    try {
      await page.click(selector);
      results.push({ selector, success: true });
      if (waitBetween > 0) {
        await page.waitForTimeout(waitBetween);
      }
    } catch (error) {
      results.push({ selector, success: false, error: error.message });
    }
  }

  return { results };
}

/**
 * Get element hierarchy (parents or children)
 */
async function getElementHierarchy(page, params) {
  const { selector, direction = 'parents', levels = 1 } = params;

  const element = await page.$(selector);
  if (!element) {
    return { found: false, selector };
  }

  if (direction === 'parents') {
    const parents = await element.evaluate((el, n) => {
      const result = [];
      let current = el.parentElement;
      for (let i = 0; i < n && current; i++) {
        result.push({
          tagName: current.tagName.toLowerCase(),
          id: current.id,
          className: current.className,
          textContent: current.textContent?.substring(0, 50)
        });
        current = current.parentElement;
      }
      return result;
    }, levels);

    return { found: true, selector, direction, parents };
  } else {
    const children = await element.evaluate((el, n) => {
      const getChildren = (element, depth, maxDepth) => {
        if (depth >= maxDepth) return [];

        return Array.from(element.children).map(child => ({
          tagName: child.tagName.toLowerCase(),
          id: child.id,
          className: child.className,
          textContent: child.textContent?.substring(0, 50),
          children: getChildren(child, depth + 1, maxDepth)
        }));
      };

      return getChildren(el, 0, n);
    }, levels);

    return { found: true, selector, direction, children };
  }
}

/**
 * Wait for multiple elements to be visible
 */
async function waitForElements(page, params) {
  const { selectors, timeout = 5000 } = params;
  const results = [];

  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout });
      results.push({ selector, visible: true });
    } catch (error) {
      results.push({ selector, visible: false, error: error.message });
    }
  }

  return { results };
}

/**
 * Check if elements exist on page
 */
async function checkElementsExist(page, params) {
  const { selectors } = params;
  const results = {};

  for (const [name, selector] of Object.entries(selectors)) {
    const element = await page.$(selector);

    if (element) {
      // Get basic element info
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const id = await element.evaluate(el => el.id);
      const className = await element.evaluate(el => el.className);
      const text = await element.textContent();
      const isVisible = await element.isVisible();

      results[name] = {
        exists: true,
        tagName,
        id: id || null,
        className: className || null,
        text: text?.trim().substring(0, 50) || null, // First 50 chars
        visible: isVisible
      };
    } else {
      results[name] = {
        exists: false
      };
    }
  }

  return results;
}

/**
 * Get computed styles for elements
 */
async function getComputedStyles(page, params) {
  const { selectors, properties = ['width', 'height', 'display', 'position'] } = params;
  const results = {};

  for (const [name, selector] of Object.entries(selectors)) {
    const element = await page.$(selector);
    if (element) {
      const styles = await element.evaluate((el, props) => {
        const computed = window.getComputedStyle(el);
        const result = {};
        for (const prop of props) {
          result[prop] = computed.getPropertyValue(prop);
        }
        return result;
      }, properties);
      results[name] = styles;
    } else {
      results[name] = null;
    }
  }

  return results;
}

// Export all functions
module.exports = {
  findElement,
  findElements,
  getElementPositions,
  getFormValues,
  fillForm,
  clickSequence,
  getElementHierarchy,
  waitForElements,
  checkElementsExist,
  getComputedStyles
};

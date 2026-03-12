/**
 * Browser Utilities Core Unit Tests
 *
 * These tests verify the browser utility functions work correctly
 * with mocked Playwright page objects.
 */

const { describe, it, expect, beforeEach, vi } = require('vitest');
const utils = require('../scripts/utils/browser-utils-core.js');

describe('Browser Utilities Core', () => {
  let mockPage;
  let mockElement;

  beforeEach(() => {
    // Reset mocks before each test
    mockElement = {
      evaluate: vi.fn(),
      textContent: vi.fn(),
      isVisible: vi.fn(),
      boundingBox: vi.fn(),
      getAttribute: vi.fn(),
      click: vi.fn(),
      fill: vi.fn(),
      selectOption: vi.fn(),
      check: vi.fn(),
      uncheck: vi.fn(),
      inputValue: vi.fn(),
      isChecked: vi.fn()
    };

    mockPage = {
      $: vi.fn(),
      $$: vi.fn(),
      waitForSelector: vi.fn(),
      evaluate: vi.fn()
    };
  });

  describe('findElement', () => {
    it('should find element and return basic info', async () => {
      mockPage.$.mockResolvedValue(mockElement);
      mockElement.evaluate.mockResolvedValueOnce('button'); // tagName
      mockElement.evaluate.mockResolvedValueOnce('submit-btn'); // id
      mockElement.evaluate.mockResolvedValueOnce('btn btn-primary'); // className
      mockElement.textContent.mockResolvedValue('Submit');
      mockElement.isVisible.mockResolvedValue(true);

      const result = await utils.findElement(mockPage, {
        selector: '#submit-btn'
      });

      expect(mockPage.$).toHaveBeenCalledWith('#submit-btn');
      expect(result).toEqual({
        found: true,
        tagName: 'button',
        id: 'submit-btn',
        className: 'btn btn-primary',
        text: 'Submit',
        visible: true
      });
    });

    it('should return not found when element does not exist', async () => {
      mockPage.$.mockResolvedValue(null);

      const result = await utils.findElement(mockPage, {
        selector: '#nonexistent'
      });

      expect(result).toEqual({ found: false });
    });
  });

  describe('checkElementsExist', () => {
    it('should check multiple elements and return their details', async () => {
      const mockHeader = {
        evaluate: vi.fn(),
        textContent: vi.fn(),
        isVisible: vi.fn()
      };

      mockHeader.evaluate.mockResolvedValueOnce('header');
      mockHeader.evaluate.mockResolvedValueOnce('header');
      mockHeader.evaluate.mockResolvedValueOnce('app-header');
      mockHeader.textContent.mockResolvedValue('My App');
      mockHeader.isVisible.mockResolvedValue(true);

      mockPage.$.mockImplementation((selector) => {
        if (selector === '#header') return Promise.resolve(mockHeader);
        if (selector === '#footer') return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const result = await utils.checkElementsExist(mockPage, {
        selectors: {
          header: '#header',
          footer: '#footer'
        }
      });

      expect(result.header).toEqual({
        exists: true,
        tagName: 'header',
        id: 'header',
        className: 'app-header',
        text: 'My App',
        visible: true
      });
      expect(result.footer).toEqual({ exists: false });
    });
  });

  describe('fillForm', () => {
    it('should fill form fields and return actual values', async () => {
      const mockInput = {
        fill: vi.fn(),
        inputValue: vi.fn(),
        check: vi.fn(),
        isChecked: vi.fn()
      };

      mockInput.inputValue.mockResolvedValue('John Doe');
      mockInput.isChecked.mockResolvedValue(true);

      mockPage.$.mockResolvedValue(mockInput);

      const result = await utils.fillForm(mockPage, {
        fields: [
          { selector: '#name', value: 'John Doe', type: 'textbox' },
          { selector: '#agree', value: 'true', type: 'checkbox' }
        ]
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        selector: '#name',
        success: true,
        expectedValue: 'John Doe',
        actualValue: 'John Doe',
        matched: true
      });
    });
  });
});


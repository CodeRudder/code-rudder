const fs = require('fs');
const path = require('path');

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Start/Stop Scripts', () => {
  // Use process.cwd() to get the actual project directory
  const testDir = process.cwd();
  const aiDocsDir = path.join(testDir, 'ai-docs');
  const codeRudderDir = path.join(testDir, '.code-rudder');
  const stateFile = path.join(codeRudderDir, 'state.json');

  beforeEach(() => {
    // Suppress console output during tests
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('State File Management', () => {
    test('state.json should exist after start', () => {
      expect(fs.existsSync(stateFile)).toBe(true);
    });

    test('state.json should contain valid JSON', () => {
      const content = fs.readFileSync(stateFile, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('state.json should have enabled field', () => {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state).toHaveProperty('enabled');
      expect(typeof state.enabled).toBe('boolean');
    });

    test('state.json should have attempts array', () => {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state).toHaveProperty('attempts');
      expect(Array.isArray(state.attempts)).toBe(true);
    });
  });

  describe('ai-docs Directory Structure', () => {
    test('ai-docs directory should exist', () => {
      expect(fs.existsSync(aiDocsDir)).toBe(true);
    });

    test('PRD.md should exist', () => {
      const prdFile = path.join(aiDocsDir, 'PRD.md');
      expect(fs.existsSync(prdFile)).toBe(true);
    });

    test('OPS.md should exist', () => {
      const opsFile = path.join(aiDocsDir, 'OPS.md');
      expect(fs.existsSync(opsFile)).toBe(true);
    });

    test('PLAN.md should exist', () => {
      const planFile = path.join(aiDocsDir, 'PLAN.md');
      expect(fs.existsSync(planFile)).toBe(true);
    });

    test('CONTEXT.md should exist', () => {
      const contextFile = path.join(aiDocsDir, 'CONTEXT.md');
      expect(fs.existsSync(contextFile)).toBe(true);
    });

    test('ACCEPTANCE.md should exist', () => {
      const acceptanceFile = path.join(aiDocsDir, 'ACCEPTANCE.md');
      expect(fs.existsSync(acceptanceFile)).toBe(true);
    });

    test('TEST-PLAN.md should exist', () => {
      const testPlanFile = path.join(aiDocsDir, 'TEST-PLAN.md');
      expect(fs.existsSync(testPlanFile)).toBe(true);
    });
  });

  describe('.code-rudder Directory Structure', () => {
    test('.code-rudder directory should exist', () => {
      expect(fs.existsSync(codeRudderDir)).toBe(true);
    });
  });
});

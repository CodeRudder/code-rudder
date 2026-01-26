const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Start Flow Integration Tests', () => {
  const projectDir = process.cwd();
  const startScript = path.join(projectDir, 'scripts/start.js');
  const aiDocsDir = path.join(projectDir, 'ai-docs');
  const codeRudderDir = path.join(projectDir, '.code-rudder');
  const stateFile = path.join(codeRudderDir, 'state.json');

  beforeAll(() => {
    // Clean up before tests
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      state.enabled = false;
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    }
  });

  describe('Plugin Start Flow', () => {
    test('should execute start script without errors', () => {
      expect(() => {
        execSync(`node "${startScript}"`, { cwd: projectDir });
      }).not.toThrow();
    });

    test('should create or update state.json with enabled=true', () => {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.enabled).toBe(true);
      expect(state).toHaveProperty('attempts');
      expect(Array.isArray(state.attempts)).toBe(true);
    });

    test('should create ai-docs directory', () => {
      expect(fs.existsSync(aiDocsDir)).toBe(true);
    });

    test('should create required documentation files', () => {
      const requiredFiles = [
        'PRD.md',
        'OPS.md',
        'PLAN.md',
        'CONTEXT.md',
        'ACCEPTANCE.md',
        'TEST-PLAN.md'
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(aiDocsDir, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('documentation files should contain required content', () => {
      // Check PRD.md
      const prd = fs.readFileSync(path.join(aiDocsDir, 'PRD.md'), 'utf8');
      expect(prd).toContain('项目目标');
      expect(prd).toContain('Code Rudder');

      // Check PLAN.md
      const plan = fs.readFileSync(path.join(aiDocsDir, 'PLAN.md'), 'utf8');
      expect(plan).toContain('当前阶段');
      expect(plan).toContain('工作计划');

      // Check CONTEXT.md
      const context = fs.readFileSync(path.join(aiDocsDir, 'CONTEXT.md'), 'utf8');
      expect(context).toContain('长期记忆');
    });
  });

  describe('State Persistence', () => {
    test('state.json should persist across multiple starts', () => {
      // First start
      execSync(`node "${startScript}"`, { cwd: projectDir });
      const state1 = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

      // Second start
      execSync(`node "${startScript}"`, { cwd: projectDir });
      const state2 = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

      expect(state2.enabled).toBe(true);
      expect(state2).toHaveProperty('attempts');
    });
  });
});

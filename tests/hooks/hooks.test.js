const fs = require('fs');
const path = require('path');

describe('Hook Files', () => {
  const hooksDir = path.join(process.cwd(), 'hooks');

  describe('Hook File Existence', () => {
    test('stop-hook.js should exist', () => {
      const stopHook = path.join(hooksDir, 'stop-hook.js');
      expect(fs.existsSync(stopHook)).toBe(true);
    });

    test('start-hook.js should exist', () => {
      const startHook = path.join(hooksDir, 'start-hook.js');
      expect(fs.existsSync(startHook)).toBe(true);
    });

    test('stop-hook-rules.md should exist', () => {
      const rulesFile = path.join(hooksDir, 'stop-hook-rules.md');
      expect(fs.existsSync(rulesFile)).toBe(true);
    });

    test('hooks.json should exist', () => {
      const hooksJson = path.join(hooksDir, 'hooks.json');
      expect(fs.existsSync(hooksJson)).toBe(true);
    });
  });

  describe('Hook Rules Content', () => {
    const rulesFile = path.join(hooksDir, 'stop-hook-rules.md');

    test('stop-hook-rules.md should contain role definition', () => {
      const content = fs.readFileSync(rulesFile, 'utf8');
      expect(content).toContain('# 角色');
    });

    test('stop-hook-rules.md should contain business goals', () => {
      const content = fs.readFileSync(rulesFile, 'utf8');
      expect(content).toContain('# 业务目标');
    });

    test('stop-hook-rules.md should contain decision rules', () => {
      const content = fs.readFileSync(rulesFile, 'utf8');
      expect(content).toContain('# 决策规则');
    });

    test('stop-hook-rules.md should contain operations', () => {
      const content = fs.readFileSync(rulesFile, 'utf8');
      expect(content).toContain('# 常用操作');
    });

    test('stop-hook-rules.md should contain development flow', () => {
      const content = fs.readFileSync(rulesFile, 'utf8');
      expect(content).toContain('# 开发流程');
    });

    test('stop-hook-rules.md should contain acceptance criteria', () => {
      const content = fs.readFileSync(rulesFile, 'utf8');
      expect(content).toContain('# 验收标准');
    });
  });

  describe('Hook Configuration', () => {
    const hooksJson = path.join(hooksDir, 'hooks.json');

    test('hooks.json should contain valid JSON', () => {
      const content = fs.readFileSync(hooksJson, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('hooks.json should have stopHook configuration', () => {
      const config = JSON.parse(fs.readFileSync(hooksJson, 'utf8'));
      expect(config).toHaveProperty('hooks');
      expect(config.hooks).toHaveProperty('Stop');
    });
  });
});

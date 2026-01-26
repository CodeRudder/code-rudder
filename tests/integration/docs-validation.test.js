const fs = require('fs');
const path = require('path');

describe('Documentation Validation', () => {
  const aiDocsDir = path.join(process.cwd(), 'ai-docs');

  describe('PRD.md Content', () => {
    const prdFile = path.join(aiDocsDir, 'PRD.md');

    test('PRD should contain project goal', () => {
      const content = fs.readFileSync(prdFile, 'utf8');
      expect(content).toContain('项目目标');
    });

    test('PRD should contain feature description', () => {
      const content = fs.readFileSync(prdFile, 'utf8');
      expect(content).toContain('项目功能描述');
    });

    test('PRD should contain key requirements', () => {
      const content = fs.readFileSync(prdFile, 'utf8');
      expect(content).toContain('关键需求');
    });
  });

  describe('OPS.md Content', () => {
    const opsFile = path.join(aiDocsDir, 'OPS.md');

    test('OPS should contain plugin start/stop commands', () => {
      const content = fs.readFileSync(opsFile, 'utf8');
      expect(content).toContain('插件启停');
    });

    test('OPS should contain development and testing section', () => {
      const content = fs.readFileSync(opsFile, 'utf8');
      expect(content).toContain('开发与测试');
    });

    test('OPS should contain git operations', () => {
      const content = fs.readFileSync(opsFile, 'utf8');
      expect(content).toContain('Git操作');
    });
  });

  describe('PLAN.md Content', () => {
    const planFile = path.join(aiDocsDir, 'PLAN.md');

    test('PLAN should contain current phase', () => {
      const content = fs.readFileSync(planFile, 'utf8');
      expect(content).toContain('当前阶段');
    });

    test('PLAN should contain completed tasks', () => {
      const content = fs.readFileSync(planFile, 'utf8');
      expect(content).toContain('最近完成事项');
    });

    test('PLAN should contain in-progress tasks', () => {
      const content = fs.readFileSync(planFile, 'utf8');
      expect(content).toContain('正在处理任务');
    });

    test('PLAN should contain pending tasks', () => {
      const content = fs.readFileSync(planFile, 'utf8');
      expect(content).toContain('待处理任务');
    });
  });

  describe('CONTEXT.md Content', () => {
    const contextFile = path.join(aiDocsDir, 'CONTEXT.md');

    test('CONTEXT should contain long-term memory', () => {
      const content = fs.readFileSync(contextFile, 'utf8');
      expect(content).toContain('长期记忆');
    });

    test('CONTEXT should contain medium-term memory', () => {
      const content = fs.readFileSync(contextFile, 'utf8');
      expect(content).toContain('中期记忆');
    });

    test('CONTEXT should contain current issues section', () => {
      const content = fs.readFileSync(contextFile, 'utf8');
      expect(content).toContain('当前处理问题');
    });
  });

  describe('ACCEPTANCE.md Content', () => {
    const acceptanceFile = path.join(aiDocsDir, 'ACCEPTANCE.md');

    test('ACCEPTANCE should contain core functions', () => {
      const content = fs.readFileSync(acceptanceFile, 'utf8');
      expect(content).toContain('核心功能模块');
    });

    test('ACCEPTANCE should contain version info', () => {
      const content = fs.readFileSync(acceptanceFile, 'utf8');
      expect(content).toMatch(/\[v\d+\.\d+\]/);
    });

    test('ACCEPTANCE should contain test status', () => {
      const content = fs.readFileSync(acceptanceFile, 'utf8');
      expect(content).toMatch(/(通过|待验证|待实现)/);
    });
  });

  describe('TEST-PLAN.md Content', () => {
    const testPlanFile = path.join(aiDocsDir, 'TEST-PLAN.md');

    test('TEST-PLAN should contain unit tests section', () => {
      const content = fs.readFileSync(testPlanFile, 'utf8');
      expect(content).toContain('单元测试');
    });

    test('TEST-PLAN should contain integration tests section', () => {
      const content = fs.readFileSync(testPlanFile, 'utf8');
      expect(content).toContain('集成测试');
    });

    test('TEST-PLAN should contain test execution plan', () => {
      const content = fs.readFileSync(testPlanFile, 'utf8');
      expect(content).toContain('测试执行计划');
    });

    test('TEST-PLAN should contain acceptance criteria', () => {
      const content = fs.readFileSync(testPlanFile, 'utf8');
      expect(content).toContain('测试验收标准');
    });
  });
});

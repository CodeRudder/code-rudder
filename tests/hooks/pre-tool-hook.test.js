const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

describe('PreToolUse Hook Tests', () => {
  const testDir = path.join(process.cwd(), '.test-pre-tool');
  const preToolHookScript = path.join(process.cwd(), 'hooks', 'pre-tool-hook.js');

  // Helper function to run pre-tool-hook with input
  function runPreToolHook(input) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [preToolHookScript], {
        env: {
          ...process.env
        }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code });
      });

      child.on('error', (err) => {
        reject(err);
      });

      // Send input to stdin
      child.stdin.write(JSON.stringify(input));
      child.stdin.end();
    });
  }

  describe('Sensitive File Protection', () => {
    test('should block .env file modification', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: '.env',
          new_content: 'API_KEY=test'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(2);
      const output = JSON.parse(result.stdout);
      expect(output.decision).toBe('block');
      expect(output.reason).toContain('敏感文件');
    });

    test('should block .git directory modification', async () => {
      const input = {
        tool_name: 'Write',
        tool_input: {
          file_path: '.git/config',
          content: '[user]\nname = test'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(2);
      const output = JSON.parse(result.stdout);
      expect(output.decision).toBe('block');
      expect(output.reason).toContain('敏感');
    });

    test('should block package-lock.json modification', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'package-lock.json',
          new_content: '{}'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(2);
      const output = JSON.parse(result.stdout);
      expect(output.decision).toBe('block');
    });

    test('should allow regular file modification', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'src/app.js',
          new_content: 'console.log("hello");'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
    });
  });

  describe('Code Quality Validation', () => {
    test('should warn about console.log in production code', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'src/app.js',
          new_content: 'function test() {\n  console.log("debug");\n}'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.decision).toBe('allow');
      expect(output.warnings).toBeDefined();
      expect(output.warnings.length).toBeGreaterThan(0);
      expect(output.warnings.some(w => w.includes('console.log'))).toBe(true);
    });

    test('should warn about debugger statement', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'src/utils.ts',
          new_content: 'function debug() {\n  debugger;\n}'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.decision).toBe('allow');
      expect(output.warnings.some(w => w.includes('debugger'))).toBe(true);
    });

    test('should warn about TODO comments', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'src/component.jsx',
          new_content: '// TODO: implement this\nfunction test() {}'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.warnings.some(w => w.includes('TODO'))).toBe(true);
    });

    test('should allow console.log in test files', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'tests/app.test.js',
          new_content: 'console.log("test output");'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      // 测试文件中的console.log不应该有警告
      if (result.stdout.trim()) {
        const output = JSON.parse(result.stdout);
        if (output.warnings) {
          expect(output.warnings.some(w => w.includes('console.log'))).toBe(false);
        }
      }
    });

    test('should not warn in non-JS files', async () => {
      const input = {
        tool_name: 'Write',
        tool_input: {
          file_path: 'README.md',
          content: 'console.log is mentioned here'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      // Markdown文件不应该有代码质量检查
      if (result.stdout.trim()) {
        const output = JSON.parse(result.stdout);
        expect(output.warnings).toBeUndefined();
      }
    });
  });

  describe('JSON Validation', () => {
    test('should block invalid JSON', async () => {
      const input = {
        tool_name: 'Write',
        tool_input: {
          file_path: 'config.json',
          content: '{ invalid json }'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(2);
      const output = JSON.parse(result.stdout);
      expect(output.decision).toBe('block');
      expect(output.reason).toContain('JSON');
    });

    test('should allow valid JSON', async () => {
      const input = {
        tool_name: 'Write',
        tool_input: {
          file_path: 'config.json',
          content: '{"name": "test", "version": "1.0.0"}'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
    });
  });

  describe('Tool Filtering', () => {
    test('should allow Read tool without checks', async () => {
      const input = {
        tool_name: 'Read',
        tool_input: {
          file_path: '.env'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should allow Bash tool without checks', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'ls -la'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty file path', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: '',
          new_content: 'test'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
    });

    test('should handle missing tool_input', async () => {
      const input = {
        tool_name: 'Edit'
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
    });

    test('should handle empty input', async () => {
      const input = {};

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
    });

    test('should handle small content', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'test.js',
          new_content: 'x'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
    });
  });
});

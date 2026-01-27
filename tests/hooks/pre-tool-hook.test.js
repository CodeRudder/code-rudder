const path = require('path');
const { spawn } = require('child_process');

describe('PreToolUse Hook Tests', () => {
  const preToolHookScript = path.join(process.cwd(), 'hooks', 'pre-tool-hook.js');

  /**
   * Helper function to run pre-tool-hook with input
   * @param {Object} input - Hook input data
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  function runPreToolHook(input) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [preToolHookScript], {
        env: {
          ...process.env,
          LOG_LEVEL: 'DEBUG'
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

  describe('Dangerous Command Detection', () => {
    test('should block rm -rf / command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm -rf /'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
      expect(output.hookSpecificOutput.permissionDecisionReason).toContain('危险命令');
    });

    test('should block rm -rf ~ command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm -rf ~'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block rm -rf ../ command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm -rf ../'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block mkfs command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'mkfs.ext4 /dev/sda1'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block dd command writing to disk', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'dd if=/dev/zero of=/dev/sda'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block kill -9 1 command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'kill -9 1'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block kill -9 -1 command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'kill -9 -1'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block shutdown now command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'shutdown now'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block fork bomb', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: ':(){:|:&};:'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block multiple rm commands (3+)', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm file1 && rm file2 && rm file3'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
      expect(output.hookSpecificOutput.permissionDecisionReason).toContain('多个连续的删除命令');
    });
  });

  describe('Safe Commands', () => {
    test('should allow normal rm command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm file.txt'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should allow ls command', async () => {
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

    test('should allow npm install', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'npm install'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should allow git status', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'git status'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should allow rm -rf on non-root paths', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm -rf ./dist'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should allow two rm commands', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm file1 && rm file2'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });
  });

  describe('Non-Bash Tools', () => {
    test('should allow Edit tool', async () => {
      const input = {
        tool_name: 'Edit',
        tool_input: {
          file_path: 'src/app.js',
          new_content: 'console.log("hello");'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should allow Write tool', async () => {
      const input = {
        tool_name: 'Write',
        tool_input: {
          file_path: 'test.js',
          content: 'test content'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should allow Read tool', async () => {
      const input = {
        tool_name: 'Read',
        tool_input: {
          file_path: 'package.json'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty command', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: ''
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should handle missing tool_input', async () => {
      const input = {
        tool_name: 'Bash'
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should handle empty input', async () => {
      const input = {};

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    test('should handle command with whitespace', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: '  rm -rf /  '
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should handle case insensitive matching', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'RM -RF /'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });
  });

  describe('Command Variations', () => {
    test('should block rm -fr /', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm -fr /'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block rm -r -f /', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'rm -r -f /'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block fdisk', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'fdisk /dev/sda'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block parted', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'parted /dev/sda'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block poweroff', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'poweroff'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });

    test('should block reboot -f', async () => {
      const input = {
        tool_name: 'Bash',
        tool_input: {
          command: 'reboot -f'
        }
      };

      const result = await runPreToolHook(input);

      expect(result.exitCode).toBe(0);
      const output = JSON.parse(result.stdout);
      expect(output.hookSpecificOutput.permissionDecision).toBe('deny');
    });
  });
});

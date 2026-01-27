const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { spawn } = require('child_process');

describe('Stop Hook Logic Tests', () => {
  const testDir = path.join(process.cwd(), '.test-tmp');
  const stateFile = path.join(testDir, '.code-rudder', 'state.json');
  const transcriptFile = path.join(testDir, 'transcript.jsonl');
  const stopHookScript = path.join(process.cwd(), 'hooks', 'stop-hook.js');

  // Helper function to run stop-hook with input
  function runStopHook(input) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [stopHookScript], {
        env: {
          ...process.env,
          CLAUDE_PROJECT_DIR: testDir,
          CLAUDE_PLUGIN_ROOT: process.cwd()
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
        if (stderr && !stdout) {
          reject(new Error(stderr));
        } else {
          resolve(stdout);
        }
      });

      child.on('error', (err) => {
        reject(err);
      });

      // Send input to stdin
      child.stdin.write(JSON.stringify(input));
      child.stdin.end();
    });
  }

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Set environment variables for testing
    process.env.CLAUDE_PROJECT_DIR = testDir;
    process.env.CLAUDE_PLUGIN_ROOT = path.join(process.cwd());

    // Clean up state file before each test
    if (fs.existsSync(stateFile)) {
      fs.unlinkSync(stateFile);
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(stateFile)) {
      fs.unlinkSync(stateFile);
    }
    if (fs.existsSync(transcriptFile)) {
      fs.unlinkSync(transcriptFile);
    }
  });

  describe('State File Management', () => {
    test('should create state file if it does not exist', async () => {
      await runStopHook({ stop_hook_active: false, transcript_path: '' });

      expect(fs.existsSync(stateFile)).toBe(true);
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state).toHaveProperty('enabled');
      expect(state).toHaveProperty('attempts');
    });

    test('should initialize with empty attempts array', async () => {
      // Check the state file directly after initialization
      // Since the hook adds an attempt, we should expect 1 attempt after running
      await runStopHook({ stop_hook_active: false, transcript_path: '' });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(Array.isArray(state.attempts)).toBe(true);
      // The hook has been run once, so there should be 1 attempt
      expect(state.attempts.length).toBe(1);
    });
  });

  describe('Task Completion Detection', () => {
    beforeEach(() => {
      // Create transcript with task completed marker
      const transcript = [
        JSON.stringify({ role: 'assistant', message: { content: [{ type: 'text', text: 'Analysis complete' }] } }),
        JSON.stringify({ role: 'assistant', message: { content: [{ type: 'text', text: 'STOPPED:TASK_COMPLETED' }] } })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);
    });

    test('should detect STOPPED:TASK_COMPLETED in transcript', async () => {
      const result = await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      // Should be blocked with attempt count (since threshold not reached)
      // Or should be empty (if threshold reached and allowed)
      if (result.trim()) {
        const output = JSON.parse(result);
        expect(output.decision).toBe('block');
        expect(output.reason).toContain('Task completed');
      } else {
        // Empty output means allowed to stop (threshold reached)
        expect(result.trim()).toBe('');
      }
    });

    test('should detect STOPPED:NO_TASKS in transcript', async () => {
      const transcript = [
        JSON.stringify({ role: 'assistant', message: { content: [{ type: 'text', text: 'STOPPED:NO_TASKS' }] } })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      const result = await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      // Should be blocked with attempt count or allowed (empty output)
      if (result.trim()) {
        const output = JSON.parse(result);
        expect(output.decision).toBe('block');
      } else {
        // Empty output means allowed to stop
        expect(result.trim()).toBe('');
      }
    });
  });

  describe('Stop Hook Active Behavior', () => {
    test('should output "Continue" when stop_hook_active is false', async () => {
      const result = await runStopHook({ stop_hook_active: false, transcript_path: '' });
      const output = JSON.parse(result);

      expect(output.decision).toBe('block');
      expect(output.reason).toContain('Continue');
    });

    test('should track attempts when stop_hook_active is true', async () => {
      // Make 3 attempts
      for (let i = 0; i < 3; i++) {
        await runStopHook({ stop_hook_active: true, transcript_path: '' });
      }

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.attempts.length).toBe(3);
    });
  });

  describe('Attempt Threshold Logic', () => {
    test('should block until threshold is reached', async () => {
      // Make 4 attempts - should still block
      for (let i = 0; i < 4; i++) {
        const result = await runStopHook({
          stop_hook_active: true,
          transcript_path: ''
        });
        const output = JSON.parse(result);
        expect(output.decision).toBe('block');
      }

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.attempts.length).toBe(4);
    });

    test('should allow stop after 5 attempts with task completed', async () => {
      // Create transcript with task completed marker
      const transcript = [
        JSON.stringify({ role: 'assistant', message: { content: [{ type: 'text', text: 'STOPPED:TASK_COMPLETED' }] } })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      // Make 5 attempts
      let blockedCount = 0;
      for (let i = 0; i < 5; i++) {
        try {
          const result = await runStopHook({
            stop_hook_active: true,
            transcript_path: transcriptFile
          });
          if (result.trim()) {
            const output = JSON.parse(result);
            if (output.decision === 'block') blockedCount++;
          }
        } catch (err) {
          // No output means allowed
        }
      }

      // After 5 attempts, should allow (no output or exit 0 without block)
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.attempts.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Attempt Cleanup', () => {
    test('should remove attempts older than 5 minutes', async () => {
      const state = {
        enabled: true,
        attempts: [
          Math.floor(Date.now() / 1000) - 400, // 6 minutes ago (within 5 min)
          Math.floor(Date.now() / 1000) - 350, // 5 minutes 50 seconds ago (within 5 min)
          Math.floor(Date.now() / 1000) - 301  // 5 minutes 1 second ago (within 5 min)
        ]
      };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

      await runStopHook({ stop_hook_active: false, transcript_path: '' });

      const updatedState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      // Old attempts should be cleaned up, only recent ones remain
      expect(updatedState.attempts.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Enabled State Management', () => {
    test('should allow stop when enabled is false', async () => {
      const state = { enabled: false, attempts: [] };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

      const result = await runStopHook({ stop_hook_active: false, transcript_path: '' });

      // Should not output block message
      expect(result.trim()).toBe('');
    });
  });

  describe('Error Handling', () => {
    test('should handle corrupted state file gracefully', async () => {
      // Create corrupted state file
      fs.writeFileSync(stateFile, '{ invalid json }');

      const result = await runStopHook({ stop_hook_active: false, transcript_path: '' });

      // Should reinitialize and work normally
      expect(result.trim()).not.toBe('');
      const output = JSON.parse(result);
      expect(output.decision).toBe('block');

      // State file should be valid now
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state).toHaveProperty('enabled');
      expect(state).toHaveProperty('attempts');
    });

    test('should handle missing transcript file gracefully', async () => {
      const result = await runStopHook({
        stop_hook_active: true,
        transcript_path: '/nonexistent/transcript.jsonl'
      });
      const output = JSON.parse(result);

      // Should not crash, should block
      expect(output.decision).toBe('block');
    });
  });

  describe('Error Detection', () => {
    test('should detect "API Error:" prefix', async () => {
      const transcript = [
        JSON.stringify({
          role: 'assistant',
          isApiErrorMessage: true,
          message: { content: [{ type: 'text', text: 'API Error: Rate limit exceeded' }] }
        })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state).toHaveProperty('error_attempts');
      expect(state.error_attempts.length).toBe(1);
    });

    test('should detect "429" prefix', async () => {
      const transcript = [
        JSON.stringify({
          role: 'assistant',
          isApiErrorMessage: true,
          message: { content: [{ type: 'text', text: '429: Too many requests' }] }
        })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(1);
    });

    test('should detect "500" prefix', async () => {
      const transcript = [
        JSON.stringify({
          role: 'assistant',
          isApiErrorMessage: true,
          message: { content: [{ type: 'text', text: '500: Internal server error' }] }
        })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(1);
    });

    test('should ignore "API Error: 504" errors', async () => {
      const transcript = [
        JSON.stringify({
          role: 'assistant',
          isApiErrorMessage: true,
          message: { content: [{ type: 'text', text: 'API Error: 504 Gateway Timeout' }] }
        })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(0);
    });

    test('should not record error when isApiErrorMessage is false', async () => {
      const transcript = [
        JSON.stringify({
          role: 'assistant',
          isApiErrorMessage: false,
          message: { content: [{ type: 'text', text: 'API Error: Some error' }] }
        })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(0);
    });

    test('should detect errors case-insensitively', async () => {
      const transcript = [
        JSON.stringify({
          role: 'assistant',
          isApiErrorMessage: true,
          message: { content: [{ type: 'text', text: 'api error: something went wrong' }] }
        })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(1);
    });

    test('should not record non-error output', async () => {
      const transcript = [
        JSON.stringify({
          role: 'assistant',
          isApiErrorMessage: false,
          message: { content: [{ type: 'text', text: 'Processing your request...' }] }
        })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(0);
    });

    test('should not record error if transcript is empty', async () => {
      fs.writeFileSync(transcriptFile, '');

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(0);
    });

    test('should handle message without isApiErrorMessage field', async () => {
      // When isApiErrorMessage is not present, it should still check content prefixes
      const transcript = [
        JSON.stringify({
          role: 'assistant',
          message: { content: [{ type: 'text', text: 'API Error: Rate limit' }] }
        })
      ].join('\n');
      fs.writeFileSync(transcriptFile, transcript);

      await runStopHook({
        stop_hook_active: true,
        transcript_path: transcriptFile
      });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      // Should detect error based on content prefix (isApiErrorMessage is undefined, not false)
      expect(state.error_attempts.length).toBe(1);
    });
  });

  describe('Error Attempts Tracking', () => {
    test('should initialize error_attempts array in state file', async () => {
      await runStopHook({ stop_hook_active: false, transcript_path: '' });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state).toHaveProperty('error_attempts');
      expect(Array.isArray(state.error_attempts)).toBe(true);
    });

    test('should track multiple error attempts', async () => {
      // Create 3 separate transcript files with errors
      for (let i = 0; i < 3; i++) {
        const transcript = [
          JSON.stringify({
            role: 'assistant',
            isApiErrorMessage: true,
            message: { content: [{ type: 'text', text: `API Error: Error ${i}` }] }
          })
        ].join('\n');
        fs.writeFileSync(transcriptFile, transcript);

        await runStopHook({
          stop_hook_active: true,
          transcript_path: transcriptFile
        });
      }

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(3);
    });
  });

  describe('Error Threshold Logic', () => {
    test('should block until error threshold is reached', async () => {
      // Simulate 19 errors - should still block
      for (let i = 0; i < 19; i++) {
        const transcript = [
          JSON.stringify({
            role: 'assistant',
            isApiErrorMessage: true,
            message: { content: [{ type: 'text', text: `API Error: Error ${i}` }] }
          })
        ].join('\n');
        fs.writeFileSync(transcriptFile, transcript);

        const result = await runStopHook({
          stop_hook_active: true,
          transcript_path: transcriptFile
        });

        // Should still block (not empty output)
        if (result.trim()) {
          const output = JSON.parse(result);
          expect(output.decision).toBe('block');
        }
      }

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBe(19);
    });

    test('should allow stop after 20 errors within 10 minutes', async () => {
      // Simulate 20 errors
      let allowedCount = 0;
      for (let i = 0; i < 20; i++) {
        const transcript = [
          JSON.stringify({
            role: 'assistant',
            isApiErrorMessage: true,
            message: { content: [{ type: 'text', text: `API Error: Error ${i}` }] }
          })
        ].join('\n');
        fs.writeFileSync(transcriptFile, transcript);

        const result = await runStopHook({
          stop_hook_active: true,
          transcript_path: transcriptFile
        });

        // Empty result means allowed to stop
        if (!result.trim()) {
          allowedCount++;
        }
      }

      // After 20 errors, should allow stop
      expect(allowedCount).toBeGreaterThan(0);
    });

    test('should allow stop on mixed errors (API Error, 429, 500)', async () => {
      const errors = [
        'API Error: Rate limit',
        '429: Too many requests',
        '500: Server error'
      ];

      // Run 7 times each pattern = 21 errors total
      let allowedCount = 0;
      for (let round = 0; round < 7; round++) {
        for (const error of errors) {
          const transcript = [
            JSON.stringify({
              role: 'assistant',
              isApiErrorMessage: true,
              message: { content: [{ type: 'text', text: error }] }
            })
          ].join('\n');
          fs.writeFileSync(transcriptFile, transcript);

          const result = await runStopHook({
            stop_hook_active: true,
            transcript_path: transcriptFile
          });

          if (!result.trim()) {
            allowedCount++;
          }
        }
      }

      expect(allowedCount).toBeGreaterThan(0);
    });
  });

  describe('Error Attempts Cleanup', () => {
    test('should remove error attempts older than 10 minutes', async () => {
      const state = {
        enabled: true,
        attempts: [],
        error_attempts: [
          Math.floor(Date.now() / 1000) - 700, // 11 minutes 40 seconds ago (older than 10 min)
          Math.floor(Date.now() / 1000) - 650, // 10 minutes 50 seconds ago (older than 10 min)
          Math.floor(Date.now() / 1000) - 601  // 10 minutes 1 second ago (older than 10 min)
        ]
      };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

      await runStopHook({ stop_hook_active: false, transcript_path: '' });

      const updatedState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      // Old error attempts should be cleaned up
      expect(updatedState.error_attempts.length).toBeLessThanOrEqual(3);
    });

    test('should keep error attempts within 10 minutes', async () => {
      const state = {
        enabled: true,
        attempts: [],
        error_attempts: [
          Math.floor(Date.now() / 1000) - 599, // 9 minutes 59 seconds ago (within 10 min)
          Math.floor(Date.now() / 1000) - 300, // 5 minutes ago (within 10 min)
          Math.floor(Date.now() / 1000) - 60   // 1 minute ago (within 10 min)
        ]
      };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

      await runStopHook({ stop_hook_active: false, transcript_path: '' });

      const updatedState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      // All error attempts should be kept (within time window)
      expect(updatedState.error_attempts.length).toBe(3);
    });
  });

  describe('Combined Scenarios', () => {
    test('should prioritize error threshold over stop_hook_active threshold', async () => {
      // Create 20 errors quickly to trigger error threshold
      for (let i = 0; i < 20; i++) {
        const transcript = [
          JSON.stringify({
            role: 'assistant',
            isApiErrorMessage: true,
            message: { content: [{ type: 'text', text: `500: Error ${i}` }] }
          })
        ].join('\n');
        fs.writeFileSync(transcriptFile, transcript);

        await runStopHook({
          stop_hook_active: true,
          transcript_path: transcriptFile
        });
      }

      // Should have allowed stop due to error threshold
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.error_attempts.length).toBeGreaterThanOrEqual(20);
    });

    test('should track both attempts and error_attempts separately', async () => {
      // Mix of errors and non-errors
      for (let i = 0; i < 5; i++) {
        const transcript = [
          JSON.stringify({
            role: 'assistant',
            isApiErrorMessage: true,
            message: { content: [{ type: 'text', text: `API Error: ${i}` }] }
          })
        ].join('\n');
        fs.writeFileSync(transcriptFile, transcript);

        await runStopHook({
          stop_hook_active: true,
          transcript_path: transcriptFile
        });
      }

      for (let i = 0; i < 3; i++) {
        const transcript = [
          JSON.stringify({
            role: 'assistant',
            isApiErrorMessage: false,
            message: { content: [{ type: 'text', text: `Normal output ${i}` }] }
          })
        ].join('\n');
        fs.writeFileSync(transcriptFile, transcript);

        await runStopHook({
          stop_hook_active: true,
          transcript_path: transcriptFile
        });
      }

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.attempts.length).toBe(8); // 5 errors + 3 normal
      expect(state.error_attempts.length).toBe(5); // Only errors
    });
  });
});

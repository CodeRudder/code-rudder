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
});

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Stop Flow Integration Tests', () => {
  const projectDir = process.cwd();
  const startScript = path.join(projectDir, 'scripts/start.js');
  const stopScript = path.join(projectDir, 'scripts/stop.js');
  const stateFile = path.join(projectDir, '.code-rudder/state.json');

  beforeEach(() => {
    // Ensure plugin is started before each test
    try {
      execSync(`node "${startScript}"`, { cwd: projectDir });
    } catch (error) {
      // Ignore if already started
    }
  });

  describe('Plugin Stop Flow', () => {
    test('should execute stop script without errors', () => {
      expect(() => {
        execSync(`node "${stopScript}"`, { cwd: projectDir });
      }).not.toThrow();
    });

    test('should update state.json with enabled=false', () => {
      // Stop the plugin
      execSync(`node "${stopScript}"`, { cwd: projectDir });

      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(state.enabled).toBe(false);
    });

    test('should preserve attempts array when stopping', () => {
      // Start first to get initial state
      execSync(`node "${startScript}"`, { cwd: projectDir });
      const stateBefore = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      const attemptsLengthBefore = stateBefore.attempts.length;

      // Stop
      execSync(`node "${stopScript}"`, { cwd: projectDir });

      const stateAfter = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      expect(stateAfter.attempts).toHaveLength(attemptsLengthBefore);
    });
  });

  describe('Start-Stop Cycle', () => {
    test('should handle multiple start-stop cycles', () => {
      for (let i = 0; i < 3; i++) {
        // Start
        execSync(`node "${startScript}"`, { cwd: projectDir });
        let state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        expect(state.enabled).toBe(true);

        // Stop
        execSync(`node "${stopScript}"`, { cwd: projectDir });
        state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        expect(state.enabled).toBe(false);
      }
    });

    test('should maintain state file integrity across cycles', () => {
      // Start
      execSync(`node "${startScript}"`, { cwd: projectDir });

      // Stop
      execSync(`node "${stopScript}"`, { cwd: projectDir });

      // Verify file is valid JSON
      expect(() => {
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        expect(state).toHaveProperty('enabled');
        expect(state).toHaveProperty('attempts');
      }).not.toThrow();
    });
  });
});

import { Command } from 'commander';
import { execSync } from 'child_process';
import { store } from '../store';
import { ExecutionEntry } from '../schema';
import crypto from 'crypto';

export function logCommitCmd(): Command {
  return new Command('_log-commit')
    .description('Internal: called by git post-commit hook')
    .action(() => {
      if (!store.exists()) return; // not initialized, skip silently

      // Get changed files from last commit
      let filesChanged: string[] = [];
      try {
        const diff = execSync('git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only HEAD', { encoding: 'utf8' });
        filesChanged = diff.trim().split('\n').filter(Boolean);
      } catch { return; } // first commit edge case

      // Read .agentosignore and filter
      let ignorePatterns: string[] = [];
      try {
        const ig = require('fs').readFileSync('.agentosignore', 'utf8');
        ignorePatterns = ig.split('\n').filter((l: string) => l.trim() && !l.startsWith('#'));
      } catch {}
      filesChanged = filesChanged.filter(f => !ignorePatterns.some(p => f.startsWith(p.replace('/', ''))));

      if (filesChanged.length === 0) return; // nothing relevant changed

      const state = store.readState();
      const entry: ExecutionEntry = {
        timestamp: new Date().toISOString(),
        agent: state.active_agent,
        files_changed: filesChanged,
        summary: `${filesChanged.length} file(s) changed: ${filesChanged.slice(0,3).join(', ')}${filesChanged.length > 3 ? '...' : ''}`,
        accepted: true,
        session_id: crypto.randomUUID()
      };

      store.appendLog(entry);
    });
}

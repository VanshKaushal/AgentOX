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
        const diff = execSync('git show --name-only --pretty=format: HEAD', { encoding: 'utf8' });
        filesChanged = diff.trim().split('\n').filter(Boolean);
      } catch { return; } // first commit edge case

      // Read .agentosignore and filter
      let ignorePatterns: string[] = [];
      try {
        const rootDir = store.getRootDir();
        const ig = require('fs').readFileSync(require('path').join(rootDir, '.agentosignore'), 'utf8');
        ignorePatterns = ig.split('\n').filter((l: string) => l.trim() && !l.startsWith('#'));
      } catch {}
      filesChanged = filesChanged.filter(f => !ignorePatterns.some(p => f.startsWith(p.replace('/', ''))));
      filesChanged = filesChanged.filter(f => !f.startsWith('agentos/'));
      filesChanged = filesChanged.filter(f => f !== '.agentosignore');

      if (filesChanged.length === 0) return; // nothing relevant changed

      let commitMsg = '';
      try {
        commitMsg = execSync('git log -1 --pretty=format:%s', { encoding: 'utf8' }).trim();
      } catch {}

      const state = store.readState();
      const entry: ExecutionEntry = {
        timestamp: new Date().toISOString(),
        agent: state.active_agent,
        files_changed: filesChanged,
        commit_message: commitMsg,
        summary: commitMsg || `${filesChanged.length} file(s) changed: ${filesChanged.slice(0,3).join(', ')}${filesChanged.length > 3 ? '...' : ''}`,
        accepted: true,
        session_id: crypto.randomUUID()
      };

      store.appendLog(entry);
  });
}

export function logPublicCmd(): Command {
  return new Command('log')
    .description('View recent execution log')
    .action(() => {
      if (!store.exists()) {
        console.log('Not initialized. Run: agentox init');
        return;
      }
      const logs = store.readLog(20);
      if (logs.length === 0) {
        console.log('No logs found.');
        return;
      }
      logs.forEach(l => {
        console.log(`[${l.timestamp}] ${l.agent || 'user'}: ${l.summary}`);
      });
    });
}

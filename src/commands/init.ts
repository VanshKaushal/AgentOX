import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { store } from '../store';
import { defaultState, defaultDecisions, defaultTaskGraph, defaultArchMap } from '../schema';
import crypto from 'crypto';

export function initCmd(): Command {
  return new Command('init')
    .description('Initialize AgentOS in current repo')
    .action(() => {
      store.ensureDir();

      // Write default files only if they don't exist
      const p = (f: string) => path.join(process.cwd(), 'agentos', f);
      if (!fs.existsSync(p('state.json'))) store.writeState(defaultState());
      if (!fs.existsSync(p('decisions.json'))) store.writeDecisions(defaultDecisions());
      if (!fs.existsSync(p('task_graph.json'))) store.writeTaskGraph(defaultTaskGraph());
      if (!fs.existsSync(p('architecture_map.json'))) store.writeArchMap(defaultArchMap());
      if (!fs.existsSync(p('execution_log.jsonl'))) fs.writeFileSync(p('execution_log.jsonl'), '');

      // Write .agentosignore
      const ignore = ['node_modules/', 'dist/', '.env', 'build/', '.next/', '__pycache__/'].join('\n');
      fs.writeFileSync(path.join(process.cwd(), '.agentosignore'), ignore);

      // Install git post-commit hook
      const hookDir = path.join(process.cwd(), '.git', 'hooks');
      const hookPath = path.join(hookDir, 'post-commit');
      if (fs.existsSync(hookDir)) {
        const hook = `#!/bin/sh\nnpx agentos _log-commit 2>/dev/null || true\n`;
        fs.writeFileSync(hookPath, hook);
        fs.chmodSync(hookPath, '755');
        console.log('✓ Git hook installed');
      }

      // Ensure agentos/ is NOT in .gitignore
      const gi = path.join(process.cwd(), '.gitignore');
      if (fs.existsSync(gi)) {
        const content = fs.readFileSync(gi, 'utf8');
        if (content.includes('agentos/')) {
          console.warn('⚠ agentos/ is in .gitignore — remove it or continuity will not persist');
        }
      }

      console.log('✓ AgentOS initialized. Run: agentos status');
    });
}

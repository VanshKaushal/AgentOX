import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function watchCmd(): Command {
  return new Command('watch')
    .description('Auto-log commits in background (no hook needed)')
    .action(() => {
      const gitDir = path.join(process.cwd(), '.git');
      const headFile = path.join(gitDir, 'COMMIT_EDITMSG');
      
      if (!fs.existsSync(gitDir)) {
        console.error('Not a git repo');
        process.exit(1);
      }

      console.log('👁  AgentOS watching for commits...');
      console.log('   Every commit will be auto-logged.');
      console.log('   Press Ctrl+C to stop.\n');

      let lastContent = '';
      try {
        lastContent = fs.readFileSync(headFile, 'utf8');
      } catch {}

      // Watch COMMIT_EDITMSG — changes on every commit
      fs.watch(gitDir, { recursive: false }, (event, filename) => {
        if (filename !== 'COMMIT_EDITMSG') return;
        try {
          const content = fs.readFileSync(headFile, 'utf8');
          if (content === lastContent) return;
          lastContent = content;
          
          // Small delay to ensure commit is complete
          setTimeout(() => {
            try {
              execSync('agentox _log-commit', {
                cwd: process.cwd(),
                stdio: 'pipe'
              });
              const msg = content.trim().slice(0, 50);
              console.log(`✓ Auto-logged: "${msg}"`);
            } catch (e) {
              console.log('⚠ Auto-log failed:', (e as Error).message);
            }
          }, 500);
        } catch {}
      });

      // Keep process alive
      process.stdin.resume();
      process.on('SIGINT', () => {
        console.log('\n✓ AgentOS watch stopped.');
        process.exit(0);
      });
    });
}

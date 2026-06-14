import { Command } from 'commander';
import { store } from '../store';
import { getWrapped } from '../templates';

function copyToClipboard(text: string): boolean {
  const { execSync } = require('child_process');
  try {
    if (process.platform === 'win32') {
      // Windows — pipe to clip.exe (built-in)
      const { spawnSync } = require('child_process');
      const proc = spawnSync('clip', [], { 
        input: text, 
        encoding: 'utf8',
        shell: false 
      });
      return proc.status === 0;
    } else if (process.platform === 'darwin') {
      // Mac — pbcopy (built-in)
      execSync('pbcopy', { input: text });
      return true;
    } else {
      // Linux — xclip or xsel
      try {
        execSync('xclip -selection clipboard', { input: text });
        return true;
      } catch {
        execSync('xsel --clipboard --input', { input: text });
        return true;
      }
    }
  } catch {
    return false;
  }
}

export function switchCmd(): Command {
  return new Command('switch')
    .description('Generate bootstrap prompt for new agent and copy to clipboard')
    .argument('<agent>', 'Target agent: claude|cursor|aider|opencode')
    .action(async (agent: string) => {
      if (!store.exists()) { console.error('Not initialized. Run: agentox init'); process.exit(1); }

      // Auto-snapshot before switching
      console.log('📸 Saving snapshot before switch...');
      // inline snapshot (import from snapshot logic)
      const { execSync } = require('child_process');
      try { execSync('npx agentox snapshot', { stdio: 'inherit' }); } catch {}

      const prompt = getWrapped(agent);

      // Copy to clipboard
      const copied = copyToClipboard(prompt);
      if (copied) {
        console.log('✓ Bootstrap prompt copied to clipboard');
      } else {
        console.log('(clipboard unavailable — see prompt below)');
      }

      // Update active agent
      const state = store.readState();
      state.active_agent = agent;
      state.session_start = new Date().toISOString();
      store.writeState(state);

      console.log('\n─── Bootstrap Prompt ──────────────────');
      console.log(prompt);
      console.log('──────────────────────────────────────\n');
      console.log(`✓ Now open ${agent} and paste. Run: agentox use ${agent}`);
    });
}

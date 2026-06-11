import { Command } from 'commander';
import { store } from '../store';
import { getWrapped } from '../templates';
import clipboard from 'clipboardy';

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
      try {
        await clipboard.write(prompt);
        console.log('✓ Bootstrap prompt copied to clipboard');
      } catch {
        console.log('(clipboard unavailable — prompt printed below)');
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

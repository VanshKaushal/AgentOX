import { Command } from 'commander';
import { store } from '../store';

const VALID = ['claude', 'cursor', 'opencode', 'aider', 'copilot', 'antigravity', 'windsurf', 'gemini', 'none'];

export function useCmd(): Command {
  return new Command('use')
    .description('Set active agent')
    .argument('<agent>', `Agent name: ${VALID.join('|')}`)
    .action((agent: string) => {
      if (!VALID.includes(agent)) {
        console.error(`Unknown agent "${agent}". Valid: ${VALID.join(', ')}`);
        process.exit(1);
      }
      const state = store.readState();
      const prev = state.active_agent;
      state.active_agent = agent;
      state.session_start = new Date().toISOString();
      store.writeState(state);
      console.log(`✓ Agent: ${prev} → ${agent}`);
    });
}

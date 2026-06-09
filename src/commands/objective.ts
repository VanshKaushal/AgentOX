import { Command } from 'commander';
import { store } from '../store';

export function objectiveCmd(): Command {
  return new Command('objective')
    .description('Set or update project objective')
    .argument('<text>', 'Objective description')
    .action((text: string) => {
      const state = store.readState();
      state.objective = text;
      store.writeState(state);
      console.log(`✓ Objective set: "${text}"`);
    });
}

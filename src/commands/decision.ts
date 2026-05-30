import { Command } from 'commander';
import { store } from '../store';

export function decisionCmd(): Command {
  const cmd = new Command('decision').description('Manage decisions');

  cmd.command('add <desc>')
    .description('Add an architectural or product decision')
    .option('--hard', 'Marks the decision as non-overridable')
    .action((desc: string, options) => {
      const d = store.readDecisions();
      const state = store.readState();
      d.decisions.push({
        decision: desc,
        made_by: state.active_agent,
        timestamp: new Date().toISOString(),
        reason: "Added via CLI",
        overridable: !options.hard
      });
      store.writeDecisions(d);
      console.log(`✓ Decision added: "${desc}" (overridable: ${!options.hard})`);
    });

  cmd.command('list')
    .description('List all decisions')
    .action(() => {
      const d = store.readDecisions();
      if (d.decisions.length === 0) {
        console.log('No decisions recorded.');
        return;
      }
      d.decisions.forEach((dec, i) => {
        const hardMarker = dec.overridable ? '' : ' [HARD]';
        console.log(`${i+1}. ${dec.decision}${hardMarker} (by ${dec.made_by})`);
      });
    });

  return cmd;
}

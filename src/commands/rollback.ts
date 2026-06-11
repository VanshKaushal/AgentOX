import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { store } from '../store';

export function rollbackCmd(): Command {
  return new Command('rollback')
    .description('Restore continuity from a snapshot')
    .argument('[snapshot]', 'Snapshot filename (omit for list)')
    .action((snapshot?: string) => {
      const snapDir = path.join(process.cwd(), 'agentos', 'snapshots');
      const files = fs.readdirSync(snapDir).filter(f => f.endsWith('.json')).sort().reverse();

      if (!snapshot) {
        console.log('\nAvailable snapshots:');
        files.slice(0, 10).forEach((f, i) => console.log(`  ${i+1}. ${f}`));
        console.log('\nRun: agentox rollback <filename>');
        return;
      }

      const snapPath = path.join(snapDir, snapshot);
      if (!fs.existsSync(snapPath)) { console.error(`Snapshot not found: ${snapshot}`); process.exit(1); }

      const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
      store.writeState(snap.state);
      store.writeDecisions(snap.decisions);
      store.writeTaskGraph(snap.task_graph);
      store.writeArchMap(snap.arch_map);

      console.log(`✓ Rolled back to: ${snap.timestamp}`);
      console.log(`  Agent was: ${snap.state.active_agent}`);
      console.log(`  Pending tasks: ${snap.task_graph.pending.length}`);
      console.log('\n⚠ Git files not changed — this only rolls back continuity state.');
    });
}

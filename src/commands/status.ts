import { Command } from 'commander';
import { store } from '../store';

export function statusCmd(): Command {
  return new Command('status')
    .description('Show current AgentOS state')
    .action(() => {
      if (!store.exists()) { console.error('Not initialized. Run: agentos init'); process.exit(1); }
      const s = store.readState();
      const tasks = store.readTaskGraph();
      const log = store.readLog(3);
      console.log('\n── AgentOS Status ──────────────────');
      console.log(`  Agent:     ${s.active_agent}`);
      console.log(`  Objective: ${s.objective}`);
      console.log(`  Pending:   ${tasks.pending.length} tasks`);
      console.log(`  Drift:     ${s.drift_score.toFixed(2)}`);
      console.log(`  Session:   ${s.session_start}`);
      if (tasks.pending.length) {
        console.log('\n  Tasks:');
        tasks.pending.forEach((t, i) => console.log(`    ${i+1}. ${t}`));
      }
      if (log.length) {
        console.log('\n  Recent commits:');
        log.forEach(e => console.log(`    [${e.agent}] ${e.summary.slice(0,60)}`));
      }
      console.log('────────────────────────────────────\n');
    });
}

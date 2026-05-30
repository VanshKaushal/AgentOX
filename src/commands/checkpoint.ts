import { Command } from 'commander';
import { runAudit } from '../audit';
import { store } from '../store';
import readline from 'readline';

export function checkpointCmd(): Command {
  return new Command('checkpoint')
    .description('Human review gate before next agent session')
    .action(async () => {
      const state = store.readState();
      const report = runAudit(state.fingerprint);

      console.log('\n🔍 Checkpoint Review Required\n');
      console.log(`Drift: ${report.drift_score.toFixed(2)} | Violations: ${report.decisions_violated.length} | Sentinel: ${report.sentinel_created ? 'TRIGGERED' : 'clean'}`);
      if (report.warnings.length) report.warnings.forEach(w => console.log(`⚠ ${w}`));

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question('\nApprove session? Continue to next agent? (yes/no): ', (ans) => {
        rl.close();
        if (ans.toLowerCase() === 'yes') {
          console.log('✓ Checkpoint cleared. Run: agentos switch ');
        } else {
          console.log('✗ Checkpoint blocked. Review drift and fix before switching.');
          process.exit(1);
        }
      });
    });
}

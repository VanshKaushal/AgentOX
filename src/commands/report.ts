import { Command } from 'commander';
import { runAudit } from '../audit';
import { store } from '../store';

export function reportCmd(): Command {
  return new Command('report')
    .description('Show post-session audit report')
    .action(() => {
      const state = store.readState();
      const report = runAudit(state.fingerprint);
      console.log('\n── AgentOS Audit Report ─────────────');
      console.log(`  Drift score:    ${report.drift_score.toFixed(2)} ${report.drift_score > 0.4 ? '⚠' : '✓'}`);
      console.log(`  Files changed:  ${report.files_changed.length}`);
      console.log(`  Tasks touched:  ${report.tasks_touched.length}/${report.tasks_pending.length}`);
      console.log(`  Violations:     ${report.decisions_violated.length}`);
      console.log(`  Fingerprint:    ${report.fingerprint_changed ? '⚠ CHANGED' : '✓ stable'}`);
      console.log(`  Sentinel trap:  ${report.sentinel_created ? '🚨 TRIGGERED' : '✓ clean'}`);
      if (report.warnings.length) {
        console.log('\n  Warnings:');
        report.warnings.forEach(w => console.log(`    ⚠ ${w}`));
      }
      if (report.decisions_violated.length) {
        console.log('\n  Violations:');
        report.decisions_violated.forEach(v => console.log(`    ✗ ${v}`));
      }
      console.log('────────────────────────────────────\n');
    });
}

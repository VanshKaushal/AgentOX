"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportCmd = reportCmd;
const commander_1 = require("commander");
const audit_1 = require("../audit");
const store_1 = require("../store");
function reportCmd() {
    return new commander_1.Command('report')
        .description('Show post-session audit report')
        .action(() => {
        const state = store_1.store.readState();
        const report = (0, audit_1.runAudit)(state.fingerprint);
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

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkpointCmd = checkpointCmd;
const commander_1 = require("commander");
const audit_1 = require("../audit");
const store_1 = require("../store");
const readline_1 = __importDefault(require("readline"));
function checkpointCmd() {
    return new commander_1.Command('checkpoint')
        .description('Human review gate before next agent session')
        .action(async () => {
        const state = store_1.store.readState();
        const report = (0, audit_1.runAudit)(state.fingerprint);
        console.log('\n🔍 Checkpoint Review Required\n');
        console.log(`Drift: ${report.drift_score.toFixed(2)} | Violations: ${report.decisions_violated.length} | Sentinel: ${report.sentinel_created ? 'TRIGGERED' : 'clean'}`);
        if (report.warnings.length)
            report.warnings.forEach(w => console.log(`⚠ ${w}`));
        const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('\nApprove session? Continue to next agent? (yes/no): ', (ans) => {
            rl.close();
            if (ans.toLowerCase() === 'yes') {
                console.log('✓ Checkpoint cleared. Run: agentos switch ');
            }
            else {
                console.log('✗ Checkpoint blocked. Review drift and fix before switching.');
                process.exit(1);
            }
        });
    });
}

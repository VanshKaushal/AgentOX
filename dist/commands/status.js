"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCmd = statusCmd;
const commander_1 = require("commander");
const store_1 = require("../store");
function statusCmd() {
    return new commander_1.Command('status')
        .description('Show current AgentOS state')
        .action(() => {
        if (!store_1.store.exists()) {
            console.error('Not initialized. Run: agentox init');
            process.exit(1);
        }
        const s = store_1.store.readState();
        const tasks = store_1.store.readTaskGraph();
        const log = store_1.store.readLog(3);
        console.log('\n── AgentOS Status ──────────────────');
        console.log(`  Agent:     ${s.active_agent}`);
        console.log(`  Objective: ${s.objective}`);
        console.log(`  Pending:   ${tasks.pending.length} tasks`);
        console.log(`  Drift:     ${s.drift_score.toFixed(2)}`);
        console.log(`  Session:   ${s.session_start}`);
        if (tasks.pending.length) {
            console.log('\n  Tasks:');
            tasks.pending.forEach((t, i) => console.log(`    ${i + 1}. ${t}`));
        }
        if (log.length) {
            console.log('\n  Recent commits:');
            log.forEach(e => console.log(`    [${e.agent}] ${e.summary.slice(0, 60)}`));
        }
        console.log('────────────────────────────────────\n');
    });
}

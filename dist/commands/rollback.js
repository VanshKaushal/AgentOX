"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollbackCmd = rollbackCmd;
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const store_1 = require("../store");
function rollbackCmd() {
    return new commander_1.Command('rollback')
        .description('Restore continuity from a snapshot')
        .argument('[snapshot]', 'Snapshot filename (omit for list)')
        .action((snapshot) => {
        const snapDir = path_1.default.join(process.cwd(), 'agentos', 'snapshots');
        const files = fs_1.default.readdirSync(snapDir).filter(f => f.endsWith('.json')).sort().reverse();
        if (!snapshot) {
            console.log('\nAvailable snapshots:');
            files.slice(0, 10).forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
            console.log('\nRun: agentox rollback <filename>');
            return;
        }
        const snapPath = path_1.default.join(snapDir, snapshot);
        if (!fs_1.default.existsSync(snapPath)) {
            console.error(`Snapshot not found: ${snapshot}`);
            process.exit(1);
        }
        const snap = JSON.parse(fs_1.default.readFileSync(snapPath, 'utf8'));
        store_1.store.writeState(snap.state);
        store_1.store.writeDecisions(snap.decisions);
        store_1.store.writeTaskGraph(snap.task_graph);
        store_1.store.writeArchMap(snap.arch_map);
        console.log(`✓ Rolled back to: ${snap.timestamp}`);
        console.log(`  Agent was: ${snap.state.active_agent}`);
        console.log(`  Pending tasks: ${snap.task_graph.pending.length}`);
        console.log('\n⚠ Git files not changed — this only rolls back continuity state.');
    });
}

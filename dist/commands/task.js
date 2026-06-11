"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskCmd = taskCmd;
const commander_1 = require("commander");
const store_1 = require("../store");
function taskCmd() {
    const cmd = new commander_1.Command('task').description('Manage tasks');
    cmd.command('add <desc>')
        .description('Add pending task')
        .action((desc) => {
        const g = store_1.store.readTaskGraph();
        g.pending.push(desc);
        store_1.store.writeTaskGraph(g);
        console.log(`✓ Task added: "${desc}"`);
    });
    cmd.command('done <idxOrText>')
        .description('Mark task complete by index (1-based) or partial name match')
        .action((idxOrText) => {
        const g = store_1.store.readTaskGraph();
        let i = -1;
        const asNum = parseInt(idxOrText);
        if (!isNaN(asNum) && String(asNum) === idxOrText.trim()) {
            i = asNum - 1;
            if (i < 0 || i >= g.pending.length) {
                console.error(`Invalid index ${asNum}. You have ${g.pending.length} pending tasks:`);
                g.pending.forEach((t, idx) => console.log(`  ${idx + 1}. ${t}`));
                process.exit(1);
            }
        }
        else {
            const lower = idxOrText.toLowerCase();
            i = g.pending.findIndex(t => t.toLowerCase().includes(lower));
            if (i === -1) {
                console.error(`No task found matching "${idxOrText}"`);
                console.log('Pending tasks:');
                g.pending.forEach((t, idx) => console.log(`  ${idx + 1}. ${t}`));
                process.exit(1);
            }
        }
        const taskName = g.pending[i];
        console.log(`About to complete: "${taskName}"`);
        g.pending.splice(i, 1);
        g.completed.push(taskName);
        store_1.store.writeTaskGraph(g);
        console.log(`✓ Completed: "${taskName}"`);
    });
    cmd.command('list')
        .description('List all tasks')
        .action(() => {
        const g = store_1.store.readTaskGraph();
        console.log('\nPending:');
        g.pending.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
        console.log('\nCompleted:');
        g.completed.forEach(t => console.log(`  ✓ ${t}`));
    });
    cmd.command('clear')
        .description('Remove all pending tasks')
        .action(() => {
        const g = store_1.store.readTaskGraph();
        const count = g.pending.length;
        g.pending = [];
        store_1.store.writeTaskGraph(g);
        console.log(`✓ Cleared ${count} pending tasks`);
    });
    cmd.command('dedup')
        .description('Remove duplicate pending tasks')
        .action(() => {
        const g = store_1.store.readTaskGraph();
        const before = g.pending.length;
        g.pending = [...new Set(g.pending)];
        const removed = before - g.pending.length;
        store_1.store.writeTaskGraph(g);
        console.log(`✓ Removed ${removed} duplicate(s)`);
    });
    return cmd;
}

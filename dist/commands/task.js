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
    cmd.command('done <idx>')
        .description('Mark task complete by index (1-based)')
        .action((idx) => {
        const g = store_1.store.readTaskGraph();
        const i = parseInt(idx) - 1;
        if (i < 0 || i >= g.pending.length) {
            console.error('Invalid index');
            process.exit(1);
        }
        const done = g.pending.splice(i, 1)[0];
        g.completed.push(done);
        store_1.store.writeTaskGraph(g);
        console.log(`✓ Completed: "${done}"`);
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
    return cmd;
}

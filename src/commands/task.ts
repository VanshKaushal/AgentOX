import { Command } from 'commander';
import { store } from '../store';

export function taskCmd(): Command {
  const cmd = new Command('task').description('Manage tasks');

  cmd.command('add <desc>')
    .description('Add pending task')
    .action((desc: string) => {
      const g = store.readTaskGraph();
      g.pending.push(desc);
      store.writeTaskGraph(g);
      console.log(`✓ Task added: "${desc}"`);
    });

  cmd.command('done <idx>')
    .description('Mark task complete by index (1-based)')
    .action((idx: string) => {
      const g = store.readTaskGraph();
      const i = parseInt(idx) - 1;
      if (i < 0 || i >= g.pending.length) { console.error('Invalid index'); process.exit(1); }
      const done = g.pending.splice(i, 1)[0];
      g.completed.push(done);
      store.writeTaskGraph(g);
      console.log(`✓ Completed: "${done}"`);
    });

  cmd.command('list')
    .description('List all tasks')
    .action(() => {
      const g = store.readTaskGraph();
      console.log('\nPending:');
      g.pending.forEach((t, i) => console.log(`  ${i+1}. ${t}`));
      console.log('\nCompleted:');
      g.completed.forEach(t => console.log(`  ✓ ${t}`));
    });

  return cmd;
}

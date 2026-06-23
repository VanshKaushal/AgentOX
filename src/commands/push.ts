import { Command } from 'commander';
import { store } from '../store';

export function pushCmd(): Command {
  return new Command('push')
    .description('Sync context to cloud (Pro feature)')
    .action(async () => {
      const token = process.env.AGENTOX_TOKEN;
      if (!token) {
        console.log('🔒 Pro feature. Get your token at agentox.dev');
        console.log('   Then: export AGENTOX_TOKEN=your_token');
        return;
      }
      console.log('☁ Pushing context to cloud...');
      const state = store.readState();
      const tasks = store.readTaskGraph();
      const decisions = store.readDecisions();
      const history = store.readLog(20);
      
      const BASE_URL = process.env.AGENTOX_API_URL || 'http://localhost:3000';
      const res = await fetch(`${BASE_URL}/api/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_name: require('path').basename(process.cwd()),
          state, tasks, decisions, history
        })
      });
      
      if (res.ok) {
        console.log('✓ Context synced to cloud');
        console.log('  View at: agentox.dev/dashboard');
      } else {
        console.error('✗ Sync failed:', await res.text());
      }
    });
}

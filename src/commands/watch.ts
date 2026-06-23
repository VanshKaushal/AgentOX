import { Command } from 'commander';
import { FileWatcher } from '../watchers/file-watcher';
import { store } from '../store';
import fs from 'fs';
import path from 'path';
import { scanRepo } from '../scanners/repo-scanner';

export function watchCmd(): Command {
  return new Command('watch')
    .description('Auto-track file changes (no git required)')
    .option('--debounce <ms>', 'Debounce delay in ms', '4000')
    .action((opts) => {
      if (!store.exists()) {
        console.log('📁 No AgentOX found. Auto-initializing...');
        // Create dirs
        const agentosDir = path.join(process.cwd(), 'agentos');
        const dirs = [agentosDir, 
          path.join(agentosDir,'snapshots'),
          path.join(agentosDir,'summaries')];
        dirs.forEach(d => { 
          if (!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true}); 
        });
        // Write defaults
        const { defaultState, defaultDecisions, 
                defaultTaskGraph, defaultArchMap } = require('../schema');
        const statePath = path.join(agentosDir,'state.json');
        const logPath = path.join(agentosDir,'execution_log.jsonl');
        if (!fs.existsSync(statePath)) 
          fs.writeFileSync(statePath, JSON.stringify(defaultState(),null,2));
        if (!fs.existsSync(path.join(agentosDir,'decisions.json')))
          fs.writeFileSync(path.join(agentosDir,'decisions.json'), 
            JSON.stringify(defaultDecisions(),null,2));
        if (!fs.existsSync(path.join(agentosDir,'task_graph.json')))
          fs.writeFileSync(path.join(agentosDir,'task_graph.json'), 
            JSON.stringify(defaultTaskGraph(),null,2));
        
        const repoCtx = scanRepo(process.cwd());
        fs.writeFileSync(
          path.join(agentosDir,'architecture_map.json'),
          JSON.stringify(repoCtx, null, 2)
        );
        console.log(`✓ Detected: ${repoCtx.language} / ${repoCtx.framework}`);

        if (!fs.existsSync(logPath)) 
          fs.writeFileSync(logPath, '');
        console.log('✓ AgentOX ready (run agentox init for full setup)\n');
      }
      const debounce = parseInt(opts.debounce) || 4000;
      const watcher = new FileWatcher(process.cwd(), debounce);
      watcher.start();
      process.stdin.resume();
      process.on('SIGINT', () => { watcher.stop(); process.exit(0); });
      process.on('SIGTERM', () => { watcher.stop(); process.exit(0); });
    });
}

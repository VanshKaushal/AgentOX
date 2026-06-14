import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { store } from '../store';
import { defaultState, defaultDecisions, defaultTaskGraph, defaultArchMap } from '../schema';
import crypto from 'crypto';

export function initCmd(): Command {
  return new Command('init')
    .description('Initialize AgentOS in current repo')
    .action(() => {
      const agentosDir = path.join(process.cwd(), 'agentos');
      const snapshotsDir = path.join(agentosDir, 'snapshots');
      const summariesDir = path.join(agentosDir, 'summaries');

      if (!fs.existsSync(agentosDir)) {
        fs.mkdirSync(agentosDir, { recursive: true });
      }
      if (!fs.existsSync(snapshotsDir)) {
        fs.mkdirSync(snapshotsDir, { recursive: true });
      }
      if (!fs.existsSync(summariesDir)) {
        fs.mkdirSync(summariesDir, { recursive: true });
      }

      // Auto-generate Claude Code MCP config
      const claudeDir = path.join(process.cwd(), '.claude');
      const mcpConfig = {
        mcpServers: {
          agentox: {
            command: 'agentox',
            args: ['serve', 'start'],
            cwd: process.cwd()
          }
        }
      };
      if (!fs.existsSync(claudeDir)) {
        fs.mkdirSync(claudeDir, { recursive: true });
      }
      const mcpPath = path.join(claudeDir, 'mcp.json');
      if (!fs.existsSync(mcpPath)) {
        fs.writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
        console.log('✓ Claude Code MCP config written to .claude/mcp.json');
      }

      // Auto-generate Cursor MCP config
      const cursorDir = path.join(process.cwd(), '.cursor');
      if (!fs.existsSync(cursorDir)) {
        fs.mkdirSync(cursorDir, { recursive: true });
      }
      const cursorMcpPath = path.join(cursorDir, 'mcp.json');
      if (!fs.existsSync(cursorMcpPath)) {
        fs.writeFileSync(cursorMcpPath, JSON.stringify(mcpConfig, null, 2));
        console.log('✓ Cursor MCP config written to .cursor/mcp.json');
      }

      // Write default files only if they don't exist
      const p = (f: string) => path.join(process.cwd(), 'agentos', f);
      if (!fs.existsSync(p('state.json'))) store.writeState(defaultState());
      if (!fs.existsSync(p('decisions.json'))) store.writeDecisions(defaultDecisions());
      if (!fs.existsSync(p('task_graph.json'))) store.writeTaskGraph(defaultTaskGraph());
      if (!fs.existsSync(p('architecture_map.json'))) store.writeArchMap(defaultArchMap());
      if (!fs.existsSync(p('execution_log.jsonl'))) fs.writeFileSync(p('execution_log.jsonl'), '');

      // Write .agentosignore
      const ignore = ['node_modules/', 'dist/', '.env', 'build/', '.next/', '__pycache__/'].join('\n');
      fs.writeFileSync(path.join(process.cwd(), '.agentosignore'), ignore);

      // Install git post-commit hook
      const hookDir = path.join(process.cwd(), '.git', 'hooks');
      const hookPath = path.join(hookDir, 'post-commit');
      if (fs.existsSync(hookDir)) {
        const hook = `#!/bin/sh\nnpx -y agentox _log-commit 2>/dev/null || true\n`;
        fs.writeFileSync(hookPath, hook);
        fs.chmodSync(hookPath, '755');
        console.log('✓ Git hook installed');
      }

      // Ensure agentos/ is NOT in .gitignore
      const gi = path.join(process.cwd(), '.gitignore');
      if (fs.existsSync(gi)) {
        const content = fs.readFileSync(gi, 'utf8');
        if (content.includes('agentos/')) {
          console.warn('⚠ agentos/ is in .gitignore — remove it or continuity will not persist');
        }
      }

      console.log('✓ AgentOS initialized. Run: agentox status');
    });
}

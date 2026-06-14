import { Command } from 'commander';
import { startMcpServer } from '../mcp/server';
import fs from 'fs';
import path from 'path';

export function serveCmd(): Command {
  const cmd = new Command('serve')
    .description('Start AgentOX MCP server for native agent integration');

  cmd.command('start')
    .description('Start MCP server (stdio mode for Claude Code)')
    .action(async () => {
      if (!fs.existsSync(path.join(process.cwd(), 'agentos'))) {
        console.error('Not initialized. Run: agentox init');
        process.exit(1);
      }
      console.error('AgentOX MCP server starting...');
      console.error('Add to Claude Code: agentox serve start');
      console.error('━━━ AgentOX MCP Server ━━━');
      console.error('Status: running');
      console.error('Mode: stdio (for Claude Code / Cursor)');
      console.error('Tools available: 13');
      console.error('Run "agentox serve config" to get');
      console.error('the config JSON for your IDE.');
      console.error('Press Ctrl+C to stop.');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━');
      await startMcpServer();
    });

  cmd.command('stop')
    .description('Stop running MCP server')
    .action(() => {
      const pidFile = path.join(
        process.cwd(), 'agentos', '.mcp.pid'
      );
      if (!fs.existsSync(pidFile)) {
        console.log('No MCP server PID file found.');
        console.log('Server may not be running.');
        return;
      }
      try {
        const pid = parseInt(fs.readFileSync(pidFile,'utf8').trim());
        // Check if process actually alive
        try {
          process.kill(pid, 0); // signal 0 = check only
          process.kill(pid);    // actually kill it
          fs.unlinkSync(pidFile);
          console.log(`✓ MCP server stopped (PID ${pid})`);
        } catch {
          // Process already dead — clean up stale PID file
          fs.unlinkSync(pidFile);
          console.log('✓ Cleaned up stale PID file.');
          console.log('  Server was already stopped.');
        }
      } catch(e) {
        console.log('Failed to stop:', (e as Error).message);
      }
    });

  cmd.command('config')
    .description('Print MCP config to add to Claude Code / Cursor')
    .action(() => {
      const config = {
        mcpServers: {
          agentox: {
            command: 'agentox',
            args: ['serve', 'start']
          }
        }
      };
      console.log('\n── Add this to your Claude Code MCP config ──');
      console.log('File: .claude/mcp.json OR ~/.claude/mcp.json\n');
      console.log(JSON.stringify(config, null, 2));
      console.log('\n── Add this to Cursor MCP config ──');
      console.log('File: .cursor/mcp.json\n');
      console.log(JSON.stringify(config, null, 2));
      console.log('\nAfter adding: restart Claude Code / Cursor');
      console.log('AgentOX tools will appear automatically.\n');
    });

  return cmd;
}

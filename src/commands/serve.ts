import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { startMcpServer } from '../mcp/server';

export function serveCmd() {
  return new Command('serve')
    .description('Start the AgentOS MCP server')
    .action(async () => {
      const pidPath = path.join(process.cwd(), 'agentos', '.mcp.pid');
      fs.writeFileSync(pidPath, process.pid.toString());
      try {
        await startMcpServer();
      } catch (error) {
        console.error('Failed to start MCP server:', error);
        process.exit(1);
      }
    });
}

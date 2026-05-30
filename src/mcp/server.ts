import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { store } from '../store';
import { getWrapped } from '../templates';
import { runAudit } from '../audit';

const server = new Server(
  { name: 'agentos', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'get_state', description: 'Get current AgentOS state', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_pending_tasks', description: 'Get pending task list', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_decisions', description: 'Get all decisions', inputSchema: { type: 'object', properties: {} } },
    { name: 'get_bootstrap_prompt', description: 'Generate bootstrap prompt', inputSchema: { type: 'object', properties: { target_agent: { type: 'string' } }, required: ['target_agent'] } },
    { name: 'log_session', description: 'Log a session entry', inputSchema: { type: 'object', properties: { agent: { type: 'string' }, files_changed: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } }, required: ['agent','files_changed','summary'] } }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  switch (name) {
    case 'get_state': return { content: [{ type: 'text', text: JSON.stringify(store.readState(), null, 2) }] };
    case 'get_pending_tasks': return { content: [{ type: 'text', text: JSON.stringify(store.readTaskGraph().pending) }] };
    case 'get_decisions': return { content: [{ type: 'text', text: JSON.stringify(store.readDecisions()) }] };
    case 'get_bootstrap_prompt': return { content: [{ type: 'text', text: getWrapped((args as any).target_agent) }] };
    case 'log_session': {
      const { agent, files_changed, summary } = args as any;
      const crypto = require('crypto');
      store.appendLog({ timestamp: new Date().toISOString(), agent, files_changed, summary, accepted: true, session_id: crypto.randomUUID() });
      return { content: [{ type: 'text', text: 'Logged' }] };
    }
    default: throw new Error(`Unknown tool: ${name}`);
  }
});

export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

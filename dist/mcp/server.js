"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMcpServer = startMcpServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const store_1 = require("../store");
const templates_1 = require("../templates");
const audit_1 = require("../audit");
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const server = new index_js_1.Server({ name: 'agentox', version: '0.1.1' }, { capabilities: { tools: {} } });
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'get_state',
            description: 'Get current AgentOX continuity state — active agent, objective, drift score, session info',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'get_pending_tasks',
            description: 'Get all pending tasks in order. Always call this before starting work.',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'get_decisions',
            description: 'Get all architectural decisions. Decisions with overridable:false MUST NOT be violated.',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'get_architecture_map',
            description: 'Get the current architecture map of the project',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'get_recent_history',
            description: 'Get last N commit log entries showing what each agent did',
            inputSchema: {
                type: 'object',
                properties: {
                    limit: { type: 'number', description: 'Number of entries (default 5)' }
                }
            }
        },
        {
            name: 'get_bootstrap_prompt',
            description: 'Generate full continuity handoff prompt for a target agent',
            inputSchema: {
                type: 'object',
                properties: {
                    target_agent: {
                        type: 'string',
                        description: 'Target agent: claude|cursor|opencode|aider|antigravity|windsurf'
                    }
                },
                required: ['target_agent']
            }
        },
        {
            name: 'log_session',
            description: 'Log what this agent did in this session. Call before ending session.',
            inputSchema: {
                type: 'object',
                properties: {
                    agent: { type: 'string', description: 'Agent name' },
                    files_changed: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of files this agent modified'
                    },
                    summary: { type: 'string', description: 'One sentence summary of what was done' },
                    commit_message: { type: 'string', description: 'Git commit message if committed' }
                },
                required: ['agent', 'files_changed', 'summary']
            }
        },
        {
            name: 'set_active_agent',
            description: 'Update which agent is currently active',
            inputSchema: {
                type: 'object',
                properties: {
                    agent: { type: 'string', description: 'Agent name' }
                },
                required: ['agent']
            }
        },
        {
            name: 'add_task',
            description: 'Add a new pending task',
            inputSchema: {
                type: 'object',
                properties: {
                    task: { type: 'string', description: 'Task description' }
                },
                required: ['task']
            }
        },
        {
            name: 'complete_task',
            description: 'Mark a task as completed by name or index',
            inputSchema: {
                type: 'object',
                properties: {
                    task_identifier: {
                        type: 'string',
                        description: 'Task name (partial match ok) or index number'
                    }
                },
                required: ['task_identifier']
            }
        },
        {
            name: 'add_decision',
            description: 'Record an architectural decision',
            inputSchema: {
                type: 'object',
                properties: {
                    decision: { type: 'string', description: 'Decision description' },
                    reason: { type: 'string', description: 'Why this decision was made' },
                    overridable: {
                        type: 'boolean',
                        description: 'Can future agents override this? false = HARD constraint'
                    }
                },
                required: ['decision']
            }
        },
        {
            name: 'get_audit_report',
            description: 'Get drift score and audit report for current session',
            inputSchema: { type: 'object', properties: {} }
        },
        {
            name: 'get_full_context',
            description: 'Get EVERYTHING in one call — state + tasks + decisions + history + architecture. Use this at session start.',
            inputSchema: { type: 'object', properties: {} }
        }
    ]
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    const a = (args || {});
    try {
        switch (name) {
            case 'get_state':
                return { content: [{ type: 'text', text: JSON.stringify(store_1.store.readState(), null, 2) }] };
            case 'get_pending_tasks': {
                const g = store_1.store.readTaskGraph();
                const result = {
                    pending: g.pending,
                    in_progress: g.in_progress,
                    completed_count: g.completed.length,
                    total_pending: g.pending.length
                };
                return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
            }
            case 'get_decisions':
                return { content: [{ type: 'text', text: JSON.stringify(store_1.store.readDecisions(), null, 2) }] };
            case 'get_architecture_map':
                return { content: [{ type: 'text', text: JSON.stringify(store_1.store.readArchMap(), null, 2) }] };
            case 'get_recent_history': {
                const limit = a.limit || 5;
                const entries = store_1.store.readLog(limit);
                return { content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }] };
            }
            case 'get_bootstrap_prompt': {
                const prompt = (0, templates_1.getWrapped)(a.target_agent || 'claude');
                return { content: [{ type: 'text', text: prompt }] };
            }
            case 'log_session': {
                const entry = {
                    timestamp: new Date().toISOString(),
                    agent: a.agent,
                    files_changed: a.files_changed || [],
                    summary: a.summary,
                    commit_message: a.commit_message || '',
                    accepted: true,
                    session_id: crypto_1.default.randomUUID()
                };
                store_1.store.appendLog(entry);
                return { content: [{ type: 'text', text: `✓ Session logged for agent: ${a.agent}` }] };
            }
            case 'set_active_agent': {
                const state = store_1.store.readState();
                const prev = state.active_agent;
                state.active_agent = a.agent;
                state.session_start = new Date().toISOString();
                store_1.store.writeState(state);
                return { content: [{ type: 'text', text: `✓ Agent: ${prev} → ${a.agent}` }] };
            }
            case 'add_task': {
                const g = store_1.store.readTaskGraph();
                g.pending.push(a.task);
                store_1.store.writeTaskGraph(g);
                return { content: [{ type: 'text', text: `✓ Task added: "${a.task}"` }] };
            }
            case 'complete_task': {
                const g = store_1.store.readTaskGraph();
                const id = a.task_identifier;
                const asNum = parseInt(id);
                let i = -1;
                if (!isNaN(asNum) && String(asNum) === id.trim()) {
                    i = asNum - 1;
                }
                else {
                    i = g.pending.findIndex((t) => t.toLowerCase().includes(id.toLowerCase()));
                }
                if (i === -1 || i >= g.pending.length) {
                    return { content: [{ type: 'text', text: `✗ Task not found: "${id}"` }] };
                }
                const done = g.pending.splice(i, 1)[0];
                g.completed.push(done);
                store_1.store.writeTaskGraph(g);
                return { content: [{ type: 'text', text: `✓ Completed: "${done}"` }] };
            }
            case 'add_decision': {
                const decisions = store_1.store.readDecisions();
                decisions.decisions.push({
                    decision: a.decision,
                    made_by: 'agent',
                    timestamp: new Date().toISOString(),
                    reason: a.reason || '',
                    overridable: a.overridable !== false
                });
                store_1.store.writeDecisions(decisions);
                return { content: [{ type: 'text', text: `✓ Decision recorded: "${a.decision}"` }] };
            }
            case 'get_audit_report': {
                const state = store_1.store.readState();
                const report = (0, audit_1.runAudit)(state.fingerprint);
                return { content: [{ type: 'text', text: JSON.stringify(report, null, 2) }] };
            }
            case 'get_full_context': {
                const state = store_1.store.readState();
                const tasks = store_1.store.readTaskGraph();
                const decisions = store_1.store.readDecisions();
                const history = store_1.store.readLog(5);
                const arch = store_1.store.readArchMap();
                const full = {
                    agent: state.active_agent,
                    objective: state.objective,
                    drift_score: state.drift_score,
                    fingerprint: state.fingerprint,
                    pending_tasks: tasks.pending,
                    hard_decisions: decisions.decisions.filter((d) => !d.overridable),
                    soft_decisions: decisions.decisions.filter((d) => d.overridable),
                    recent_history: history,
                    architecture: arch,
                    instructions: [
                        'Complete pending_tasks in order',
                        'Never violate hard_decisions',
                        'Do not create agentos/trap.sentinel',
                        'Log your session when done using log_session tool'
                    ]
                };
                return { content: [{ type: 'text', text: JSON.stringify(full, null, 2) }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (e) {
        return {
            content: [{ type: 'text', text: `Error: ${e.message}` }],
            isError: true
        };
    }
});
async function startMcpServer() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    // Write PID for stop command
    const pidFile = path_1.default.join(process.cwd(), 'agentos', '.mcp.pid');
    try {
        fs_1.default.writeFileSync(pidFile, String(process.pid));
    }
    catch { }
}

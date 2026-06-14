"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCmd = initCmd;
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const store_1 = require("../store");
const schema_1 = require("../schema");
function initCmd() {
    return new commander_1.Command('init')
        .description('Initialize AgentOS in current repo')
        .action(() => {
        const agentosDir = path_1.default.join(process.cwd(), 'agentos');
        const snapshotsDir = path_1.default.join(agentosDir, 'snapshots');
        const summariesDir = path_1.default.join(agentosDir, 'summaries');
        if (!fs_1.default.existsSync(agentosDir)) {
            fs_1.default.mkdirSync(agentosDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(snapshotsDir)) {
            fs_1.default.mkdirSync(snapshotsDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(summariesDir)) {
            fs_1.default.mkdirSync(summariesDir, { recursive: true });
        }
        // Auto-generate Claude Code MCP config
        const claudeDir = path_1.default.join(process.cwd(), '.claude');
        const mcpConfig = {
            mcpServers: {
                agentox: {
                    command: 'agentox',
                    args: ['serve', 'start'],
                    cwd: process.cwd()
                }
            }
        };
        if (!fs_1.default.existsSync(claudeDir)) {
            fs_1.default.mkdirSync(claudeDir, { recursive: true });
        }
        const mcpPath = path_1.default.join(claudeDir, 'mcp.json');
        if (!fs_1.default.existsSync(mcpPath)) {
            fs_1.default.writeFileSync(mcpPath, JSON.stringify(mcpConfig, null, 2));
            console.log('✓ Claude Code MCP config written to .claude/mcp.json');
        }
        // Auto-generate Cursor MCP config
        const cursorDir = path_1.default.join(process.cwd(), '.cursor');
        if (!fs_1.default.existsSync(cursorDir)) {
            fs_1.default.mkdirSync(cursorDir, { recursive: true });
        }
        const cursorMcpPath = path_1.default.join(cursorDir, 'mcp.json');
        if (!fs_1.default.existsSync(cursorMcpPath)) {
            fs_1.default.writeFileSync(cursorMcpPath, JSON.stringify(mcpConfig, null, 2));
            console.log('✓ Cursor MCP config written to .cursor/mcp.json');
        }
        // Write default files only if they don't exist
        const p = (f) => path_1.default.join(process.cwd(), 'agentos', f);
        if (!fs_1.default.existsSync(p('state.json')))
            store_1.store.writeState((0, schema_1.defaultState)());
        if (!fs_1.default.existsSync(p('decisions.json')))
            store_1.store.writeDecisions((0, schema_1.defaultDecisions)());
        if (!fs_1.default.existsSync(p('task_graph.json')))
            store_1.store.writeTaskGraph((0, schema_1.defaultTaskGraph)());
        if (!fs_1.default.existsSync(p('architecture_map.json')))
            store_1.store.writeArchMap((0, schema_1.defaultArchMap)());
        if (!fs_1.default.existsSync(p('execution_log.jsonl')))
            fs_1.default.writeFileSync(p('execution_log.jsonl'), '');
        // Write .agentosignore
        const ignore = ['node_modules/', 'dist/', '.env', 'build/', '.next/', '__pycache__/'].join('\n');
        fs_1.default.writeFileSync(path_1.default.join(process.cwd(), '.agentosignore'), ignore);
        // Install git post-commit hook
        const hookDir = path_1.default.join(process.cwd(), '.git', 'hooks');
        const hookPath = path_1.default.join(hookDir, 'post-commit');
        if (fs_1.default.existsSync(hookDir)) {
            const hook = `#!/bin/sh\nnpx -y agentox _log-commit 2>/dev/null || true\n`;
            fs_1.default.writeFileSync(hookPath, hook);
            fs_1.default.chmodSync(hookPath, '755');
            console.log('✓ Git hook installed');
        }
        // Ensure agentos/ is NOT in .gitignore
        const gi = path_1.default.join(process.cwd(), '.gitignore');
        if (fs_1.default.existsSync(gi)) {
            const content = fs_1.default.readFileSync(gi, 'utf8');
            if (content.includes('agentos/')) {
                console.warn('⚠ agentos/ is in .gitignore — remove it or continuity will not persist');
            }
        }
        console.log('✓ AgentOS initialized. Run: agentox status');
    });
}

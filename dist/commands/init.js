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
        store_1.store.ensureDir();
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
            const hook = `#!/bin/sh\nnpx agentos _log-commit 2>/dev/null || true\n`;
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
        console.log('✓ AgentOS initialized. Run: agentos status');
    });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullCmd = pullCmd;
const commander_1 = require("commander");
const store_1 = require("../store");
const path_1 = __importDefault(require("path"));
function pullCmd() {
    return new commander_1.Command('pull')
        .description('Pull context from cloud (Pro feature)')
        .action(async () => {
        const token = process.env.AGENTOX_TOKEN;
        if (!token) {
            console.log('🔒 Pro feature. Get your token at agentox.dev');
            console.log('   Then: export AGENTOX_TOKEN=your_token');
            return;
        }
        const projectName = path_1.default.basename(process.cwd());
        console.log(`☁ Pulling context for ${projectName}...`);
        const BASE_URL = process.env.AGENTOX_API_URL || 'http://localhost:3000';
        const res = await fetch(`${BASE_URL}/api/pull?project=${projectName}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const { data } = await res.json();
            // Write pulled state to local agentos/
            if (data.state)
                store_1.store.writeState(data.state);
            if (data.tasks)
                store_1.store.writeTaskGraph(data.tasks);
            if (data.decisions)
                store_1.store.writeDecisions(data.decisions);
            console.log('✓ Context pulled from cloud');
            console.log(`  Project: ${data.project_name}`);
            console.log(`  Synced: ${data.synced_at}`);
        }
        else {
            const err = await res.json();
            console.error('✗ Pull failed:', err.error);
        }
    });
}

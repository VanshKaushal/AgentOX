"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchCmd = switchCmd;
const commander_1 = require("commander");
const store_1 = require("../store");
const templates_1 = require("../templates");
function copyToClipboard(text) {
    const { execSync } = require('child_process');
    try {
        if (process.platform === 'win32') {
            // Windows — pipe to clip.exe (built-in)
            const { spawnSync } = require('child_process');
            const proc = spawnSync('clip', [], {
                input: text,
                encoding: 'utf8',
                shell: false
            });
            return proc.status === 0;
        }
        else if (process.platform === 'darwin') {
            // Mac — pbcopy (built-in)
            execSync('pbcopy', { input: text });
            return true;
        }
        else {
            // Linux — xclip or xsel
            try {
                execSync('xclip -selection clipboard', { input: text });
                return true;
            }
            catch {
                execSync('xsel --clipboard --input', { input: text });
                return true;
            }
        }
    }
    catch {
        return false;
    }
}
function switchCmd() {
    return new commander_1.Command('switch')
        .description('Generate bootstrap prompt for new agent and copy to clipboard')
        .argument('<agent>', 'Target agent: claude|cursor|aider|opencode')
        .action(async (agent) => {
        if (!store_1.store.exists()) {
            console.error('Not initialized. Run: agentox init');
            process.exit(1);
        }
        // Auto-snapshot before switching
        console.log('📸 Saving snapshot before switch...');
        // inline snapshot (import from snapshot logic)
        const { execSync } = require('child_process');
        try {
            execSync('npx agentox snapshot', { stdio: 'inherit' });
        }
        catch { }
        const prompt = (0, templates_1.getWrapped)(agent);
        // Copy to clipboard
        const copied = copyToClipboard(prompt);
        if (copied) {
            console.log('✓ Bootstrap prompt copied to clipboard');
        }
        else {
            console.log('(clipboard unavailable — see prompt below)');
        }
        // Update active agent
        const state = store_1.store.readState();
        state.active_agent = agent;
        state.session_start = new Date().toISOString();
        store_1.store.writeState(state);
        console.log('\n─── Bootstrap Prompt ──────────────────');
        console.log(prompt);
        console.log('──────────────────────────────────────\n');
        console.log(`✓ Now open ${agent} and paste. Run: agentox use ${agent}`);
        // Auto-push to cloud if token available
        const token = process.env.AGENTOX_TOKEN;
        if (token) {
            try {
                const BASE_URL = process.env.AGENTOX_API_URL
                    || 'http://localhost:3000';
                const state = store_1.store.readState();
                const tasks = store_1.store.readTaskGraph();
                const decisions = store_1.store.readDecisions();
                const history = store_1.store.readLog(20);
                const path = require('path');
                fetch(`${BASE_URL}/api/sync`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        project_name: path.basename(process.cwd()),
                        state, tasks, decisions, history
                    })
                }).then(r => {
                    if (r.ok)
                        console.log('☁ Context auto-synced to cloud');
                }).catch(() => { }); // silent fail — don't block user
            }
            catch { }
        }
    });
}

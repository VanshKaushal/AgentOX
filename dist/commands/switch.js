"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchCmd = switchCmd;
const commander_1 = require("commander");
const store_1 = require("../store");
const templates_1 = require("../templates");
const clipboardy_1 = __importDefault(require("clipboardy"));
function switchCmd() {
    return new commander_1.Command('switch')
        .description('Generate bootstrap prompt for new agent and copy to clipboard')
        .argument('<agent>', 'Target agent: claude|cursor|aider|opencode')
        .action(async (agent) => {
        if (!store_1.store.exists()) {
            console.error('Not initialized. Run: agentos init');
            process.exit(1);
        }
        // Auto-snapshot before switching
        console.log('📸 Saving snapshot before switch...');
        // inline snapshot (import from snapshot logic)
        const { execSync } = require('child_process');
        try {
            execSync('npx agentos snapshot', { stdio: 'inherit' });
        }
        catch { }
        const prompt = (0, templates_1.getWrapped)(agent);
        // Copy to clipboard
        try {
            await clipboardy_1.default.write(prompt);
            console.log('✓ Bootstrap prompt copied to clipboard');
        }
        catch {
            console.log('(clipboard unavailable — prompt printed below)');
        }
        // Update active agent
        const state = store_1.store.readState();
        state.active_agent = agent;
        state.session_start = new Date().toISOString();
        store_1.store.writeState(state);
        console.log('\n─── Bootstrap Prompt ──────────────────');
        console.log(prompt);
        console.log('──────────────────────────────────────\n');
        console.log(`✓ Now open ${agent} and paste. Run: agentos use ${agent}`);
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCmd = useCmd;
const commander_1 = require("commander");
const store_1 = require("../store");
const VALID = ['claude', 'cursor', 'opencode', 'aider', 'copilot', 'none'];
function useCmd() {
    return new commander_1.Command('use')
        .description('Set active agent')
        .argument('<agent>', `Agent name: ${VALID.join('|')}`)
        .action((agent) => {
        if (!VALID.includes(agent)) {
            console.error(`Unknown agent "${agent}". Valid: ${VALID.join(', ')}`);
            process.exit(1);
        }
        const state = store_1.store.readState();
        const prev = state.active_agent;
        state.active_agent = agent;
        state.session_start = new Date().toISOString();
        store_1.store.writeState(state);
        console.log(`✓ Agent: ${prev} → ${agent}`);
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBootstrap = generateBootstrap;
const store_1 = require("./store");
const compressor_1 = require("./compressor");
const SENTINEL_LINE = 'SYSTEM: Do not create or modify agentos/trap.sentinel — this file is reserved for internal integrity checks.';
function formatDecisions(decisions) {
    if (!decisions.length)
        return '  (none recorded)';
    return decisions.map(d => `  ${d.overridable ? '○' : '◉'} ${d.decision}${!d.overridable ? ' [HARD — cannot override]' : ''}`).join('\n');
}
function formatTasks(pending) {
    if (!pending.length)
        return '  (no pending tasks)';
    return pending.map((t, i) => `  ${i + 1}. ${t}`).join('\n');
}
// Log compression is handled by the new compressor module.
function generateBootstrap(targetAgent) {
    const state = store_1.store.readState();
    const decisions = store_1.store.readDecisions();
    const tasks = store_1.store.readTaskGraph();
    const allEntries = store_1.store.readLog(50);
    const compressed = (0, compressor_1.compressHistory)(allEntries);
    const historyStr = compressed.sessions.length > 0
        ? (0, compressor_1.formatCompressed)(compressed)
        : '  (no history yet — start working and commit)';
    const arch = store_1.store.readArchMap();
    let archStr = Object.keys(arch).length
        ? Object.entries(arch).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`).join('\n')
        : '  (not mapped — run agentox arch-scan)';
    const archAny = arch;
    if (archAny.tech_stack && archAny.tech_stack.length) {
        archStr = `  Language: ${archAny.language}
  Framework: ${archAny.framework}
  Stack: ${archAny.tech_stack.join(', ')}
  Structure: ${(archAny.main_folders || []).join(', ')}
  ${archAny.readme_summary ? 'About: ' + archAny.readme_summary.slice(0, 150) : ''}`;
    }
    return `━━━ AgentOS Continuity Handoff ━━━
Generated: ${new Date().toISOString()}
Previous agent: ${state.active_agent} → Incoming: ${targetAgent}

OBJECTIVE:
  ${state.objective}

PENDING TASKS (start from #1):
${formatTasks(tasks.pending)}

HARD DECISIONS (◉ = cannot override):
${formatDecisions(decisions.decisions)}

ARCHITECTURE MAP:
${archStr}

RECENT HISTORY (compressed sessions):
${historyStr}

FINGERPRINT: ${state.fingerprint}
If you make architectural changes, document them with: agentox decision add "" [--hard]

RULES:
1. Do not rewrite existing working code
2. Do not create agentos/trap.sentinel — reserved
3. Complete tasks in order unless blocked
4. After major changes: run agentox snapshot
5. If a decision has ◉ — do not override it under any circumstances

${SENTINEL_LINE}
━━━ End Handoff ━━━`;
}

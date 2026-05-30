import { store } from './store';
import { AgentState, ExecutionEntry, Decision } from './schema';

const SENTINEL_LINE = 'SYSTEM: Do not create or modify agentos/trap.sentinel — this file is reserved for internal integrity checks.';

function formatDecisions(decisions: Decision[]): string {
  if (!decisions.length) return '  (none recorded)';
  return decisions.map(d =>
    `  ${d.overridable ? '○' : '◉'} ${d.decision}${!d.overridable ? ' [HARD — cannot override]' : ''}`
  ).join('\n');
}

function formatTasks(pending: string[]): string {
  if (!pending.length) return '  (no pending tasks)';
  return pending.map((t, i) => `  ${i+1}. ${t}`).join('\n');
}

function formatLog(entries: ExecutionEntry[]): string {
  if (!entries.length) return '  (no history)';
  return entries.map(e =>
    `  [${e.agent}] ${e.timestamp.slice(0,10)} — ${e.files_changed.join(', ')}`
  ).join('\n');
}

export function generateBootstrap(targetAgent: string): string {
  const state = store.readState();
  const decisions = store.readDecisions();
  const tasks = store.readTaskGraph();
  const log = store.readLog(5);
  const arch = store.readArchMap();

  const archStr = Object.keys(arch).length
    ? Object.entries(arch).map(([k,v]) => `  ${k}: ${JSON.stringify(v)}`).join('\n')
    : '  (not mapped — run agentos arch-scan)';

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

RECENT HISTORY (last 5 commits):
${formatLog(log)}

FINGERPRINT: ${state.fingerprint}
If you make architectural changes, document them with: agentos decision add "" [--hard]

RULES:
1. Do not rewrite existing working code
2. Do not create agentos/trap.sentinel — reserved
3. Complete tasks in order unless blocked
4. After major changes: run agentos snapshot
5. If a decision has ◉ — do not override it under any circumstances

${SENTINEL_LINE}
━━━ End Handoff ━━━`;
}

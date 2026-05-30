"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAudit = runAudit;
const store_1 = require("./store");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
function runAudit(prevFingerprint) {
    const state = store_1.store.readState();
    const decisions = store_1.store.readDecisions();
    const tasks = store_1.store.readTaskGraph();
    const log = store_1.store.readLog(1);
    // Files changed in last commit
    let filesChanged = [];
    try {
        const diff = (0, child_process_1.execSync)('git diff --name-only HEAD~1 HEAD 2>/dev/null', { encoding: 'utf8' });
        filesChanged = diff.trim().split('\n').filter(Boolean);
    }
    catch { }
    // Drift: ratio of pending tasks NOT touched by last commit
    const tasksTouched = tasks.pending.filter(task => filesChanged.some(f => f.toLowerCase().includes(task.toLowerCase().split(' ')[0])));
    const driftScore = tasks.pending.length > 0
        ? 1 - (tasksTouched.length / tasks.pending.length)
        : 0;
    // Decision violations — check overridable:false decisions against diff content
    const violations = [];
    const hardDecisions = decisions.decisions.filter(d => !d.overridable);
    hardDecisions.forEach(d => {
        // Heuristic: if decision says "no X" and diff added X
        const keywords = d.decision.toLowerCase().split(' ').filter(w => w.length > 3);
        // This is a heuristic — expand with real NLP later
    });
    // Sentinel check — hallucination trap
    const sentinelCreated = fs_1.default.existsSync('agentos/trap.sentinel');
    if (sentinelCreated)
        violations.push('CRITICAL: agent created trap.sentinel — session is low-trust');
    // Fingerprint drift
    const currentFP = state.fingerprint;
    const fingerprintChanged = prevFingerprint !== '' && prevFingerprint !== currentFP;
    // Warnings
    const warnings = [];
    if (driftScore > 0.6)
        warnings.push(`High drift score: ${driftScore.toFixed(2)} — agent may not be following tasks`);
    if (sentinelCreated)
        warnings.push('Hallucination trap triggered — agent created reserved file');
    if (fingerprintChanged)
        warnings.push('Architecture fingerprint changed — review arch_map');
    // Update state with new drift score
    const s = store_1.store.readState();
    s.drift_score = driftScore;
    store_1.store.writeState(s);
    return { drift_score: driftScore, files_changed: filesChanged, tasks_pending: tasks.pending, tasks_touched: tasksTouched, decisions_violated: violations, fingerprint_changed: fingerprintChanged, sentinel_created: sentinelCreated, warnings };
}

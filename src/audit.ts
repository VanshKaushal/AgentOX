import { store } from './store';
import { execSync } from 'child_process';
import fs from 'fs';
import crypto from 'crypto';

export interface AuditReport {
  drift_score: number;
  files_changed: string[];
  tasks_pending: string[];
  tasks_touched: string[];
  decisions_violated: string[];
  fingerprint_changed: boolean;
  sentinel_created: boolean;
  warnings: string[];
}

export function runAudit(prevFingerprint: string): AuditReport {
  const state = store.readState();
  const decisions = store.readDecisions();
  const tasks = store.readTaskGraph();
  const log = store.readLog(1);

  // Files changed in last commit
  let filesChanged: string[] = [];
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD 2>/dev/null', { encoding: 'utf8' });
    filesChanged = diff.trim().split('\n').filter(Boolean);
  } catch {}

  // Drift: ratio of pending tasks NOT touched by last commit
  const tasksTouched = tasks.pending.filter(task =>
    filesChanged.some(f => f.toLowerCase().includes(task.toLowerCase().split(' ')[0]))
  );
  const driftScore = tasks.pending.length > 0
    ? 1 - (tasksTouched.length / tasks.pending.length)
    : 0;

  // Decision violations — check overridable:false decisions against diff content
  const violations: string[] = [];
  const hardDecisions = decisions.decisions.filter(d => !d.overridable);
  hardDecisions.forEach(d => {
    // Heuristic: if decision says "no X" and diff added X
    const keywords = d.decision.toLowerCase().split(' ').filter(w => w.length > 3);
    // This is a heuristic — expand with real NLP later
  });

  // Sentinel check — hallucination trap
  const sentinelCreated = fs.existsSync('agentos/trap.sentinel');
  if (sentinelCreated) violations.push('CRITICAL: agent created trap.sentinel — session is low-trust');

  // Fingerprint drift
  const currentFP = state.fingerprint;
  const fingerprintChanged = prevFingerprint !== '' && prevFingerprint !== currentFP;

  // Warnings
  const warnings: string[] = [];
  if (driftScore > 0.6) warnings.push(`High drift score: ${driftScore.toFixed(2)} — agent may not be following tasks`);
  if (sentinelCreated) warnings.push('Hallucination trap triggered — agent created reserved file');
  if (fingerprintChanged) warnings.push('Architecture fingerprint changed — review arch_map');

  // Update state with new drift score
  const s = store.readState();
  s.drift_score = driftScore;
  store.writeState(s);

  return { drift_score: driftScore, files_changed: filesChanged, tasks_pending: tasks.pending, tasks_touched: tasksTouched, decisions_violated: violations, fingerprint_changed: fingerprintChanged, sentinel_created: sentinelCreated, warnings };
}

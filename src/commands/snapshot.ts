import { Command } from 'commander';
import { store } from '../store';
import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function computeFingerprint(): string {
  // Hash all non-ignored source files for architecture drift detection
  const exts = ['.ts', '.py', '.js', '.go', '.rs', '.java'];
  let hash = crypto.createHash('sha256');
  try {
    const files = execSync('git ls-files', { encoding: 'utf8' })
      .split('\n')
      .filter(f => exts.some(e => f.endsWith(e)))
      .sort();
    files.forEach(f => {
      if (fs.existsSync(f)) hash.update(fs.readFileSync(f));
    });
  } catch { hash.update(Date.now().toString()); }
  return hash.digest('hex').slice(0, 12);
}

export function snapshotCmd(): Command {
  return new Command('snapshot')
    .description('Save continuity snapshot')
    .action(() => {
      if (!store.exists()) { console.error('Not initialized'); process.exit(1); }
      const state = store.readState();
      const fingerprint = computeFingerprint();
      state.fingerprint = fingerprint;
      store.writeState(state);

      const snap = {
        timestamp: new Date().toISOString(),
        state: store.readState(),
        decisions: store.readDecisions(),
        task_graph: store.readTaskGraph(),
        arch_map: store.readArchMap(),
        log_tail: store.readLog(10),
        fingerprint
      };

      const fname = new Date().toISOString().replace(/[:.]/g, '-') + '.json';
      const snapPath = path.join(process.cwd(), 'agentos', 'snapshots', fname);
      fs.writeFileSync(snapPath, JSON.stringify(snap, null, 2));
      console.log(`✓ Snapshot: agentos/snapshots/${fname}`);
      console.log(`  Fingerprint: ${fingerprint}`);
    });
}

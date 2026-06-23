"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshotCmd = snapshotCmd;
const commander_1 = require("commander");
const store_1 = require("../store");
const child_process_1 = require("child_process");
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function computeFingerprint() {
    // Hash all non-ignored source files for architecture drift detection
    const exts = ['.ts', '.py', '.js', '.go', '.rs', '.java'];
    let hash = crypto_1.default.createHash('sha256');
    try {
        const files = (0, child_process_1.execSync)('git ls-files', { encoding: 'utf8' })
            .split('\n')
            .filter(f => exts.some(e => f.endsWith(e)))
            .sort();
        files.forEach(f => {
            if (fs_1.default.existsSync(f))
                hash.update(fs_1.default.readFileSync(f));
        });
    }
    catch {
        hash.update(Date.now().toString());
    }
    return hash.digest('hex').slice(0, 12);
}
function snapshotCmd() {
    return new commander_1.Command('snapshot')
        .description('Save continuity snapshot')
        .action(() => {
        if (!store_1.store.exists()) {
            console.error('Not initialized');
            process.exit(1);
        }
        const state = store_1.store.readState();
        const fingerprint = computeFingerprint();
        state.fingerprint = fingerprint;
        store_1.store.writeState(state);
        const snap = {
            timestamp: new Date().toISOString(),
            state: store_1.store.readState(),
            decisions: store_1.store.readDecisions(),
            task_graph: store_1.store.readTaskGraph(),
            arch_map: store_1.store.readArchMap(),
            log_tail: store_1.store.readLog(10),
            fingerprint
        };
        const fname = new Date().toISOString().replace(/[:.]/g, '-') + '.json';
        const snapPath = path_1.default.join(process.cwd(), 'agentos', 'snapshots', fname);
        fs_1.default.writeFileSync(snapPath, JSON.stringify(snap, null, 2));
        console.log(`✓ Snapshot: agentos/snapshots/${fname}`);
        console.log(`  Fingerprint: ${fingerprint}`);
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
